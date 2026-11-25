import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function sanitizeEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

// Warn once instead of spamming the logs on every request
let warnedMissingCreds = false;

export function getSupabaseClient(): SupabaseClient | null {
  const rawUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  // SECURITY: server-side writes REQUIRE the service role key (it bypasses the
  // locked-down RLS policies). Never fall back to the public anon/publishable
  // key — under the current RLS setup it cannot read or write, and silently
  // using it would hide total data loss behind a healthy-looking response.
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    '';

  const supabaseUrl = sanitizeEnv(rawUrl).replace(/\/+$/, '');
  const supabaseKey = sanitizeEnv(rawKey);

  if (!supabaseUrl || !supabaseKey) {
    if (!warnedMissingCreds) {
      warnedMissingCreds = true;
      console.error(
        '[Supabase Analytics] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set — analytics and lead persistence are DISABLED. Set them in your environment variables.'
      );
    }
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (e) {
    console.error('[Supabase Analytics] Client initialization failed:', e);
    return null;
  }
}



export interface VisitorSession {
  id: string;
  cookie_id?: string;
  cookie_expiry?: string;
  ip_address: string;
  country?: string;
  city?: string;
  region?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  language?: string;
  lead_source?: string;
  visitor_name?: string;
  visitor_email?: string;
  // Optional: never sent on upsert. On INSERT the DB default (NOW()) applies;
  // on UPDATE the original first-seen value is preserved. See saveSession().
  started_at?: string;
  last_seen_at: string;
}

export interface PageviewEvent {
  id?: string;
  session_id: string;
  path: string;
  title?: string;
  referrer?: string;
  stay_duration?: number;
  max_scroll_percentage?: number;
  created_at: string;
}

export interface InteractionEvent {
  id?: string;
  session_id: string;
  path: string;
  event_type: 'text_selection' | 'scroll' | 'click' | 'route_change' | 'language_change';
  selected_text?: string;
  selected_context?: string;
  scroll_depth?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface LeadSubmission {
  id?: string;
  cookie_id?: string;
  cookie_expiry?: string;
  name?: string;
  email: string;
  reason: string;
  ip_address: string;
  location?: string;
  source?: string;
  created_at: string;
}

export async function saveSession(session: VisitorSession): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    // INTEGRITY FIX: strip started_at from the upsert payload. Sending it would
    // overwrite the original first-seen timestamp on EVERY event (making
    // started_at === last_seen_at and corrupting all duration metrics).
    // Omitted columns: DB default NOW() on INSERT, untouched on UPDATE.
    const upsertPayload = { ...session };
    delete upsertPayload.started_at;

    const { error } = await supabase.from('analytics_sessions').upsert([upsertPayload], { onConflict: 'id' });
    if (error) {
      console.error('[Supabase saveSession error]:', error.message, error.details || '');
    }
  } catch (err) {
    console.error('[Supabase saveSession exception]:', err);
  }
}

export async function savePageview(pageview: PageviewEvent): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  if (!pageview.id) {
    pageview.id = 'pv_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }
  try {
    const { error } = await supabase.from('analytics_pageviews').insert([pageview]);
    if (error) {
      console.error('[Supabase savePageview error]:', error.message, error.details || '');
    }
  } catch (err) {
    console.error('[Supabase savePageview exception]:', err);
  }
}

export async function saveEvent(event: InteractionEvent): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  if (!event.id) {
    event.id = 'evt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }
  try {
    const { error } = await supabase.from('analytics_events').insert([event]);
    if (error) {
      console.error('[Supabase saveEvent error]:', error.message, error.details || '');
    }
  } catch (err) {
    console.error('[Supabase saveEvent exception]:', err);
  }
}

export async function getAnalyticsData(): Promise<{
  sessions: VisitorSession[];
  pageviews: PageviewEvent[];
  events: InteractionEvent[];
  error?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      sessions: [],
      pageviews: [],
      events: [],
      error:
        'Database connection not initialized. Verify that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Vercel Environment Variables.',
    };
  }

  try {
    const [sessionsRes, pageviewsRes, eventsRes] = await Promise.all([
      supabase.from('analytics_sessions').select('*').order('last_seen_at', { ascending: false }).limit(100),
      supabase.from('analytics_pageviews').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    // Generic message for the admin UI — raw Supabase errors (table names,
    // SQL details) are logged server-side only, never returned to the client.
    const hasError = Boolean(sessionsRes.error || pageviewsRes.error || eventsRes.error);
    const errorMsg = hasError ? 'Failed to query some analytics data. Check server logs for details.' : undefined;

    if (sessionsRes.error) {
      console.error('[Supabase getAnalyticsData sessions error]:', sessionsRes.error.message);
    }
    if (pageviewsRes.error) {
      console.error('[Supabase getAnalyticsData pageviews error]:', pageviewsRes.error.message);
    }
    if (eventsRes.error) {
      console.error('[Supabase getAnalyticsData events error]:', eventsRes.error.message);
    }

    return {
      sessions: sessionsRes.data || [],
      pageviews: pageviewsRes.data || [],
      events: eventsRes.data || [],
      error: errorMsg,
    };
  } catch (err: unknown) {
    console.error('[Supabase getAnalyticsData exception]:', err);
    return {
      sessions: [],
      pageviews: [],
      events: [],
      error: 'Failed to query analytics data from database. Check server logs for details.',
    };
  }
}


export async function findLeadByEmail(email: string): Promise<LeadSubmission | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const { data, error } = await supabase
      .from('lead_submissions')
      .select('*')
      .eq('email', normalizedEmail)
      .limit(1);

    if (error) {
      console.error('[Supabase findLeadByEmail error]:', error.message);
    }

    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (e) {
    console.error('[Supabase findLeadByEmail exception]:', e);
  }
  return null;
}

export async function saveLeadSubmission(lead: LeadSubmission, sessionId?: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('lead_submissions')
      .upsert([lead], { onConflict: 'email' });
    if (error) {
      console.error('[Supabase saveLeadSubmission error]:', error.message);
    }

    if (sessionId && lead.cookie_id) {
      // If we have the exact session ID from the browser, update it directly
      await supabase
        .from('analytics_sessions')
        .update({ visitor_name: lead.name, visitor_email: lead.email, cookie_id: lead.cookie_id })
        .eq('id', sessionId);
    } else if (lead.cookie_id) {
      // Fallback: Retroactively attach this identity to any anonymous sessions sharing this cookie
      const { error: sessionUpdateError } = await supabase
        .from('analytics_sessions')
        .update({ visitor_name: lead.name, visitor_email: lead.email })
        .eq('cookie_id', lead.cookie_id);
      if (sessionUpdateError) {
        console.error('[Supabase saveLeadSubmission session update error]:', sessionUpdateError.message);
      }
    }
  } catch (err) {
    console.error('[Supabase saveLeadSubmission exception]:', err);
  }
}

export async function getLeadSubmissions(): Promise<LeadSubmission[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('lead_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase getLeadSubmissions error]:', error.message);
    }

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.error('[Supabase getLeadSubmissions exception]:', err);
  }
  return [];
}

export async function clearAnalyticsData() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  try {
    await Promise.all([
      supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('analytics_pageviews').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('analytics_sessions').delete().neq('id', '0'),
    ]);
  } catch (e) {
    console.error('[Supabase clearAnalyticsData failed]:', e);
  }
}

