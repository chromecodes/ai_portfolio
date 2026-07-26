import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.warn('Supabase client initialization fallback:', e);
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
  event_type: 'text_selection' | 'scroll' | 'click' | 'route_change';
  selected_text?: string;
  selected_context?: string;
  scroll_depth?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

interface LocalAnalyticsData {
  sessions: Record<string, VisitorSession>;
  pageviews: PageviewEvent[];
  events: InteractionEvent[];
}

const LOCAL_DB_PATH = path.join(process.cwd(), '.data', 'analytics.json');

function ensureLocalFile(): LocalAnalyticsData {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      const initial: LocalAnalyticsData = { sessions: {}, pageviews: [], events: [] };
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { sessions: {}, pageviews: [], events: [] };
  }
}

function writeLocalFile(data: LocalAnalyticsData) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write local analytics fallback:', e);
  }
}

export async function saveSession(session: VisitorSession): Promise<void> {
  if (supabase) {
    try {
      const { error } = await (supabase as any)
        .from('analytics_sessions')
        .upsert(session, { onConflict: 'id' });
      if (!error) return;
      console.warn('Supabase upsert session error, using fallback:', error.message);
    } catch (err) {
      console.warn('Supabase exception, using fallback:', err);
    }
  }

  // Local fallback
  const db = ensureLocalFile();
  db.sessions[session.id] = {
    ...db.sessions[session.id],
    ...session,
    last_seen_at: new Date().toISOString(),
  };
  writeLocalFile(db);
}

export async function savePageview(pageview: PageviewEvent): Promise<void> {
  if (supabase) {
    try {
      const { error } = await (supabase as any).from('analytics_pageviews').insert([pageview]);
      if (!error) return;
      console.warn('Supabase insert pageview error, using fallback:', error.message);
    } catch (err) {
      console.warn('Supabase pageview exception:', err);
    }
  }

  // Local fallback
  const db = ensureLocalFile();
  db.pageviews.unshift(pageview);
  // Cap at last 2000 pageviews
  if (db.pageviews.length > 2000) db.pageviews = db.pageviews.slice(0, 2000);
  writeLocalFile(db);
}

export async function saveEvent(event: InteractionEvent): Promise<void> {
  if (supabase) {
    try {
      const { error } = await (supabase as any).from('analytics_events').insert([event]);
      if (!error) return;
      console.warn('Supabase insert event error, using fallback:', error.message);
    } catch (err) {
      console.warn('Supabase event exception:', err);
    }
  }

  // Local fallback
  const db = ensureLocalFile();
  db.events.unshift(event);
  if (db.events.length > 5000) db.events = db.events.slice(0, 5000);
  writeLocalFile(db);
}

export async function getAnalyticsData() {
  if (supabase) {
    try {
      const [sessionsRes, pageviewsRes, eventsRes] = await Promise.all([
        (supabase as any).from('analytics_sessions').select('*').order('last_seen_at', { ascending: false }).limit(100),
        (supabase as any).from('analytics_pageviews').select('*').order('created_at', { ascending: false }).limit(300),
        (supabase as any).from('analytics_events').select('*').order('created_at', { ascending: false }).limit(500),
      ]);

      if (!sessionsRes.error && !pageviewsRes.error && !eventsRes.error) {
        return {
          sessions: sessionsRes.data || [],
          pageviews: pageviewsRes.data || [],
          events: eventsRes.data || [],
        };
      }
    } catch (err) {
      console.warn('Error querying Supabase analytics data, using fallback:', err);
    }
  }

  // Fallback
  const db = ensureLocalFile();
  const sessionList = Object.values(db.sessions).sort(
    (a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
  );

  return {
    sessions: sessionList,
    pageviews: db.pageviews,
    events: db.events,
  };
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

export async function findLeadByEmail(email: string): Promise<LeadSubmission | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (supabase) {
    try {
      const { data, error } = await (supabase as any)
        .from('lead_submissions')
        .select('*')
        .eq('email', normalizedEmail)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0];
      }
    } catch (e) {
      console.warn('Supabase findLeadByEmail fallback:', e);
    }
  }

  const emails = ensureEmailsFile();
  const found = emails.find((e) => e.email.toLowerCase() === normalizedEmail);
  return found || null;
}


const EMAILS_DB_PATH = path.join(process.cwd(), '.data', 'emails.json');

function ensureEmailsFile(): LeadSubmission[] {
  try {
    const dir = path.dirname(EMAILS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(EMAILS_DB_PATH)) {
      fs.writeFileSync(EMAILS_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(EMAILS_DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeEmailsFile(emails: LeadSubmission[]) {
  try {
    const dir = path.dirname(EMAILS_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(EMAILS_DB_PATH, JSON.stringify(emails, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write emails local file:', e);
  }
}

export async function saveLeadSubmission(lead: LeadSubmission): Promise<void> {
  if (supabase) {
    try {
      const { error } = await (supabase as any)
        .from('lead_submissions')
        .upsert([lead], { onConflict: 'id' });
      if (!error) return;
      console.warn('Supabase upsert lead error, using local fallback:', error.message);
    } catch (err) {
      console.warn('Supabase lead exception:', err);
    }
  }

  // Permanent local fallback (never cleared by clearAnalyticsData)
  const emails = ensureEmailsFile();
  const index = emails.findIndex((e) => e.id === lead.id || e.email.toLowerCase() === lead.email.toLowerCase());
  if (index >= 0) {
    emails[index] = { ...emails[index], ...lead };
  } else {
    emails.unshift(lead);
  }
  writeEmailsFile(emails);
}


export async function getLeadSubmissions(): Promise<LeadSubmission[]> {
  if (supabase) {
    try {
      const { data, error } = await (supabase as any)
        .from('lead_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Error querying Supabase leads, using local fallback:', err);
    }
  }

  const emails = ensureEmailsFile();
  return emails.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function clearAnalyticsData() {
  if (supabase) {
    try {
      await Promise.all([
        (supabase as any).from('analytics_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        (supabase as any).from('analytics_pageviews').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        (supabase as any).from('analytics_sessions').delete().neq('id', '0'),
      ]);
    } catch (e) {
      console.warn('Supabase clear failed:', e);
    }
  }

  writeLocalFile({ sessions: {}, pageviews: [], events: [] });
}

