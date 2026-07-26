import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword, verifyAuth } from '@/lib/analyticsAuth';

export async function GET(req: NextRequest) {
  const isAuthenticated = verifyAuth(req);
  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminPassword = getAdminPassword();

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
      
      // Set secure HTTP-only cookie valid for 7 days
      response.cookies.set('analytics_auth', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid admin passcode' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('analytics_auth');
  return response;
}
