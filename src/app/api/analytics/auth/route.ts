import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, cleanPassword, verifyAdminPassword, issueToken, TOKEN_TTL_MS } from '@/lib/analyticsAuth';
import { getClientIp, rateLimit, tooManyRequests } from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

// Brute-force protection: max 10 login attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 15 * 60_000;


export async function GET(req: NextRequest) {
  const isAuthenticated = verifyAuth(req);
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`auth:${getClientIp(req)}`, LOGIN_RATE_LIMIT, LOGIN_RATE_WINDOW_MS);
  if (!rl.ok) {
    return tooManyRequests(rl.retryAfterSec);
  }

  try {
    const body = await req.json();
    const password = cleanPassword(body.password);

    if (password && verifyAdminPassword(password)) {
      // Mint a stateless signed token. The password itself is NEVER returned
      // to the client or stored in cookies.
      const token = issueToken();

      const response = NextResponse.json({
        success: true,
        message: 'Authenticated successfully',
        token,
      });

      // Set secure HTTP-only cookie holding the signed token (7-day expiry)
      response.cookies.set('analytics_auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: Math.floor(TOKEN_TTL_MS / 1000),
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid admin passcode' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}


export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('analytics_auth');
  return response;
}
