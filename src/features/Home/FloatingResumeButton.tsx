"use client";

import React from "react";
import { Icons } from "@/Icon";
import useLanguageStore from "@/utils/i18n/useLanguageStore";

interface FloatingResumeButtonProps {
  resumeUrl?: string;
}

export default function FloatingResumeButton({ resumeUrl = "/Hameed_hussain_CV_Software_Engineer.pdf" }: FloatingResumeButtonProps) {
  const strings = useLanguageStore((state) => state.strings as Record<string, string>);

  return (
    <div className="fixed top-24 right-6 z-40 flex flex-col items-end gap-3">
      <a
        href={resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Resume"
        className="group/resume flex items-center bg-secondary-background/80 hover:bg-secondary-background backdrop-blur-md border border-borderColor hover:border-accent-color/60 p-3 rounded-full shadow-lg hover:shadow-accent-color/10 transition-all duration-300 text-font-color hover:text-accent-color cursor-pointer"
      >
        <Icons.fileDown className="w-5 h-5 shrink-0 text-accent-color group-hover/resume:scale-110 transition-transform duration-200" />
        <span className="max-w-0 opacity-0 group-hover/resume:max-w-[160px] group-hover/resume:px-3 group-hover/resume:inline group-hover/resume:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xs font-bold tracking-wide">
          {strings.downloadResume || "Download Resume"}
        </span>
      </a>
    </div>
  );
}
