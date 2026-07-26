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
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' });
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
      const res = await fetch('/api/analytics/auth', { cache: 'no-store' });
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
    if (!passcode.trim()) return;
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await fetch('/api/analytics/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode }),
      });

      if (res.ok) {
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
      await fetch('/api/analytics/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setData({ sessions: [], pageviews: [], events: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/data', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData({
          sessions: json.sessions || [],
          pageviews: json.pageviews || [],
          events: json.events || [],
        });
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
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
    window.open('/api/analytics/backup', '_blank');
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all recorded analytics logs?')) return;
    setIsClearing(true);
    try {
      await fetch('/api/analytics/data', { method: 'DELETE' });
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
      <div className="w-full max-w-md mx-auto px-4 py-16 text-neutral-100 flex flex-col items-center">
        <div className="w-full p-8 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-6">
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
            Tip: Passcode defaults to <code className="text-neutral-300">admin123</code>. Set <code className="text-neutral-300">ANALYTICS_PASSWORD</code> in <code className="text-neutral-300">.env.local</code> to customize.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 text-neutral-100 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition duration-150 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleBackup}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition duration-150"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Create Backup
          </button>
          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition duration-150 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition duration-150"
          >
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            Lock
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        />
      </div>

      {/* Filter & Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
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
        <div className="relative w-full sm:w-64">
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

      {activeTab === 'leads' && <LeadsTab leads={leads} />}

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
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  isCode?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl bg-neutral-900/60 backdrop-blur-md border ${borderColor} bg-gradient-to-br ${gradient} flex flex-col justify-between gap-3`}
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

function LeadsTab({ leads }: { leads: any[] }) {
  if (leads.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 flex flex-col items-center gap-3">
        <UserCheck className="w-10 h-10 text-emerald-500 animate-pulse" />
        <p className="text-sm font-medium text-neutral-200">No email leads collected yet.</p>
        <p className="text-xs text-neutral-400">
          When visitors fill in the welcome toast form, their email and reason will be saved permanently here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
      <table className="w-full text-left text-xs text-neutral-300">
        <thead className="bg-neutral-900/80 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800">
          <tr>
            <th className="px-4 py-3">Visitor / Email</th>
            <th className="px-4 py-3">Reason / Category</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">IP Address</th>
            <th className="px-4 py-3">Lead Source</th>
            <th className="px-4 py-3">Date Submitted</th>
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
                {new Date(lead.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      <div className="p-12 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 text-neutral-400 flex flex-col items-center gap-3">
        <Globe className="w-10 h-10 text-neutral-600 animate-pulse" />
        <p className="text-sm">No visitor sessions recorded yet.</p>
        <p className="text-xs text-neutral-400">
          Navigate around your portfolio pages to generate live telemetry!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
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
                    <span>{new Date(session.last_seen_at).toLocaleTimeString()}</span>
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
                  {new Date(event.created_at).toLocaleTimeString()}
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
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/40">
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
              <td className="px-4 py-3 text-neutral-400">{new Date(pv.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 text-xs">
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
              <p className="font-medium text-neutral-200">{session.language}</p>
            </div>
            <div>
              <span className="text-neutral-400">First Seen</span>
              <p className="font-medium text-neutral-200">
                {new Date(session.started_at).toLocaleTimeString()}
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
                <div key={i} className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800 text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono text-indigo-300 font-medium">{pv.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                    <span>Stay: {pv.stay_duration}s</span>
                    <span>Scroll: {pv.max_scroll_percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text Selections */}
          {events.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                Selected Words in Session ({events.length})
              </h4>
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/40 text-xs">
                    <p className="font-mono text-purple-200">"{e.selected_text}"</p>
                    <div className="mt-1 text-[10px] text-neutral-400 flex justify-between">
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
