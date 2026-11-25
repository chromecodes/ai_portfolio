import crypto from 'crypto';
import type { NextRequest } from 'next/server';

/**
 * Analytics dashboard authentication.
 *
 * Security model:
 * - The admin password is ONLY accepted by POST /api/analytics/auth to mint a token.
 * - Tokens are stateless HMAC-signed strings with an expiry — they are NOT the
 *   password itself, so leaking a token (cookie, localStorage, ?token= URL) never
 *   reveals the password and tokens self-expire after 7 days.
 * - All comparisons are constant-time (timing-safe).
 * - Fails closed when no password is configured.
 */

const TOKEN_PREFIX = 'anx';
export const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function cleanPassword(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '');
}

export function getAdminPassword(): string {
  // Fail closed: no default password in any environment.
  return cleanPassword(
    process.env.ANALYTICS_PASSWORD || process.env.ANALYTICS_SECRET_KEY || ''
  );
}

function hmac(payload: string): string {
  return crypto
    .createHmac('sha256', getAdminPassword())
    .update(payload)
    .digest('base64url');
}

/** Issues a stateless, self-expiring, HMAC-signed token. Never returns the password. */
export function issueToken(): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${TOKEN_PREFIX}.${expires}`;
  return `${payload}.${hmac(payload)}`;
}

/** Verifies a signed token's structure, signature, and expiry. */
export function isValidToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) return false;

  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires <= 0 || Date.now() > expires) return false;

  const expected = hmac(`${parts[0]}.${parts[1]}`);
  const provided = parts[2];
  if (provided.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

/** Constant-time password check used only by the login endpoint. */
export function verifyAdminPassword(candidate: string): boolean {
  const adminPassword = getAdminPassword();
  if (!adminPassword) return false;
  return safeEqual(cleanPassword(candidate), adminPassword);
}

export function verifyAuth(req: NextRequest): boolean {
  if (!getAdminPassword()) return false;

  // 1. Header 'x-analytics-auth' (signed token)
  const headerToken = cleanPassword(req.headers.get('x-analytics-auth'));
  if (headerToken && isValidToken(headerToken)) {
    return true;
  }

  // 2. 'Authorization: Bearer <signed token>'
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = cleanPassword(authHeader.substring(7));
    if (bearerToken && isValidToken(bearerToken)) {
      return true;
    }
  }

  // 3. Cookie 'analytics_auth' (signed token)
  const cookieRaw = req.cookies.get('analytics_auth')?.value;
  if (cookieRaw) {
    let decoded = '';
    try {
      decoded = decodeURIComponent(cookieRaw);
    } catch {
      decoded = '';
    }
    if (isValidToken(cleanPassword(cookieRaw)) || isValidToken(cleanPassword(decoded))) {
      return true;
    }
  }

  // 4. Query parameter 'token' (signed token only — never the password —
  //    kept for direct backup downloads; expires with the token)
  const queryToken = cleanPassword(req.nextUrl?.searchParams?.get('token'));
  if (queryToken && isValidToken(queryToken)) {
    return true;
  }

  return false;
}
