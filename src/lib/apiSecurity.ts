import type { NextRequest } from 'next/server';

/**
 * Shared API security helpers: client IP extraction, same-origin enforcement,
 * and a lightweight in-memory sliding-window rate limiter.
 *
 * Note: on serverless platforms this limiter is per-instance — it won't stop a
 * fully distributed flood, but it cheaply blocks naive abuse and brute force.
 */

/**
 * Best-effort client IP.
 *
 * TRUST: on Vercel/Cloudflare the platform sets x-real-ip / cf-connecting-ip
 * from the actual TCP connection — prefer those. x-forwarded-for is a
 * fallback; its LAST entry is the one appended by the trusted edge proxy
 * (earlier entries are client-supplied and spoofable).
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    (() => {
      const forwarded = req.headers.get('x-forwarded-for');
      if (!forwarded) return 'unknown';
      const parts = forwarded.split(',');
      return parts[parts.length - 1].trim() || 'unknown';
    })()
  );
}

/** Normalize loopback/unknown IPs to a consistent storage label. */
export function normalizeIp(raw: string): string {
  if (!raw || raw === 'unknown' || raw === '::1' || raw === '127.0.0.1' || raw === '::ffff:127.0.0.1') {
    return '127.0.0.1 (Localhost)';
  }
  return raw;
}

/**
 * Blocks cross-site browser requests (CSRF) on state-changing endpoints.
 * Requests WITHOUT an Origin header (curl, server-to-server) are allowed;
 * browser requests always send Origin on POST, so mismatches are rejected.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    const host =
      req.headers.get('x-forwarded-host') ||
      req.headers.get('host') ||
      req.nextUrl.host;
    return originHost === host;
  } catch {
    return false;
  }
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

/** Sliding-window rate limiter. Returns ok:false with a retry hint once exceeded. */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Lazy cleanup: purge expired buckets; if still oversized, hard-reset.
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Standard 429 response with Retry-After header. */
export function tooManyRequests(retryAfterSec: number): Response {
  return Response.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}
