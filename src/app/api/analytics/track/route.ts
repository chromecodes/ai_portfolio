import { NextRequest, NextResponse } from 'next/server';
import { saveSession, savePageview, saveEvent, VisitorSession } from '@/lib/analyticsDb';
import { getClientIp, isSameOrigin, rateLimit, tooManyRequests, normalizeIp } from '@/lib/apiSecurity';
import { resolveGeo } from '@/lib/geo';

export const dynamic = 'force-dynamic';

// Telemetry is chatty (pageviews, selections, clicks, visibility) but 120/min
// per IP is far above legitimate usage — floods get cut off here.
const TRACK_RATE_LIMIT = 120;
const TRACK_RATE_WINDOW_MS = 60_000;

const SESSION_ID_RE = /^[A-Za-z0-9_-]{6,64}$/;
const COOKIE_ID_RE = /^[\w-]{1,64}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim + cap any incoming string field. Returns undefined for empty/non-string. */
function safeStr(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return s ? s.slice(0, max) : undefined;
}

/** Clamp any incoming number into [min, max]; non-numbers become `fallback`. */
function safeNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(n, max));
}

function parseUserAgent(uaString: string) {
  let deviceType = 'Desktop';
  if (/mobile/i.test(uaString)) deviceType = 'Mobile';
  else if (/ipad|tablet/i.test(uaString)) deviceType = 'Tablet';

  let browser = 'Unknown';
  if (/chrome|crios/i.test(uaString) && !/edg/i.test(uaString)) browser = 'Chrome';
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = 'Safari';
  else if (/firefox|fxios/i.test(uaString)) browser = 'Firefox';
  else if (/edg/i.test(uaString)) browser = 'Edge';

  let os = 'Unknown OS';
  if (/windows/i.test(uaString)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
  else if (/android/i.test(uaString)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';
  else if (/linux/i.test(uaString)) os = 'Linux';

  return { deviceType, browser, os };
}

export async function POST(req: NextRequest) {
  // Rate limit FIRST — protects the database before any parsing/persistence
  const rl = rateLimit(`track:${getClientIp(req)}`, TRACK_RATE_LIMIT, TRACK_RATE_WINDOW_MS);
  if (!rl.ok) {
    return tooManyRequests(rl.retryAfterSec);
  }

  // Block cross-site browser requests (CSRF); non-browser clients (no Origin) pass
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();

    const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
    if (!SESSION_ID_RE.test(sessionId)) {
      return NextResponse.json({ error: 'Valid session ID is required' }, { status: 400 });
    }

    // ---- Sanitize all payload fields (length caps, charsets, ranges) ----
    const eventType = safeStr(body.type, 40) || '';
    const routePath = safeStr(body.path, 200) || '/';
    const title = safeStr(body.title, 200);
    const referrer = safeStr(body.referrer, 500) || '';
    const leadSource = safeStr(body.leadSource, 100) || 'Direct / Organic';
    const visitorEmailRaw = safeStr(body.visitorEmail, 254);
    const visitorEmail = visitorEmailRaw && EMAIL_RE.test(visitorEmailRaw) ? visitorEmailRaw : undefined;
    const visitorName = safeStr(body.visitorName, 100);
    const stayDuration = safeNum(body.stayDuration, 0, 172_800, 0); // ≤ 48h
    const maxScrollPercentage = safeNum(body.maxScrollPercentage, 0, 100, 0);
    const selectedText = safeStr(body.selectedText, 500);
    const selectedContext = safeStr(body.selectedContext, 200) || '';
    const screenResolution = safeStr(body.screenResolution, 20) || 'Unknown';
    const language = safeStr(body.language, 10) || 'en';

    const cookieIdRaw = req.cookies.get('portfolio_lead_cookie')?.value || body.cookieId;
    const cookieId = typeof cookieIdRaw === 'string' && COOKIE_ID_RE.test(cookieIdRaw) ? cookieIdRaw : undefined;

    const rawIp = normalizeIp(getClientIp(req));
    const ua = req.headers.get('user-agent') || '';
    const { deviceType, browser, os } = parseUserAgent(ua);
    const now = new Date().toISOString();

    // Resolve Location via CDN headers or cached IP Geolocation lookup
    const { country, city, region } = (await resolveGeo(rawIp, req.headers)) ?? {
      country: 'Local / Development',
      city: 'Developer Studio',
      region: 'Local',
    };

    let cookieExpiry: string | undefined = undefined;
    if (cookieId) {
      // Calculate 90 days expiry string for database mapping
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 90);
      cookieExpiry = expDate.toISOString();
    }

    // 1. Always update/upsert Session
    const sessionObj: VisitorSession = {
      id: sessionId,
      cookie_id: cookieId,
      cookie_expiry: cookieExpiry,
      ip_address: rawIp,
      country,
      city,
      region,
      device_type: deviceType,
      browser,
      os,
      screen_resolution: screenResolution,
      language,
      lead_source: leadSource,
      ...(visitorName ? { visitor_name: visitorName } : {}),
      ...(visitorEmail ? { visitor_email: visitorEmail } : {}),
      // started_at intentionally omitted — see saveSession() integrity fix
      last_seen_at: now,
    };


    await saveSession(sessionObj);

    // 2. Process event type
    if (eventType === 'pageview') {
      await savePageview({
        session_id: sessionId,
        path: routePath,
        title: title || 'Portfolio',
        referrer,
        stay_duration: stayDuration,
        max_scroll_percentage: maxScrollPercentage,
        created_at: now,
      });
    } else if (eventType === 'text_selection') {
      if (selectedText) {
        await saveEvent({
          session_id: sessionId,
          path: routePath,
          event_type: 'text_selection',
          selected_text: selectedText,
          selected_context: selectedContext,
          created_at: now,
        });
      }
    } else if (eventType === 'outbound_click') {
      await saveEvent({
        session_id: sessionId,
        path: routePath,
        event_type: 'click',
        selected_text: selectedText || 'Outbound Link',
        selected_context: selectedContext,
        created_at: now,
      });
    } else if (eventType === 'toast_dropoff') {
      await saveEvent({
        session_id: sessionId,
        path: routePath,
        event_type: 'click',
        selected_text: 'Toast Dismissed (Drop-off)',
        selected_context: selectedContext || 'Toast Closed',
        created_at: now,
      });
    } else if (eventType === 'toast_step') {
      await saveEvent({
        session_id: sessionId,
        path: routePath,
        event_type: 'click',
        selected_text: `Toast Category Selected: ${selectedText || 'Unknown'}`,
        selected_context: 'Toast Flow Step',
        created_at: now,
      });
    } else if (eventType === 'inactivity_event') {
      await saveEvent({
        session_id: sessionId,
        path: routePath,
        event_type: 'route_change',
        selected_text: 'Tab Inactive / Hidden',
        selected_context: selectedContext || 'Tab Hidden',
        created_at: now,
      });
    } else if (eventType === 'language_change') {
      await saveEvent({
        session_id: sessionId,
        path: routePath,
        event_type: 'language_change',
        selected_text: selectedText || 'Unknown Language',
        selected_context: 'Language Switcher',
        created_at: now,
      });
    }


    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in /api/analytics/track:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
