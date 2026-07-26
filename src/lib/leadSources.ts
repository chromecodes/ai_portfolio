/**
 * Lead Source Configuration & Utility
 * Easily add or modify lead sources for portfolio link tracking.
 */

export interface LeadSourceConfig {
  key: string;
  name: string;
  aliases: string[]; // Query param values or referrer keywords matching this source
}

export const KNOWN_LEAD_SOURCES: LeadSourceConfig[] = [
    {
    key: 'dm',
    name: 'DM',
    aliases: ['dm', 'DM'],
  },
  {
    key: 'resume',
    name: 'Resume / CV',
    aliases: ['resume', 'cv', 'pdf', 'resume_link'],
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    aliases: ['linkedin', 'linkedin.com', 'lnkd.in'],
  },
  {
    key: 'naukrigulf',
    name: 'NaukriGulf',
    aliases: ['naukrigulf', 'naukrigulf.com', 'naukri'],
  },
  {
    key: 'indeed',
    name: 'Indeed',
    aliases: ['indeed', 'indeed.com'],
  },
  {
    key: 'x',
    name: 'X (Twitter)',
    aliases: ['x', 'twitter', 't.co', 'x.com', 'twitter.com'],
  },
  {
    key: 'instagram',
    name: 'Instagram',
    aliases: ['instagram', 'instagram.com', 'ig', 'instagr.am'],
  },
  {
    key: 'github',
    name: 'GitHub',
    aliases: ['github', 'github.com'],
  },
];

/**
 * Detect lead source from URL search params & HTTP referrer.
 * Checks params: `ref`, `src`, `source`, `utm_source`, `from`.
 */
export function detectLeadSource(searchParams: URLSearchParams, referrer?: string): string {
  const urlParam =
    searchParams.get('ref') ||
    searchParams.get('src') ||
    searchParams.get('source') ||
    searchParams.get('utm_source') ||
    searchParams.get('from');

  if (urlParam) {
    const paramLower = urlParam.trim().toLowerCase();
    for (const source of KNOWN_LEAD_SOURCES) {
      if (source.aliases.some((alias) => paramLower.includes(alias))) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('portfolio_lead_source', source.name);
        return source.name;
      }
    }
    // Custom URL param fallback
    const customSource = urlParam.charAt(0).toUpperCase() + urlParam.slice(1);
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('portfolio_lead_source', customSource);
    return customSource;
  }

  if (referrer) {
    const refLower = referrer.trim().toLowerCase();
    for (const source of KNOWN_LEAD_SOURCES) {
      if (source.aliases.some((alias) => refLower.includes(alias))) {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('portfolio_lead_source', source.name);
        return source.name;
      }
    }
  }

  // Fallback to previously stored session source if they navigated away from landing page
  if (typeof sessionStorage !== 'undefined') {
    const stored = sessionStorage.getItem('portfolio_lead_source');
    if (stored) return stored;
  }

  return 'Direct / Organic';
}
