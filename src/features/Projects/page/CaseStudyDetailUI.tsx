"use client";

import { useState } from "react";
import Link from "next/link";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import QuotationBox from "@/components/UI/QuotationBox";
import CareerFooter from "@/features/Career/page/CareerFooter";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { CaseStudyData } from "../types";
export type { CaseStudyData };
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import NavBackSection from "./NavBackSection";
import ProjectFooter from "./ProjectFooter";
import StickyProjectLinks from "./StickyProjectLinks";
import { Icons } from "@/Icon";

export interface ICaseStudyDetailUIProps {
  data: CaseStudyData;
}

export default function CaseStudyDetailUI({ data }: ICaseStudyDetailUIProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const strings = useLanguageStore((state) => state.strings as Record<string, string>);


  const handleCopy = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-6 space-y-12">
      {/* Sticky Floating Repo/Demo Links */}
      <StickyProjectLinks repoUrl={data.project_repo_url} demoUrl={data.project_demo_url} />

      {/* NAVIGATION BACK LINK */}
      <NavBackSection />


      {/* HERO SECTION */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-borderColor shadow-sm space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] tracking-wider font-extrabold uppercase text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Case Study & Architecture Deep Dive
            </span>
            <span className="text-[10px] tracking-wider font-extrabold uppercase text-accent-color px-3 py-1 rounded-full bg-accent-color/10 border border-accent-color/20">
              CQRS + Transactional Outbox
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
            {data.project_name}
          </h1>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-4xl">
            {data.project_context}
          </p>

          {data.project_repo_url && (
            <div className="pt-2 flex items-center gap-3">
              <a
                href={data.project_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary-background hover:bg-secondary-background border border-borderColor hover:border-emerald-400/60 text-xs font-bold text-font-color hover:text-emerald-400 transition-all duration-200 shadow-xs hover:-translate-y-0.5"
              >
                <Icons.github className="w-4 h-4 text-emerald-400" />
                <span>View Source Repository</span>
                <Icons.externalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
          )}
        </div>

        {/* QUOTATION BOX */}
        <QuotationBox
          quote="Isolating operational OLTP transactions from OLAP data warehousing guarantees mathematical integrity and zero latencies during heavy analytical queries."
        />

        {/* CORE PILLARS TAGS & METRIC SNAPSHOT BAR */}
        <div className="grid md:grid-cols-12 gap-6 items-center pt-2 border-t border-borderColor/60">
          <div className="md:col-span-7 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color block">
              Architectural Pillars
            </span>
            <TagsCapsule tags={data.core_pillars} />
          </div>

          <div className="md:col-span-5 flex flex-wrap gap-4 justify-start md:justify-end">
            <div className="bg-primary-background/80 px-4 py-2 rounded-2xl border border-borderColor/80 shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Peak RPS
              </span>
              <span className="text-sm font-mono font-extrabold text-emerald-400">
                {data.benchmarks.sustained_rps}
              </span>
            </div>
            <div className="bg-primary-background/80 px-4 py-2 rounded-2xl border border-borderColor/80 shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Volume
              </span>
              <span className="text-sm font-mono font-extrabold text-teal-400">
                160.9K Ops
              </span>
            </div>
            <div className="bg-primary-background/80 px-4 py-2 rounded-2xl border border-borderColor/80 shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Error Rate
              </span>
              <span className="text-sm font-mono font-extrabold text-cyan-400">
                {data.benchmarks.error_rate}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM ARCHITECTURE & TOPOLOGY DIAGRAM */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderColor pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color block mb-1">
              System Topology
            </span>
            <h2 className="text-2xl font-extrabold text-font-color flex items-center gap-2">
              <span>🏗️</span> Distributed CQRS & Event Streaming Architecture
            </h2>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-primary-background border border-borderColor text-muted-foreground">
            PostgreSQL ➔ Outbox ➔ Kafka ➔ ClickHouse
          </span>
        </div>

        {/* ASCII TOPOLOGY TERMINAL BOX */}
        <div className="relative rounded-2xl border border-borderColor bg-primary-background/90 overflow-hidden shadow-inner font-mono text-xs text-emerald-400 p-4 md:p-6 overflow-x-auto">
          <div className="flex items-center justify-between border-b border-borderColor/40 pb-3 mb-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 font-semibold">architecture_flow.ascii</span>
            </div>
            <span>CQRS Pipeline View</span>
          </div>
          <pre className="leading-relaxed font-mono select-all text-[11px] md:text-xs text-emerald-300/90 whitespace-pre">
            {data.architecture_diagram}
          </pre>
        </div>

        {/* 4-STAGE PIPELINE CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {data.architecture.map((arch, idx) => (
            <div
              key={idx}
              className="bg-primary-background/40 p-4 rounded-2xl border border-borderColor/60 space-y-2 hover:border-accent-color/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-color">
                  Stage 0{idx + 1}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-font-color capitalize">
                {arch.title.replace(/_/g, " ")}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {arch.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* APPLIED TECH STACK */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-6">
        <h3 className="text-xl font-bold tracking-tight border-b border-borderColor pb-3 flex items-center gap-2 text-font-color">
          <span>🛠️</span> Applied Technology Stack & Infrastructure
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {data.tech_stack.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3 p-4 rounded-2xl bg-primary-background/30 border border-borderColor/50">
              <h4 className="text-xs font-bold text-font-color uppercase tracking-wider">
                {group.title}
              </h4>
              <TagsCapsule tags={group.items} />
            </div>
          ))}
        </div>
      </section>

      {/* CORE ENGINEERING PROBLEMS SOLVED (THEORETICAL DEEP DIVES) */}
      <section className="space-y-8 border-t border-borderColor pt-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
            Theoretical Engineering & Systems Analysis
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-font-color">
            Core Engineering Problems Solved
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            In-depth theoretical breakdown of concurrency safeguards, dual-write prevention, OLAP isolation, and network shock absorption mechanisms.
          </p>
        </div>

        <div className="space-y-8">
          {data.core_engineering_problems.map((item, index) => (
            <article
              key={item.id || index}
              className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-6"
            >
              {/* Header & Tags */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-borderColor/60 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-color">
                    Problem Study #0{index + 1}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-font-color">
                    {item.title}
                  </h3>
                </div>
                <TagsCapsule tags={item.tags} />
              </div>

              {/* Problem vs Solution Split Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Problem Card */}
                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <span>⚠️</span> {item.problem.title}
                  </span>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {item.problem.description}
                  </p>
                </div>

                {/* Solution Card */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span>💡</span> {item.solution.title}
                  </span>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {item.solution.description}
                  </p>
                </div>
              </div>

              {/* Engineering Details & Outcome Grid */}
              <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-borderColor/40">
                {/* Technical Mechanisms */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-font-color flex items-center gap-1.5">
                    <span>⚙️</span> {item.technical_details.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {item.technical_details.items.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <span className="text-accent-color mt-0.5">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact & Outcome */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-font-color flex items-center gap-1.5">
                    <span>🎯</span> {item.outcome.title}
                  </span>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {item.outcome.items.map((out, oIdx) => (
                      <li key={oIdx} className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* STRESS-TEST & PERFORMANCE BENCHMARKS */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-8 border-t border-borderColor/80">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
            System Saturation & Reliability Verification
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-font-color flex items-center gap-2">
            <span>📊</span> Stress-Test & Performance Benchmarks
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            The core FastAPI transactional engine was subjected to a multi-user Locust saturation swarm to evaluate concurrency barriers and idempotency gate safety.
          </p>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-primary-background/70 border border-borderColor/80 p-5 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Sustained Throughput
            </span>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {data.benchmarks.sustained_rps}
            </span>
            <span className="text-[10px] text-muted-foreground block">Locust Swarm Rate</span>
          </div>

          <div className="bg-primary-background/70 border border-borderColor/80 p-5 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Volume Processed
            </span>
            <span className="text-2xl font-mono font-extrabold text-teal-400">
              160,996
            </span>
            <span className="text-[10px] text-muted-foreground block">Atomic Transactions</span>
          </div>

          <div className="bg-primary-background/70 border border-borderColor/80 p-5 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              System Error Rate
            </span>
            <span className="text-2xl font-mono font-extrabold text-cyan-400">
              {data.benchmarks.error_rate}
            </span>
            <span className="text-[10px] text-muted-foreground block">Zero Data Failures</span>
          </div>

          <div className="bg-primary-background/70 border border-borderColor/80 p-5 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Idempotency Gate
            </span>
            <span className="text-sm font-mono font-bold text-accent-color">
              409 Conflict Gate
            </span>
            <span className="text-[10px] text-muted-foreground block">Redis Network Protection</span>
          </div>
        </div>

        {/* LOCUST BENCHMARK SATURATION CHART DISPLAY */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-font-color uppercase tracking-wider flex items-center gap-2">
              <span>📈</span> Real-Time Performance Saturation Chart (Locust Load Test)
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">
              1,500 Virtual Users • 15m Saturation
            </span>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-borderColor shadow-lg bg-primary-background">
            <ImageViewer images={data.benchmarks.chart_image} aspectRatio="landscape" />
          </div>
        </div>
      </section>

      {/* LOCAL DEVELOPMENT & ECOSYSTEM EXECUTION */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-6">
        <div className="space-y-2 border-b border-borderColor pb-4">
          <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
            CLI & Container Orchestration
          </span>
          <h3 className="text-2xl font-extrabold text-font-color flex items-center gap-2">
            <span>⚙️</span> {data.local_development.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.local_development.description}
          </p>
        </div>

        {/* STEP-BY-STEP SHELL ROUTINES */}
        <div className="space-y-4">
          {data.local_development.steps.map((stepItem, idx) => (
            <div
              key={idx}
              className="bg-primary-background/70 border border-borderColor/80 rounded-2xl p-4 md:p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-font-color flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-color/20 text-accent-color flex items-center justify-center text-[10px] font-mono">
                    {stepItem.step}
                  </span>
                  <span>{stepItem.title}</span>
                </h4>
                <button
                  onClick={() => handleCopy(stepItem.command, idx)}
                  className="text-[10px] font-mono px-3 py-1 rounded-full bg-secondary-background border border-borderColor hover:border-accent-color text-muted-foreground hover:text-font-color transition-colors"
                >
                  {copiedIndex === idx ? "✓ Copied!" : "Copy Command"}
                </button>
              </div>

              <div className="bg-secondary-background/80 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto border border-borderColor/40 flex items-center justify-between">
                <code>$ {stepItem.command}</code>
              </div>

              {stepItem.description && (
                <p className="text-xs text-muted-foreground">
                  {stepItem.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTINUOUS INTEGRATION (CI/CD) PIPELINE */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
              Automated Testing & Regression
            </span>
            <h3 className="text-2xl font-extrabold text-font-color flex items-center gap-2">
              <span>🚀</span> {data.ci_cd.title}
            </h3>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-primary-background border border-borderColor text-accent-color">
            {data.ci_cd.pipeline_file}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.ci_cd.description}
        </p>
      </section>

      {/* FOOTER */}
      <ProjectFooter />
    </main>
  );
}
