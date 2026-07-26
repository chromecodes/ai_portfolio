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

  // Send payload non-blockingly using sendBeacon or keepalive fetch
  const sendTelemetry = (payload: Record<string, any>) => {
    if (typeof window === 'undefined') return;
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics/track', blob);
    } else {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  };

  const calculateScrollPercentage = (): number => {
    const scrollContainer = document.querySelector('.overflow-auto') || document.querySelector('main');
    if (scrollContainer) {
      const scrollTop = scrollContainer.scrollTop;
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      if (scrollHeight > 0) {
        return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
      }
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 0;
    return Math.min(100, Math.round((scrollTop / docHeight) * 100));
  };

  // 1. Route Change & Pageview tracking (Batched on exit/route switch to save Vercel requests)
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    if (!sessionId) return;

    const leadSource = detectLeadSource(searchParams, document.referrer);

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
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
    });
  }, [pathname, searchParams]);

  // 2. Scroll Depth tracking (passive local recording, no API calls during scrolling)
  useEffect(() => {
    const handleScroll = () => {
      const current = calculateScrollPercentage();
      if (current > maxScrollRef.current) {
        maxScrollRef.current = current;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const scrollContainer = document.querySelector('.overflow-auto') || document.querySelector('main');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
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
          ? `${parentElement.tagName.toLowerCase()}${parentElement.id ? '#' + parentElement.id : ''}${
              parentElement.className ? '.' + String(parentElement.className).split(' ')[0] : ''
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

  // 4. Page exit/unload stay duration tracking
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
