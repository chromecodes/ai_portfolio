'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { detectLeadSource } from '@/lib/leadSources';
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export interface ToastCategoryOption {
  id: number;
  label: string;
  responseMsg: string;
}

export const DEFAULT_CATEGORIES: ToastCategoryOption[] = [
  {
    id: 1,
    label: 'I am a recruiter',
    responseMsg: 'Have a look at my career, and projects.',
  },
  {
    id: 2,
    label: 'Looking for collaborator',
    responseMsg: 'Take a look at the projects I did or collaborated with.',
  },
  {
    id: 3,
    label: 'Looking for inspiration',
    responseMsg: 'Take your time exploring!',
  },
  {
    id: 4,
    label: 'Just a lurker',
    responseMsg: 'Spotted! Feel free to lurk around silently, but leave a trail if you like!',
  }
  // {
  //   id: 5,
  //   label: 'I need help',
  //   responseMsg: "Hi! It's really great you are reaching out, don't hesitate to drop me an email with details on how I can help you.",
  // },
];

interface LeadWelcomeToastProps {
  delayMs?: number;
  categories?: ToastCategoryOption[];
}

export default function LeadWelcomeToast({
  delayMs = 5000,
  categories = DEFAULT_CATEGORIES,
}: LeadWelcomeToastProps) {
  const searchParams = useSearchParams();
  const strings = useLanguageStore((state) => state.strings as Record<string, string>);

  const localizedDefaultCategories: ToastCategoryOption[] = [
    { id: 1, label: strings.toastCat1Label || 'I am a recruiter', responseMsg: strings.toastCat1Response || 'Have a look at my career, and projects.' },
    { id: 2, label: strings.toastCat2Label || 'Looking for collaborator', responseMsg: strings.toastCat2Response || 'Take a look at the projects I did or collaborated with.' },
    { id: 3, label: strings.toastCat3Label || 'Looking for inspiration', responseMsg: strings.toastCat3Response || 'Take your time exploring!' },
    { id: 4, label: strings.toastCat4Label || 'Just a lurker', responseMsg: strings.toastCat4Response || 'Spotted! Feel free to lurk around silently, but leave a trail if you like!' },
  ];

  const effectiveCategories = categories === DEFAULT_CATEGORIES ? localizedDefaultCategories : categories;
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ToastCategoryOption | null>(null);

  // URL Param name detection
  let urlName = searchParams.get('name') || searchParams.get('visitor_name') || searchParams.get('refname') || '';

  if (typeof sessionStorage !== 'undefined') {
    if (urlName) {
      sessionStorage.setItem('portfolio_lead_name', urlName);
    } else {
      urlName = sessionStorage.getItem('portfolio_lead_name') || '';
    }
  }

  const hasUrlName = Boolean(urlName.trim());

  const [nameInput, setNameInput] = useState(urlName);
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // If already dismissed during this session, do not set timer
    const dismissed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('lead_toast_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      // Check for cookie right before showing, in case it was created during the delay
      const hasLeadCookie = typeof document !== 'undefined' && document.cookie.includes('portfolio_lead_cookie=');
      if (!hasLeadCookie) {
        setIsVisible(true);
      } else {
        setIsDismissed(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);


  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('lead_toast_dismissed', 'true');

    // Report drop-off telemetry (ghost user who closed without submitting email)
    if (typeof window !== 'undefined') {
      const storedSid = localStorage.getItem('portfolio_analytics_sid') || '';
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: storedSid,
          type: 'toast_dropoff',
          selectedContext: selectedCategory ? `Selected: ${selectedCategory.label}` : 'Closed before selection',
        }),
      }).catch(() => { });
    }
  };

  const handleSelectCategory = (cat: ToastCategoryOption) => {
    setSelectedCategory(cat);
    setErrorMsg('');

    // Report category selection step
    if (typeof window !== 'undefined') {
      const storedSid = localStorage.getItem('portfolio_analytics_sid') || '';
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: storedSid,
          type: 'toast_step',
          selectedText: cat.label,
        }),
      }).catch(() => { });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg(strings.toastInvalidEmail || 'Please enter a valid email address.');
      return;
    }

    const finalName = hasUrlName ? urlName : nameInput;
    if (!hasUrlName && !finalName.trim()) {
      setErrorMsg(strings.toastMissingName || 'Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const source = detectLeadSource(searchParams, typeof document !== 'undefined' ? document.referrer : '');
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('portfolio_analytics_sid') : null;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName.trim(),
          email: emailInput.trim(),
          reason: selectedCategory?.label || 'General Inquiry',
          source,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit email');
      }

      setIsSubmitted(true);
      sessionStorage.setItem('lead_toast_dismissed', 'true');

      // Auto hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
    } catch (err: any) {
      setErrorMsg(err.message || strings.toastSubmitError || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/60 shadow-2xl shadow-purple-950/20 text-zinc-100 transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in">
      {/* Header with Close */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
          </span>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            {hasUrlName 
              ? (strings.toastHelloName ? `${strings.toastHelloName} ${urlName}!` : `Hello ${urlName}!`)
              : (strings.toastHelloThere || 'Hello there!')}
          </h4>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800 text-xs"
          aria-label="Close Toast"
        >
          ✕
        </button>
      </div>

      {!isSubmitted ? (
        <>
          {!selectedCategory ? (
            /* STEP 1: Category Selection */
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-200">
                {strings.toastWelcomeMsg || 'Welcome to my portfolio! What brings you here today?'}
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {effectiveCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-purple-900/40 hover:border-purple-500/50 border border-zinc-700/50 text-zinc-200 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{cat.id}. {cat.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400">→</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STEP 2: Response Message & Email Input */
            <div className="space-y-3 animate-in fade-in">
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] text-zinc-400 hover:text-purple-400 flex items-center gap-1 transition-colors"
              >
                {strings.toastChangeOption || '← Change option'}
              </button>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200 text-xs leading-relaxed">
                "{selectedCategory.responseMsg}"
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
                <p className="text-xs text-zinc-300 font-medium">
                  {strings.toastEmailPrompt || "Just drop your email here, I'll shoot you a mail later:"}
                </p>

                {!hasUrlName && (
                  <div>
                    <input
                      type="text"
                      placeholder={strings.toastYourName || "Your Name"}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-800/90 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                      required
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder={strings.toastYourEmail || "your.email@example.com"}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-800/90 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                {errorMsg && <p className="text-[11px] text-red-400">{errorMsg}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (strings.toastSending || 'Sending...') : (strings.toastKeepInTouch || 'Keep in touch →')}
                </button>
              </form>
            </div>
          )}
        </>
      ) : (
        /* SUCCESS CONFIRMATION */
        <div className="py-4 text-center space-y-2 animate-in fade-in">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-base">
            ✓
          </div>
          <h5 className="text-sm font-semibold text-zinc-100">{strings.toastThankYou || 'Thank you!'}</h5>
          <p className="text-xs text-zinc-400">
            {strings.toastSuccessMsg || 'Got it! I will send you an email soon. Enjoy exploring!'}
          </p>
        </div>
      )}
    </div>
  );
}
