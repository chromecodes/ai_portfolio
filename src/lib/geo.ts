/**
 * Shared IP geolocation with an in-memory TTL cache.
 *
 * RELIABILITY FIX: previously every telemetry event and lead submission made a
 * blocking external HTTP call to ip-api.com (free tier: 45 req/min, plain HTTP).
 * The cache collapses repeated lookups per IP to one call per day.
 */

export interface GeoLocation {
  country: string;
  city: string;
  region: string;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // successful lookups: 24h
const NEGATIVE_TTL_MS = 10 * 60 * 1000; // failed lookups: retry after 10 min
const MAX_ENTRIES = 5_000;

interface CacheEntry {
  geo: GeoLocation | null;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

/** 1. Prefer free, zero-latency CDN geo headers (Vercel, Cloudflare, Fastly). */
function geoFromHeaders(headers: Headers): GeoLocation | null {
  const country = headers.get('x-vercel-ip-country') || headers.get('cf-ipcountry');
  if (!country) return null;

  const rawCity = headers.get('x-vercel-ip-city') || headers.get('cf-ipcity');
  const region = headers.get('x-vercel-ip-country-region');

  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  return {
    country,
    city: city || region || 'Unknown',
    region: region || 'Standard',
  };
}

/** 2. Fallback: ip-api.com lookup (dev environments / non-CDN hosting). */
async function geoFromIpApi(ip: string, isLocal: boolean): Promise<GeoLocation | null> {
  try {
    // For local dev, calling without an IP queries the machine's public IP
    const url = isLocal ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${encodeURIComponent(ip)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const geo = await res.json();
      if (geo.status === 'success') {
        return {
          country: String(geo.country || 'Unknown').slice(0, 100),
          city: String(geo.city || 'Unknown').slice(0, 100),
          region: String(geo.regionName || geo.region || 'Unknown').slice(0, 100),
        };
      }
    }
  } catch (err) {
    console.warn('Geo IP lookup failed:', err);
  }
  return null;
}

/**
 * Resolves visitor geolocation. Returns null when nothing is available —
 * callers decide their own fallback. CDN headers bypass the cache entirely.
 */
export async function resolveGeo(ip: string, headers: Headers): Promise<GeoLocation | null> {
  const fromHeaders = geoFromHeaders(headers);
  if (fromHeaders) return fromHeaders;

  const isLocal = !ip || ip === 'unknown' || ip.includes('Localhost') || ip === '127.0.0.1' || ip === '::1';
  const cacheKey = isLocal ? '__local__' : ip;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.geo;
  }

  const geo = await geoFromIpApi(ip, isLocal);

  // Keep the cache bounded
  if (cache.size > MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expiresAt < now) cache.delete(k);
    }
    if (cache.size > MAX_ENTRIES) cache.clear();
  }

  cache.set(cacheKey, {
    geo,
    expiresAt: Date.now() + (geo ? CACHE_TTL_MS : NEGATIVE_TTL_MS),
  });

  return geo;
}
