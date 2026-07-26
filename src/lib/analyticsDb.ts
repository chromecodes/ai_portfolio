import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

let supabase: SupabaseClient<any, "public", any> | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('Supabase client initialization failed:', e);
  }
} else {
  console.error('Supabase URL or Key is missing. Analytics will not be saved.');
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
  started_at: string;
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
  metadata?: Record<string, any>;
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
  if (!supabase) return;
  try {
    const { error } = await supabase.from('analytics_sessions').upsert([session], { onConflict: 'id' });
    if (error) console.error('Supabase saveSession error:', error.message);
  } catch (err) {
    console.error('Supabase saveSession exception:', err);
  }
}

export async function savePageview(pageview: PageviewEvent): Promise<void> {
  if (!supabase) return;
  if (!pageview.id) {
    pageview.id = 'pv_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }
  try {
    const { error } = await supabase.from('analytics_pageviews').insert([pageview]);
    if (error) console.error('Supabase savePageview error:', error.message);
  } catch (err) {
    console.error('Supabase savePageview exception:', err);
  }
}

export async function saveEvent(event: InteractionEvent): Promise<void> {
  if (!supabase) return;
  if (!event.id) {
    event.id = 'evt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
  }
  try {
    const { error } = await supabase.from('analytics_events').insert([event]);
    if (error) console.error('Supabase saveEvent error:', error.message);
  } catch (err) {
    console.error('Supabase saveEvent exception:', err);
  }
}

export async function getAnalyticsData() {
  if (!supabase) return { sessions: [], pageviews: [], events: [] };
  try {
    const [sessionsRes, pageviewsRes, eventsRes] = await Promise.all([
      supabase.from('analytics_sessions').select('*').order('last_seen_at', { ascending: false }).limit(100),
      supabase.from('analytics_pageviews').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(500),
    ]);

    return {
      sessions: sessionsRes.data || [],
      pageviews: pageviewsRes.data || [],
      events: eventsRes.data || [],
    };
  } catch (err) {
    console.error('Error querying Supabase analytics data:', err);
    return { sessions: [], pageviews: [], events: [] };
  }
}

export async function findLeadByEmail(email: string): Promise<LeadSubmission | null> {
  if (!supabase) return null;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const { data, error } = await supabase
      .from('lead_submissions')
      .select('*')
      .eq('email', normalizedEmail)
      .limit(1);

    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (e) {
    console.error('Supabase findLeadByEmail exception:', e);
  }
  return null;
}

export async function saveLeadSubmission(lead: LeadSubmission, sessionId?: string): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('lead_submissions')
      .upsert([lead], { onConflict: 'email' });
    if (error) console.error('Supabase saveLeadSubmission error:', error.message);

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
      if (sessionUpdateError) console.error('Failed to retroactively attach lead to session:', sessionUpdateError.message);
    }
  } catch (err) {
    console.error('Supabase saveLeadSubmission exception:', err);
  }
}

export async function getLeadSubmissions(): Promise<LeadSubmission[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('lead_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.error('Error querying Supabase leads:', err);
  }
  return [];
}

export async function clearAnalyticsData() {
  if (!supabase) return;
  try {
    await Promise.all([
      supabase.from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('analytics_pageviews').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('analytics_sessions').delete().neq('id', '0'),
    ]);
  } catch (e) {
    console.error('Supabase clearAnalyticsData failed:', e);
  }
}
