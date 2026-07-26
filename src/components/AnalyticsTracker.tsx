'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { detectLeadSource } from '@/lib/leadSources';

const ONE_HOUR_MS = 60 * 60 * 1000;

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  const storedId = localStorage.getItem('portfolio_analytics_sid');
  const storedExp = localStorage.getItem('portfolio_analytics_sid_exp');
  const now = Date.now();

  if (storedId && storedExp && now < parseInt(storedExp, 10)) {
    localStorage.setItem('portfolio_analytics_sid_exp', (now + ONE_HOUR_MS).toString());
    return storedId;
  }

  const newId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + now;
  localStorage.setItem('portfolio_analytics_sid', newId);
  localStorage.setItem('portfolio_analytics_sid_exp', (now + ONE_HOUR_MS).toString());
  return newId;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const maxScrollRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>(pathname);
  const lastSelectedTextRef = useRef<string>('');

  // Helper to extract portfolio_lead_cookie from document.cookie
  const getLeadCookieId = (): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(/(?:^|; )portfolio_lead_cookie=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : undefined;
  };

  // Send payload non-blockingly using keepalive fetch
  const sendTelemetry = (payload: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    const cookieId = getLeadCookieId();
    const body = JSON.stringify({ ...payload, cookieId });
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => { });
  };

  // 1. Route Change & Pageview tracking (Batched on exit/route switch to save Vercel requests)
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const leadSource = detectLeadSource(searchParams, document.referrer);
    const visitorEmail = searchParams.get('email') || searchParams.get('visitor_email') || undefined;
    const visitorName = searchParams.get('name') || searchParams.get('visitor_name') || undefined;

    // On route change: flush stats for the previous route
    if (currentPathRef.current !== pathname) {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const finalScroll = Math.max(maxScrollRef.current, calculateScrollPercentage());

      sendTelemetry({
        sessionId,
        type: 'pageview',
        path: currentPathRef.current,
        stayDuration: duration,
        maxScrollPercentage: finalScroll,
        leadSource,
        visitorEmail,
        visitorName,
      });

      startTimeRef.current = Date.now();
      maxScrollRef.current = 0;
      currentPathRef.current = pathname;
      lastSelectedTextRef.current = '';
    }

    // Report entry pageview
    sendTelemetry({
      sessionId,
      type: 'pageview',
      path: pathname,
      title: document.title,
      referrer: document.referrer,
      leadSource,
      visitorEmail,
      visitorName,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    });

    // Auto-create lead submission & 90-day cookie if visitor arrives with both email & name params in URL
    if (visitorEmail && (visitorName)) {
      const finalName = visitorName;
      const hasCookie = typeof document !== 'undefined' && document.cookie.includes('portfolio_lead_cookie=');

      if (!hasCookie) {
        fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: finalName,
            email: visitorEmail,
            reason: `Direct Link (${leadSource})`,
            source: leadSource,
          }),
        }).catch((err) => console.warn('Auto lead capture error:', err));
      }
    }
  }, [pathname, searchParams]);


  const calculateScrollPercentage = (): number => {
    // 1. Try finding custom scrollable container in layout (`.overflow-auto`, `[data-scroll-container]`, `main`)
    const containers = Array.from(document.querySelectorAll('.overflow-auto, main, [data-scroll-container]'));
    for (const container of containers) {
      const el = container as HTMLElement;
      if (el.scrollHeight > el.clientHeight && el.clientHeight > 0) {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight - el.clientHeight;
        if (scrollHeight > 0) {
          return Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
        }
      }
    }

    // 2. Fallback to global window/document element scroll
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const docHeight = (document.documentElement.scrollHeight || document.body.scrollHeight || 0) - window.innerHeight;
    if (docHeight <= 0) return 100; // If page content fits on screen without scroll, engagement is 100%
    return Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100)));
  };

  // 2. Scroll Depth tracking (attaches to both window and all scrollable div containers)
  useEffect(() => {
    const handleScroll = () => {
      const current = calculateScrollPercentage();
      if (current > maxScrollRef.current) {
        maxScrollRef.current = current;
      }
    };

    // Calculate initial scroll position immediately
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    const containers = document.querySelectorAll('.overflow-auto, main, [data-scroll-container]');
    containers.forEach((c) => c.addEventListener('scroll', handleScroll, { passive: true }));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      containers.forEach((c) => c.removeEventListener('scroll', handleScroll));
    };
  }, [pathname]);


  // 3. Mouse Text Selection tracking (Debounced & throttled)
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;

    const handleMouseUp = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection) return;

        const text = selection.toString().trim();
        if (text.length < 2 || text.length > 500 || text === lastSelectedTextRef.current) return;

        lastSelectedTextRef.current = text;
        const anchorNode = selection.anchorNode;
        const parentElement = anchorNode?.parentElement;
        const context = parentElement
          ? `${parentElement.tagName.toLowerCase()}${parentElement.id ? '#' + parentElement.id : ''}${parentElement.className ? '.' + String(parentElement.className).split(' ')[0] : ''
          }`
          : 'body';

        const sessionId = getOrCreateSessionId();
        sendTelemetry({
          sessionId,
          type: 'text_selection',
          path: pathname,
          selectedText: text,
          selectedContext: context,
        });
      }, 500);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      clearTimeout(debounceTimer);
    };
  }, [pathname]);

  // 5. Outbound & Social Link Click Tracking (LinkedIn, GitHub, Resume, Email links)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a, button');
      if (!target) return;

      const href = (target as HTMLAnchorElement).href || '';
      const text = (target as HTMLElement).innerText?.trim().slice(0, 100) || target.getAttribute('aria-label') || '';

      const isOutbound = href.startsWith('http') && !href.includes(window.location.hostname);
      const isContactLink = href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('linkedin.com') || href.includes('github.com');

      if (isOutbound || isContactLink) {
        const sessionId = getOrCreateSessionId();
        sendTelemetry({
          sessionId,
          type: 'outbound_click',
          path: pathname,
          selectedText: text,
          selectedContext: href,
        });
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, [pathname]);

  // 6. Tab Inactivity / Exit Intent Tracking (for identified lead cookie sessions)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const cookieId = getLeadCookieId();
        // Track exit/tab hide intent for returning/identified leads
        if (cookieId) {
          const sessionId = getOrCreateSessionId();
          sendTelemetry({
            sessionId,
            type: 'inactivity_event',
            path: pathname,
            selectedContext: 'tab_hidden',
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pathname]);

  // 7. Page exit/unload stay duration tracking
  useEffect(() => {
    const handleUnload = () => {
      const sessionId = getOrCreateSessionId();
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      const finalScroll = Math.max(maxScrollRef.current, calculateScrollPercentage());
      const leadSource = detectLeadSource(searchParams, document.referrer);

      sendTelemetry({
        sessionId,
        type: 'pageview',
        path: pathname,
        stayDuration: duration,
        maxScrollPercentage: finalScroll,
        leadSource,
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname, searchParams]);


  return null;
}
