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
        return source.name;
      }
    }
    // Custom URL param fallback
    return urlParam.charAt(0).toUpperCase() + urlParam.slice(1);
  }

  if (referrer) {
    const refLower = referrer.trim().toLowerCase();
    for (const source of KNOWN_LEAD_SOURCES) {
      if (source.aliases.some((alias) => refLower.includes(alias))) {
        return source.name;
      }
    }
  }

  return 'Direct / Organic';
}
