"use client";

import { FC } from "react";

interface IProjectTerminalUIProps {
  projectName?: string;
  corePillars?: string[];
}

export const ProjectTerminalUI: FC<IProjectTerminalUIProps> = ({
  projectName = "Easy Forms",
  corePillars = ["Form Builder", "Analytics", "Real-Time"],
}) => {
  const sanitizeName = projectName.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="relative w-full rounded-2xl border border-borderColor bg-secondary-background text-font-color-muted font-mono text-[11px] md:text-xs shadow-md p-4 min-h-[280px] flex flex-col justify-between overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-borderColor/60 pb-3 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-muted-foreground text-[10px] tracking-wider">
          bash - {sanitizeName}-service.ts
        </span>
      </div>

      {/* Terminal Body */}
      <div className="grow space-y-1.5 text-secondary-accent-color leading-relaxed font-mono">
        <p className="text-muted-foreground">
          # Initializing fullstack application service...
        </p>
        <p className="text-accent-color">
          $ npx {sanitizeName} --init --architecture=fullstack
        </p>
        <p className="text-font-color">
          🚀 Service initialized: <span className="font-bold text-accent-color">{projectName}</span>
        </p>
        <p className="text-muted-foreground">
          [Modules]{" "}
          <span className="text-font-color">
            {corePillars.join(" • ")}
          </span>
        </p>
        <p className="text-accent-color">
          $ build --services --realtime --export
        </p>
        <p className="text-emerald-500">
          ✓ Serverless API router mounted (/api/v1/forms)
        </p>
        <p className="text-emerald-500">
          ✓ Redis Pub/Sub real-time stream connected
        </p>
        <p className="text-emerald-500">
          ✓ Multi-format document exporter pipeline active
        </p>
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between border-t border-borderColor/60 pt-3 mt-3 text-muted-foreground text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Status: Operational
        </span>
        <span>Branch: main</span>
      </div>
    </div>
  );
};
