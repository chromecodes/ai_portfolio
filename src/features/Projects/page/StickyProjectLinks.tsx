"use client";

import React from "react";
import { Icons } from "@/Icon";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { openBackgroundTab } from "@/utils/openBackgroundTab";

interface StickyProjectLinksProps {
  repoUrl?: string;
  demoUrl?: string;
}

export default function StickyProjectLinks({ repoUrl, demoUrl }: StickyProjectLinksProps) {
  const strings = useLanguageStore((state) => state.strings as Record<string, string>);

  if (!repoUrl && !demoUrl) return null;

  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col gap-3">
      {repoUrl && (
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="GitHub Repository"
          onClick={(e) => openBackgroundTab(repoUrl, e)}
          className="group flex items-center bg-secondary-background/80 hover:bg-secondary-background backdrop-blur-md border border-borderColor hover:border-accent-color/60 p-3 rounded-full shadow-lg hover:shadow-accent-color/10 transition-all duration-300 text-font-color hover:text-accent-color cursor-pointer"
        >
          <Icons.github className="w-5 h-5 shrink-0 text-accent-color group-hover:scale-110 transition-transform duration-200" />
          <span className="max-w-0 opacity-0  group-hover:max-w-[160px] group-hover:px-3 group-hover:inline group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xs font-bold tracking-wide">
            {strings.github || "GitHub Repository"}
          </span>
        </a>
      )}

      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          aria-label="Live Demo"
          onClick={(e) => openBackgroundTab(demoUrl, e)}
          className="group flex items-center gap-2.5 bg-secondary-background/80 hover:bg-secondary-background backdrop-blur-md border border-borderColor hover:border-accent-color/60 p-3 rounded-full shadow-lg hover:shadow-accent-color/10 transition-all duration-300 text-font-color hover:text-accent-color cursor-pointer"
        >
          <Icons.externalLink className="w-5 h-5 shrink-0 text-accent-color group-hover:scale-110 transition-transform duration-200" />
          <span className="max-w-0 opacity-0 group-hover:max-w-[160px] group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xs font-bold tracking-wide pr-1">
            {strings.liveDemo || "Live Demo"}
          </span>
        </a>
      )}
    </div>
  );
}
