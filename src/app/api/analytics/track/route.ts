import { NextRequest, NextResponse } from 'next/server';
import { saveSession, savePageview, saveEvent, VisitorSession } from '@/lib/analyticsDb';

function getIpAddress(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  let ip = '';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '';
  }

  // Normalize IPv6 loopback (::1) and IPv4 loopback (127.0.0.1)
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1 (Localhost)';
  }
  return ip;
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

async function resolveGeoLocation(rawIp: string, reqHeaders: Headers) {
  // 1. Check production CDN headers (Vercel, Cloudflare, Fastly, AWS)
  const headerCountry = reqHeaders.get('x-vercel-ip-country') || reqHeaders.get('cf-ipcountry');
  const headerCity = reqHeaders.get('x-vercel-ip-city') || reqHeaders.get('cf-ipcity');
  const headerRegion = reqHeaders.get('x-vercel-ip-country-region');

  if (headerCountry && headerCity) {
    return {
      country: headerCountry,
      city: headerCity,
      region: headerRegion || 'Standard',
    };
  }

  // 2. Fetch IP Geolocation from ip-api.com API
  try {
    const isLocal = rawIp.includes('Localhost') || rawIp === '127.0.0.1' || rawIp === '::1';
    // For local dev, calling http://ip-api.com/json/ queries the machine's external public IP
    const url = isLocal ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${rawIp}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const geo = await res.json();
      if (geo.status === 'success') {
        return {
          country: geo.country || 'Unknown',
          city: geo.city || 'Unknown',
          region: geo.regionName || geo.region || 'Unknown',
        };
      }
    }
  } catch (err) {
    console.warn('Geo IP lookup fallback failed:', err);
  }

  return {
    country: 'Local / Development',
    city: 'Developer Studio',
    region: 'Local',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      type, // 'session_init' | 'pageview' | 'text_selection' | 'scroll'
      path: routePath,
      title,
      referrer,
      leadSource,
      stayDuration,
      maxScrollPercentage,
      selectedText,
      selectedContext,
      scrollDepth,
      screenResolution,
      language,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const rawIp = getIpAddress(req);
    const ua = req.headers.get('user-agent') || '';
    const { deviceType, browser, os } = parseUserAgent(ua);
    const now = new Date().toISOString();

    // Resolve Location via CDN headers or IP Geolocation API
    const { country, city, region } = await resolveGeoLocation(rawIp, req.headers);

    // 1. Always update/upsert Session
    const sessionObj: VisitorSession = {
      id: sessionId,
      ip_address: rawIp,
      country,
      city,
      region,
      device_type: deviceType,
      browser,
      os,
      screen_resolution: screenResolution || 'Unknown',
      language: language || 'en',
      lead_source: leadSource || 'Direct / Organic',
      started_at: now,
      last_seen_at: now,
    };

    await saveSession(sessionObj);

    // 2. Process event type
    if (type === 'pageview') {
      await savePageview({
        session_id: sessionId,
        path: routePath || '/',
        title: title || 'Portfolio',
        referrer: referrer || '',
        stay_duration: stayDuration || 0,
        max_scroll_percentage: maxScrollPercentage || 0,
        created_at: now,
      });
    } else if (type === 'text_selection') {
      if (selectedText && selectedText.trim().length > 0) {
        await saveEvent({
          session_id: sessionId,
          path: routePath || '/',
          event_type: 'text_selection',
          selected_text: selectedText.trim().slice(0, 500),
          selected_context: selectedContext || '',
          created_at: now,
        });
      }
    } else if (type === 'scroll') {
      await saveEvent({
        session_id: sessionId,
        path: routePath || '/',
        event_type: 'scroll',
        scroll_depth: scrollDepth || 0,
        created_at: now,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error in /api/analytics/track:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
