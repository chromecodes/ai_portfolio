import { NextRequest } from 'next/server';

export function cleanPassword(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

export function getAdminPassword(): string {
  const raw = process.env.ANALYTICS_PASSWORD || process.env.ANALYTICS_SECRET_KEY || 'admin123';
  return cleanPassword(raw);
}

export function verifyAuth(req: NextRequest): boolean {
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;

  // 1. Check HTTP Header 'x-analytics-auth' or 'Authorization: Bearer ...'
  const headerToken = cleanPassword(req.headers.get('x-analytics-auth'));
  if (headerToken && headerToken === adminPassword) {
    return true;
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = cleanPassword(authHeader.substring(7));
    if (bearerToken && bearerToken === adminPassword) {
      return true;
    }
  }

  // 2. Check Cookie 'analytics_auth'
  const cookieRaw = req.cookies.get('analytics_auth')?.value;
  if (cookieRaw) {
    const cookieToken = cleanPassword(cookieRaw);
    let decoded = '';
    try {
      decoded = cleanPassword(decodeURIComponent(cookieRaw));
    } catch {}

    if (cookieToken === adminPassword || decoded === adminPassword) {
      return true;
    }
  }

  // 3. Check Query parameter 'token' or 'password' (useful for direct backup downloads)
  const queryToken = cleanPassword(
    req.nextUrl?.searchParams?.get('token') || req.nextUrl?.searchParams?.get('password')
  );
  if (queryToken && queryToken === adminPassword) {
    return true;
  }

  return false;
}


