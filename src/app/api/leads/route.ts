import { NextRequest, NextResponse } from 'next/server';
import { saveLeadSubmission, getLeadSubmissions, findLeadByEmail } from '@/lib/analyticsDb';
import { verifyAuth } from '@/lib/analyticsAuth';
import { getClientIp, isSameOrigin, rateLimit, tooManyRequests, normalizeIp } from '@/lib/apiSecurity';
import { resolveGeo } from '@/lib/geo';

export const dynamic = 'force-dynamic';

// Lead submission abuse control: 10 submissions/hour per IP
const LEADS_RATE_LIMIT = 10;
const LEADS_RATE_WINDOW_MS = 60 * 60_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_ID_RE = /^[A-Za-z0-9_-]{6,64}$/;

function safeStr(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  // Rate limit FIRST — blocks form spam before any database work
  const rl = rateLimit(`leads:${getClientIp(req)}`, LEADS_RATE_LIMIT, LEADS_RATE_WINDOW_MS);
  if (!rl.ok) {
    return tooManyRequests(rl.retryAfterSec);
  }

  // Block cross-site browser requests (CSRF); non-browser clients (no Origin) pass
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();

    const name = safeStr(body.name, 100);
    const email = safeStr(body.email, 254).toLowerCase();
    const reason = safeStr(body.reason, 1000);
    const source = safeStr(body.source, 100);
    const sessionId = typeof body.sessionId === 'string' && SESSION_ID_RE.test(body.sessionId) ? body.sessionId : undefined;

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const normalizedEmail = email;
    const existingLead = await findLeadByEmail(normalizedEmail);

    // Calculate 90 days expiry date
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 90);
    const cookieExpiryIso = expDate.toISOString();

    // If existing lead exists, reuse/preserve cookie_id or existing lead id
    const cookieId = existingLead?.cookie_id || req.cookies.get('portfolio_lead_cookie')?.value || 'ck_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

    const rawIp = normalizeIp(getClientIp(req));
    const geo = await resolveGeo(rawIp, req.headers);
    const location = geo ? `${geo.city}, ${geo.country}` : 'Unknown Location';
    const now = new Date().toISOString();

    const leadRecord = {
      id: existingLead?.id || 'lead_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      cookie_id: cookieId,
      cookie_expiry: cookieExpiryIso,
      name: name || (existingLead?.name || undefined),
      email: normalizedEmail,
      reason,
      ip_address: rawIp,
      location,
      source: source || existingLead?.source || 'Direct / Unknown',
      // INTEGRITY FIX: preserve the original first-contact timestamp for
      // returning leads instead of overwriting it on every resubmission.
      created_at: existingLead?.created_at || now,
    };

    await saveLeadSubmission(leadRecord, sessionId);

    // Do not echo the full lead record (PII: ip, location) back to an anonymous caller
    const response = NextResponse.json({ success: true, cookieId, cookieExpiry: cookieExpiryIso });

    // Set 90 days HTTP cookie
    response.cookies.set('portfolio_lead_cookie', cookieId, {
      expires: expDate,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Accessible by JS client for analytics key mapping
    });

    return response;
  } catch (err) {
    console.error('Error submitting lead:', err);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Leads contain PII (names, emails, IPs) — admin-only access
  if (!verifyAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized access to leads' }, { status: 401 });
  }

  try {
    const leads = await getLeadSubmissions();
    return NextResponse.json({ success: true, leads });
  } catch (err) {
    console.error('Error fetching leads:', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
