'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Globe,
  MousePointer,
  Scroll,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Search,
  Trash2,
  ChevronRight,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
  Eye,
  Filter,
  Layers,
  FileText,
  Activity,
  Download,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { VisitorSession, PageviewEvent, InteractionEvent } from '@/lib/analyticsDb';

/** Consistent date + time formatting across the dashboard (e.g. "Jan 5, 2026, 14:32:07") */
const formatDateTime = (value?: string | Date): string =>
  value
    ? new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

export default function AnalyticsDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const [data, setData] = useState<{
    sessions: VisitorSession[];
    pageviews: PageviewEvent[];
    events: InteractionEvent[];
  }>({ sessions: [], pageviews: [], events: [] });

  const [loading, setLoading] = useState<boolean>(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sessions' | 'leads' | 'selections' | 'navigation' | 'devices'>('sessions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<VisitorSession | null>(null);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string>('');

  const getStoredToken = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      return (
        sessionStorage.getItem('portfolio_analytics_token') ||
        localStorage.getItem('portfolio_analytics_token') ||
        ''
      );
    } catch {
      return '';
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = getStoredToken();
    return token ? { 'x-analytics-auth': token } : {};
  };

  const fetchLeads = async () => {
    try {
      // Leads endpoint is admin-only — send the signed token
      const res = await fetch('/api/leads', { cache: 'no-store', headers: getAuthHeaders() });
      if (res.ok) {
        const json = await res.json();
        setLeads(json.leads || []);
      }
    } catch (e) {
      console.error('Error fetching leads:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated]);


  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/analytics/auth', {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setIsAuthenticated(json.authenticated);
        if (json.authenticated) {
          fetchAnalytics();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcode.trim();
    if (!cleanInput) return;
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await fetch('/api/analytics/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: cleanInput }),
      });

      if (res.ok) {
        const json = await res.json();
        const token = json.token; // signed token — never the password
        if (token) {
          try {
            sessionStorage.setItem('portfolio_analytics_token', token);
            localStorage.setItem('portfolio_analytics_token', token);
          } catch {}
        }

        setIsAuthenticated(true);
        setPasscode('');
        fetchAnalytics();
      } else {
        const json = await res.json();
        setAuthError(json.error || 'Incorrect passcode');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      try {
        sessionStorage.removeItem('portfolio_analytics_token');
        localStorage.removeItem('portfolio_analytics_token');
      } catch {}

      await fetch('/api/analytics/auth', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setIsAuthenticated(false);
      setData({ sessions: [], pageviews: [], events: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/data', {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.error) {
          setDbError(json.error);
        } else {
          setDbError('');
        }
        setData({
          sessions: json.sessions || [],
          pageviews: json.pageviews || [],
          events: json.events || [],
        });
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
      // Also refresh leads
      await fetchLeads();
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        fetchAnalytics();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);


  const handleBackup = () => {
    const token = getStoredToken();
    const url = token ? `/api/analytics/backup?token=${encodeURIComponent(token)}` : '/api/analytics/backup';
    window.open(url, '_blank');
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all recorded analytics logs?')) return;
    setIsClearing(true);
    try {
      await fetch('/api/analytics/data', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      await fetchAnalytics();
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearing(false);
    }
  };


  // Aggregated Stats (Calculated at top level before early returns)
  const totalVisitors = data.sessions.length;
  const uniqueIps = useMemo(() => new Set(data.sessions.map((s) => s.ip_address)).size, [data.sessions]);
  
  const textSelectionEvents = useMemo(
    () => data.events.filter((e) => e.event_type === 'text_selection' && e.selected_text),
    [data.events]
  );

  const avgScrollDepth = useMemo(() => {
    if (data.pageviews.length === 0) return 0;
    const total = data.pageviews.reduce((acc, p) => acc + (p.max_scroll_percentage || 0), 0);
    return Math.round(total / data.pageviews.length);
  }, [data.pageviews]);

  const topRoute = useMemo(() => {
    const counts: Record<string, number> = {};
    data.pageviews.forEach((p) => {
      counts[p.path] = (counts[p.path] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : '/';
  }, [data.pageviews]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return data.sessions;
    const q = searchQuery.toLowerCase();
    return data.sessions.filter(
      (s) =>
        s.ip_address?.toLowerCase().includes(q) ||
        s.country?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.device_type?.toLowerCase().includes(q) ||
        s.browser?.toLowerCase().includes(q) ||
        s.os?.toLowerCase().includes(q)
    );
  }, [data.sessions, searchQuery]);

  // --------------------------------------------------
  // Render Auth Security Lock Gate if not authenticated
  // --------------------------------------------------
  if (isAuthenticated === null) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
          <span>Verifying security credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-3 py-8 sm:px-4 sm:py-16 text-neutral-100 flex flex-col items-center">
        <div className="w-full p-5 sm:p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-neutral-100">Analytics Security Gate</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Restricted Admin Access. Enter your security passcode to view portfolio telemetry.
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="password"
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/60 transition"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              Unlock Dashboard
            </button>
          </form>

          <div className="text-[11px] text-neutral-400 text-center border-t border-neutral-800/80 pt-4 w-full">
            Access is restricted to the site administrator.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-8 text-neutral-100 flex flex-col gap-5 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4 sm:pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                Visitor Analytics Dashboard
              </h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                Real-time tracking of visitor journeys, scroll engagement, word selections & device specs.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center justify-center gap-2 min-h-9 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleBackup}
            className="flex items-center justify-center gap-2 min-h-9 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition duration-150"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Create Backup
          </button>
          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="flex items-center justify-center gap-2 min-h-9 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition duration-150 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 min-h-9 px-3 sm:px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition duration-150"
          >
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            Lock
          </button>
        </div>
      </div>

      {dbError && (
        <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-red-200">Database Connection Notice</span>
            <span>{dbError}</span>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Visitors"
          value={totalVisitors}
          sub={`Across ${uniqueIps} unique IPs`}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          gradient="from-blue-500/10 to-indigo-500/10"
          borderColor="border-blue-500/20"
        />
        <StatCard
          title="Avg Scroll Depth"
          value={`${avgScrollDepth}%`}
          sub="Page engagement score"
          icon={<Scroll className="w-5 h-5 text-emerald-400" />}
          gradient="from-emerald-500/10 to-teal-500/10"
          borderColor="border-emerald-500/20"
        />
        <StatCard
          title="Word Selections"
          value={textSelectionEvents.length}
          sub="Text highlighted/copied"
          icon={<MousePointer className="w-5 h-5 text-purple-400" />}
          gradient="from-purple-500/10 to-pink-500/10"
          borderColor="border-purple-500/20"
        />
        <StatCard
          title="Top Visited Path"
          value={topRoute}
          sub={`${data.pageviews.length} total views`}
          icon={<FileText className="w-5 h-5 text-amber-400" />}
          gradient="from-amber-500/10 to-orange-500/10"
          borderColor="border-amber-500/20"
          isCode
        />
        <StatCard
          title="Total Pageviews"
          value={data.pageviews.length}
          sub="Recorded page renders"
          icon={<Globe className="w-5 h-5 text-cyan-400" />}
          gradient="from-cyan-500/10 to-blue-500/10"
          borderColor="border-cyan-500/20"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Filter & Tabs Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0 pb-2 lg:pb-0">
          <TabButton
            active={activeTab === 'sessions'}
            onClick={() => setActiveTab('sessions')}
            icon={<Users className="w-4 h-4" />}
            label="Visitor Sessions"
            count={filteredSessions.length}
          />
          <TabButton
            active={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
            icon={<UserCheck className="w-4 h-4 text-emerald-400" />}
            label="Collected Emails & Leads"
            count={leads.length}
          />
          <TabButton
            active={activeTab === 'selections'}
            onClick={() => setActiveTab('selections')}
            icon={<MousePointer className="w-4 h-4" />}
            label="Selected Words & Text"
            count={textSelectionEvents.length}
          />

          <TabButton
            active={activeTab === 'navigation'}
            onClick={() => setActiveTab('navigation')}
            icon={<Layers className="w-4 h-4" />}
            label="Pageviews & Scroll"
            count={data.pageviews.length}
          />
          <TabButton
            active={activeTab === 'devices'}
            onClick={() => setActiveTab('devices')}
            icon={<Monitor className="w-4 h-4" />}
            label="Devices & Specs"
          />
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search IP, location, browser..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'sessions' && (
        <SessionsTab
          sessions={filteredSessions}
          pageviews={data.pageviews}
          events={data.events}
          onSelectSession={(session) => setSelectedSession(session)}
        />
      )}

      {activeTab === 'leads' && <LeadsTab leads={leads} onInspect={(lead) => setSelectedLead(lead)} />}

      {activeTab === 'selections' && <WordSelectionsTab events={textSelectionEvents} />}


      {activeTab === 'navigation' && <NavigationTab pageviews={data.pageviews} />}

      {activeTab === 'devices' && <DevicesTab sessions={data.sessions} />}

      {/* Session Details Drawer / Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          pageviews={data.pageviews.filter((p) => p.session_id === selectedSession.id)}
          events={data.events.filter((e) => e.session_id === selectedSession.id)}
          onClose={() => setSelectedSession(null)}
        />
      )}

      {/* Lead Details Drawer / Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          sessions={data.sessions.filter((s) => s.cookie_id === selectedLead.cookie_id || s.visitor_email === selectedLead.email)}
          pageviews={data.pageviews}
          events={data.events}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}

// --------------------------------------------------
// Sub-components
// --------------------------------------------------

function StatCard({
  title,
  value,
  sub,
  icon,
  gradient,
  borderColor,
  isCode,
  className = '',
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  isCode?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 p-3 sm:p-4 rounded-xl bg-neutral-900/60 backdrop-blur-md border ${borderColor} bg-gradient-to-br ${gradient} flex flex-col justify-between gap-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-neutral-400">{title}</span>
        <div className="p-1.5 rounded-lg bg-neutral-950/40 border border-neutral-800">{icon}</div>
      </div>
      <div>
        <div className={`text-xl font-bold text-neutral-100 ${isCode ? 'font-mono text-base truncate' : ''}`}>
          {value}
        </div>
        <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition duration-150 whitespace-nowrap ${
        active
          ? 'bg-neutral-800 text-white border border-neutral-700 shadow-sm'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
      {typeof count === 'number' && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// --------------------------------------------------
// Tab: Permanent Collected Leads & Emails
// --------------------------------------------------

function MobileCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
      {children}
    </article>
  );
}

function MobileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="shrink-0 text-neutral-500">{label}</span>
      <div className="min-w-0 text-right text-neutral-300 break-words">{children}</div>
    </div>
  );
}

function LeadsTab({ leads, onInspect }: { leads: any[]; onInspect: (lead: any) => void }) {
  if (leads.length === 0) {
    return (
      <div className="p-6 sm:p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 flex flex-col items-center gap-3">
        <UserCheck className="w-10 h-10 text-emerald-500 animate-pulse" />
        <p className="text-sm font-medium text-neutral-200">No email leads collected yet.</p>
        <p className="text-xs text-neutral-400">
          When visitors fill in the welcome toast form, their email and reason will be saved permanently here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {leads.map((lead, idx) => (
          <MobileCard key={lead.id || idx}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-emerald-300 break-all">{lead.email}</p>
                {lead.name && <p className="mt-1 text-xs text-neutral-400">{lead.name}</p>}
              </div>
              <button
                onClick={() => onInspect(lead)}
                className="shrink-0 min-h-9 px-3 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
              >
                Inspect
              </button>
            </div>
            <div className="space-y-2 border-t border-neutral-800/70 pt-3">
              <MobileField label="Reason">
                <span className="text-purple-300">{lead.reason}</span>
              </MobileField>
              <MobileField label="Source">{lead.source || 'Direct / Organic'}</MobileField>
              <MobileField label="Location">{lead.location || 'Unknown'}</MobileField>
              <MobileField label="IP address">
                <span className="font-mono text-[11px] text-neutral-400 break-all">{lead.ip_address}</span>
              </MobileField>
              <MobileField label="Submitted">{formatDateTime(lead.created_at)}</MobileField>
            </div>
          </MobileCard>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
            <tr>
              <th className="px-4 py-3">Visitor / Email</th>
              <th className="px-4 py-3">Reason / Category</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">IP Address</th>
              <th className="px-4 py-3">Lead Source</th>
              <th className="px-4 py-3">Date Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {leads.map((lead, idx) => (
              <tr key={lead.id || idx} className="hover:bg-neutral-800/40 transition duration-150">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-emerald-300">{lead.email}</span>
                    {lead.name && <span className="text-[11px] text-neutral-400">Name: {lead.name}</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {lead.reason}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-400" />
                    <span>{lead.location || 'Unknown'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-neutral-400">{lead.ip_address}</td>
                <td className="px-4 py-3 text-neutral-300">{lead.source || 'Direct / Organic'}</td>
                <td className="px-4 py-3 text-neutral-400">
                  {formatDateTime(lead.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onInspect(lead)}
                    className="px-3 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition text-xs font-medium"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// --------------------------------------------------
// Tab 1: Visitor Sessions Table
// --------------------------------------------------


function SessionsTab({
  sessions,
  pageviews,
  events,
  onSelectSession,
}: {
  sessions: VisitorSession[];
  pageviews: PageviewEvent[];
  events: InteractionEvent[];
  onSelectSession: (s: VisitorSession) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="p-6 sm:p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 flex flex-col items-center gap-3">
        <Globe className="w-10 h-10 text-neutral-600 animate-pulse" />
        <p className="text-sm">No visitor sessions recorded yet.</p>
        <p className="text-xs text-neutral-400">
          Navigate around your portfolio pages to generate live telemetry!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {sessions.map((session) => {
          const sPageviews = pageviews.filter((p) => p.session_id === session.id);
          const sSelections = events.filter((e) => e.session_id === session.id && e.event_type === 'text_selection');
          const maxScroll = Math.max(0, ...sPageviews.map((p) => p.max_scroll_percentage || 0));

          return (
            <MobileCard key={session.id}>
              <div className="min-w-0">
                {session.visitor_name || session.visitor_email ? (
                  <div className="flex items-start gap-2 text-indigo-300">
                    <UserCheck className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm break-words">{session.visitor_name || session.visitor_email}</p>
                      {session.visitor_email && session.visitor_name && (
                        <p className="mt-1 text-[11px] font-mono text-neutral-400 break-all">{session.visitor_email}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="font-mono text-sm font-medium text-neutral-100 break-all">{session.ip_address}</p>
                )}
                <div className="flex items-start gap-1.5 text-[11px] text-neutral-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
                  <span>{session.city || 'Unknown'}, {session.country || 'Unknown'}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-neutral-800/70 pt-3">
                <MobileField label="Source">
                  <span className="text-emerald-300">{session.lead_source || 'Direct / Organic'}</span>
                </MobileField>
                <MobileField label="Device">{session.device_type || 'Desktop'}</MobileField>
                <MobileField label="Browser / OS">{session.browser} on {session.os}</MobileField>
                <MobileField label="IP address">
                  <span className="font-mono text-[11px] text-neutral-400 break-all">{session.ip_address}</span>
                </MobileField>
                <MobileField label="Pageviews">{sPageviews.length} views · {maxScroll}% max scroll</MobileField>
                <MobileField label="Selections">{sSelections.length}</MobileField>
                <MobileField label="Last active">{formatDateTime(session.last_seen_at)}</MobileField>
              </div>

              <button
                onClick={() => onSelectSession(session)}
                className="w-full min-h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-medium"
              >
                <Eye className="w-4 h-4 text-indigo-400" />
                Inspect session
              </button>
            </MobileCard>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
      <table className="w-full text-left text-xs text-neutral-300">
        <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
          <tr>
            <th className="px-4 py-3">Visitor IP & Location</th>
            <th className="px-4 py-3">Lead Source</th>
            <th className="px-4 py-3">Device / OS</th>
            <th className="px-4 py-3">Pageviews</th>
            <th className="px-4 py-3">Selected Words</th>
            <th className="px-4 py-3">Last Active</th>
            <th className="px-4 py-3 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {sessions.map((session) => {
            const sPageviews = pageviews.filter((p) => p.session_id === session.id);
            const sSelections = events.filter((e) => e.session_id === session.id && e.event_type === 'text_selection');
            const maxScroll = Math.max(0, ...sPageviews.map((p) => p.max_scroll_percentage || 0));

            return (
              <tr key={session.id} className="hover:bg-neutral-800/40 transition duration-150">
                {/* IP & Location */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {session.visitor_name || session.visitor_email ? (
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{session.visitor_name || session.visitor_email}</span>
                        {session.visitor_email && session.visitor_name && (
                          <span className="text-[10px] text-neutral-400 font-mono">({session.visitor_email})</span>
                        )}
                      </div>
                    ) : (
                      <span className="font-mono text-neutral-100 font-medium">{session.ip_address}</span>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span>
                        {session.city || 'Unknown'}, {session.country || 'Unknown'}
                      </span>
                      {(session.visitor_name || session.visitor_email) && (
                        <span className="text-[10px] text-neutral-400 font-mono ml-1">· {session.ip_address}</span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Lead Source */}
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-300 border border-emerald-500/20">
                    {session.lead_source || 'Direct / Organic'}
                  </span>
                </td>

                {/* Device / OS */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <DeviceIcon deviceType={session.device_type} />
                    <div className="flex flex-col">
                      <span className="text-neutral-200 font-medium">{session.device_type}</span>
                      <span className="text-[11px] text-neutral-400">
                        {session.browser} on {session.os}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Pageviews */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-medium border border-indigo-500/20">
                      {sPageviews.length} views
                    </span>
                    <span className="text-[11px] text-neutral-400">Max Scroll: {maxScroll}%</span>
                  </div>
                </td>

                {/* Selected Words */}
                <td className="px-4 py-3">
                  {sSelections.length > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium border border-purple-500/20">
                      {sSelections.length} selection{sSelections.length > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-[11px]">None</span>
                  )}
                </td>

                {/* Last Active */}
                <td className="px-4 py-3 text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{formatDateTime(session.last_seen_at)}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onSelectSession(session)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-[11px] transition"
                  >
                    <Eye className="w-3 h-3 text-indigo-400" />
                    Inspect
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </>
  );
}

// --------------------------------------------------
// Tab 2: Word & Text Selections Tab
// --------------------------------------------------

function WordSelectionsTab({ events }: { events: InteractionEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 flex flex-col items-center gap-3">
        <MousePointer className="w-10 h-10 text-neutral-600 animate-bounce" />
        <p className="text-sm">No text selections recorded yet.</p>
        <p className="text-xs text-neutral-400">
          When visitors highlight or copy words on your portfolio, they will show up here live!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event, idx) => (
          <div
            key={event.id || idx}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/30 transition duration-200 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {event.path}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {formatDateTime(event.created_at)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 text-neutral-200 text-xs font-mono break-words leading-relaxed border-l-4 border-l-purple-500">
                "{event.selected_text}"
              </div>
            </div>

            {event.selected_context && (
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span className="text-neutral-400">Element context:</span>
                <code className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                  {event.selected_context}
                </code>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------
// Tab 3: Navigation & Pageviews Tab
// --------------------------------------------------

function NavigationTab({ pageviews }: { pageviews: PageviewEvent[] }) {
  if (pageviews.length === 0) {
    return (
      <div className="p-6 sm:p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400">
        <p className="text-sm text-neutral-200">No pageviews recorded yet.</p>
        <p className="mt-2 text-xs">Navigation and scroll engagement will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {pageviews.map((pv, idx) => (
          <MobileCard key={pv.id || idx}>
            <div>
              <p className="font-mono text-sm font-medium text-indigo-300 break-all">{pv.path}</p>
              <p className="mt-1 text-[11px] text-neutral-500">{formatDateTime(pv.created_at)}</p>
            </div>
            <div className="space-y-3 border-t border-neutral-800/70 pt-3">
              <MobileField label="Stay duration">{pv.stay_duration ? `${pv.stay_duration}s` : '< 1s'}</MobileField>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-neutral-500">Max scroll depth</span>
                  <span className="text-neutral-300">{pv.max_scroll_percentage || 0}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${pv.max_scroll_percentage || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </MobileCard>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
      <table className="w-full text-left text-xs text-neutral-300">
        <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
          <tr>
            <th className="px-4 py-3">Page Path</th>
            <th className="px-4 py-3">Stay Duration</th>
            <th className="px-4 py-3">Max Scroll Depth</th>
            <th className="px-4 py-3">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {pageviews.map((pv, idx) => (
            <tr key={pv.id || idx} className="hover:bg-neutral-800/40">
              <td className="px-4 py-3 font-mono text-indigo-300 font-medium">{pv.path}</td>
              <td className="px-4 py-3 text-neutral-300">{pv.stay_duration ? `${pv.stay_duration}s` : '< 1s'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-neutral-800 h-2 rounded-full overflow-hidden border border-neutral-700">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${pv.max_scroll_percentage || 0}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-neutral-400">{pv.max_scroll_percentage || 0}%</span>
                </div>
              </td>
              <td className="px-4 py-3 text-neutral-400">{formatDateTime(pv.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

// --------------------------------------------------
// Tab 4: Devices & Specs Tab
// --------------------------------------------------

function DevicesTab({ sessions }: { sessions: VisitorSession[] }) {
  const deviceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const type = s.device_type || 'Desktop';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  const browserCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sessions.forEach((s) => {
      const b = s.browser || 'Unknown';
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [sessions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Device Types */}
      <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" /> Device Type Breakdown
        </h3>
        <div className="flex flex-col gap-3">
          {Object.entries(deviceCounts).map(([device, count]) => {
            const percent = sessions.length ? Math.round((count / sessions.length) * 100) : 0;
            return (
              <div key={device} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>{device}</span>
                  <span className="font-mono text-neutral-400">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Browsers */}
      <div className="p-5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" /> Browser Breakdown
        </h3>
        <div className="flex flex-col gap-3">
          {Object.entries(browserCounts).map(([browser, count]) => {
            const percent = sessions.length ? Math.round((count / sessions.length) * 100) : 0;
            return (
              <div key={browser} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-neutral-300">
                  <span>{browser}</span>
                  <span className="font-mono text-neutral-400">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper device icon
function DeviceIcon({ deviceType }: { deviceType?: string }) {
  if (deviceType === 'Mobile') return <Smartphone className="w-4 h-4 text-emerald-400" />;
  if (deviceType === 'Tablet') return <Tablet className="w-4 h-4 text-purple-400" />;
  return <Monitor className="w-4 h-4 text-blue-400" />;
}

// --------------------------------------------------
// Session Inspector Modal
// --------------------------------------------------

function SessionDetailModal({
  session,
  pageviews,
  events,
  onClose,
}: {
  session: VisitorSession;
  pageviews: PageviewEvent[];
  events: InteractionEvent[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Session Journey Details
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">IP: {session.ip_address}</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
          >
            Close
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 sm:p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-400">Lead Source</span>
              <p className="font-medium text-emerald-400">
                {session.lead_source || 'Direct / Organic'}
              </p>
            </div>
            <div>
              <span className="text-neutral-400">Location</span>
              <p className="font-medium text-neutral-200">
                {session.city}, {session.country}
              </p>
            </div>
            <div>
              <span className="text-neutral-400">Device</span>
              <p className="font-medium text-neutral-200">{session.device_type}</p>
            </div>
            <div>
              <span className="text-neutral-400">Browser / OS</span>
              <p className="font-medium text-neutral-200">
                {session.browser} / {session.os}
              </p>
            </div>
            <div>
              <span className="text-neutral-400">Screen Res</span>
              <p className="font-medium text-neutral-200">{session.screen_resolution}</p>
            </div>
            <div>
              <span className="text-neutral-400">Language</span>
              <p className="font-medium text-neutral-200">
                {(() => {
                  try {
                    if (!session.language) return 'Unknown';
                    return new Intl.DisplayNames(['en'], { type: 'language' }).of(session.language) || session.language;
                  } catch {
                    return session.language;
                  }
                })()}
              </p>
            </div>
            <div>
              <span className="text-neutral-400">First Seen</span>
              <p className="font-medium text-neutral-200">
                {formatDateTime(session.started_at)}
              </p>
            </div>
          </div>

          {/* Navigation Flow */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
              Route Timeline ({pageviews.length} pages visited)
            </h4>
            <div className="space-y-2">
              {pageviews.map((pv, i) => (
                <div key={i} className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-400" />
                    <span className="font-mono font-medium text-indigo-300 break-all">{pv.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                    <span>Stay: {pv.stay_duration}s</span>
                    <span>Scroll: {pv.max_scroll_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction Events */}
          {events.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                Interaction Events ({events.length})
              </h4>
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/40 text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-purple-300 capitalize">{e.event_type.replace('_', ' ')}</span>
                      <span className="text-[10px] text-neutral-500">{formatDateTime(e.created_at)}</span>
                    </div>
                    <p className="font-mono text-purple-200">
                      {e.event_type === 'text_selection' ? `"${e.selected_text}"` : e.selected_text}
                    </p>
                    <div className="mt-1 text-[10px] text-neutral-400 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                      <span>Path: {e.path}</span>
                      <span>Context: {e.selected_context}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Lead Inspector Modal
// --------------------------------------------------

function LeadDetailModal({
  lead,
  sessions,
  pageviews,
  events,
  onClose,
}: {
  lead: any;
  sessions: VisitorSession[];
  pageviews: PageviewEvent[];
  events: InteractionEvent[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Lead: {lead.name || lead.email}
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">Email: {lead.email}</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700"
          >
            Close
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 sm:p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-400">Total Sessions</span>
              <p className="font-medium text-indigo-400">{sessions.length}</p>
            </div>
            <div>
              <span className="text-neutral-400">Reason</span>
              <p className="font-medium text-neutral-200">{lead.reason}</p>
            </div>
            <div>
              <span className="text-neutral-400">Primary Source</span>
              <p className="font-medium text-emerald-400">{lead.source || 'Direct'}</p>
            </div>
            <div>
              <span className="text-neutral-400">Location</span>
              <p className="font-medium text-neutral-200">{lead.location}</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
              Session History
            </h4>
            {sessions.length === 0 && (
              <p className="text-xs text-neutral-500 italic">No tracking sessions found for this lead.</p>
            )}
            <div className="space-y-4">
              {sessions.map((session, i) => {
                const sessionPageviews = pageviews.filter((p) => p.session_id === session.id);
                const sessionEvents = events.filter((e) => e.session_id === session.id);
                
                return (
                  <div key={session.id} className="p-4 rounded-lg bg-neutral-950/40 border border-neutral-800">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                      <div>
                        <span className="text-xs font-medium text-neutral-200">Session {sessions.length - i}</span>
                        <span className="text-[10px] text-neutral-500 ml-2">{formatDateTime(session.started_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                         <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700/50">{session.os}</span>
                         <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700/50">{session.browser}</span>
                         <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700/50">{session.device_type}</span>
                         <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700/50" title="Screen Resolution">{session.screen_resolution}</span>
                         <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-400 border border-neutral-700/50" title="Language">
                           {(() => {
                             if (!session.language) return 'Unknown';
                             try {
                               return new Intl.DisplayNames(['en'], { type: 'language' }).of(session.language) || session.language;
                             } catch {
                               return session.language;
                             }
                           })()}
                         </span>
                         <span className="px-2 py-0.5 rounded bg-neutral-800/50 text-[10px] text-neutral-500 font-mono border border-neutral-800">{session.ip_address}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mt-2">
                      {sessionPageviews.map((pv, j) => (
                        <div key={j} className="flex flex-col min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between gap-1 text-[11px]">
                          <div className="flex items-start gap-1.5 min-w-0 text-neutral-300">
                            <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-indigo-500" />
                            <span className="font-mono break-all">{pv.path}</span>
                          </div>
                          <span className="text-neutral-500">Stay: {pv.stay_duration}s, Scroll: {pv.max_scroll_percentage}%</span>
                        </div>
                      ))}
                    </div>

                    {sessionEvents.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-800/50 space-y-1">
                        <span className="text-[10px] text-neutral-500 uppercase">Text Selections ({sessionEvents.length})</span>
                        {sessionEvents.map((e, j) => (
                          <div key={j} className="text-[11px] text-purple-300 font-mono italic">
                            "{e.selected_text}" <span className="text-neutral-500 non-italic text-[10px] ml-1">- {e.path}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
