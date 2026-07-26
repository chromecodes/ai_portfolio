import { NextRequest, NextResponse } from 'next/server';
import { saveLeadSubmission, getLeadSubmissions, findLeadByEmail } from '@/lib/analyticsDb';


function getIpAddress(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  let ip = '';
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else {
    ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || '';
  }

  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1 (Localhost)';
  }
  return ip;
}

async function resolveGeoLocation(rawIp: string, reqHeaders: Headers): Promise<string> {
  const headerCountry = reqHeaders.get('x-vercel-ip-country') || reqHeaders.get('cf-ipcountry');
  const headerCity = reqHeaders.get('x-vercel-ip-city') || reqHeaders.get('cf-ipcity');

  if (headerCountry && headerCity) {
    return `${headerCity}, ${headerCountry}`;
  }

  try {
    const isLocal = rawIp.includes('Localhost') || rawIp === '127.0.0.1' || rawIp === '::1';
    const url = isLocal ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${rawIp}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const geo = await res.json();
      if (geo.status === 'success') {
        return `${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}`;
      }
    }
  } catch (err) {
    console.warn('Geo location resolution failed for lead:', err);
  }

  return 'Unknown Location';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, reason, source } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingLead = await findLeadByEmail(normalizedEmail);

    // Calculate 90 days expiry date
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 90);
    const cookieExpiryIso = expDate.toISOString();

    // If existing lead exists, reuse/preserve cookie_id or existing lead id
    const cookieId = existingLead?.cookie_id || req.cookies.get('portfolio_lead_cookie')?.value || 'ck_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();

    const rawIp = getIpAddress(req);
    const location = await resolveGeoLocation(rawIp, req.headers);
    const now = new Date().toISOString();

    const leadRecord = {
      id: existingLead?.id || 'lead_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now(),
      cookie_id: cookieId,
      cookie_expiry: cookieExpiryIso,
      name: name ? String(name).trim() : (existingLead?.name || undefined),
      email: normalizedEmail,
      reason: String(reason).trim(),
      ip_address: rawIp,
      location,
      source: source || existingLead?.source || 'Direct / Unknown',
      created_at: now,
    };

    await saveLeadSubmission(leadRecord);

    const response = NextResponse.json({ success: true, lead: leadRecord, cookieId, cookieExpiry: cookieExpiryIso });

    // Set 90 days HTTP cookie
    response.cookies.set('portfolio_lead_cookie', cookieId, {
      expires: expDate,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Accessible by JS client for analytics key mapping
    });

    return response;
  } catch (err: any) {
    console.error('Error submitting lead:', err);
    return NextResponse.json({ error: err.message || 'Failed to submit lead' }, { status: 500 });
  }
}


export async function GET() {
  try {
    const leads = await getLeadSubmissions();
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error('Error fetching leads:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch leads' }, { status: 500 });
  }
}
