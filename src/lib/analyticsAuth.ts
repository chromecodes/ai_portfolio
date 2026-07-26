import { NextRequest } from 'next/server';

export function getAdminPassword(): string {
  return process.env.ANALYTICS_PASSWORD || process.env.ANALYTICS_SECRET_KEY || 'admin123';
}

export function verifyAuth(req: NextRequest): boolean {
  const adminPassword = getAdminPassword();
  
  // 1. Check HTTP Header 'x-analytics-auth'
  const headerToken = req.headers.get('x-analytics-auth');
  if (headerToken && headerToken === adminPassword) {
    return true;
  }

  // 2. Check Cookie 'analytics_auth'
  const cookieToken = req.cookies.get('analytics_auth')?.value;
  if (cookieToken && cookieToken === adminPassword) {
    return true;
  }

  return false;
}
