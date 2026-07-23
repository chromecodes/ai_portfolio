"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CareerFooter from "@/features/Career/page/CareerFooter";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import { 
  ShieldCheck, 
  Zap, 
  Activity, 
  CheckCircle2, 
  Server, 
  Database, 
  Layers, 
  Terminal, 
  GitBranch, 
  ArrowRight, 
  ArrowDown, 
  Lock, 
  RefreshCw, 
  BarChart3, 
  Boxes,
  AlertTriangle,
  Sparkles,
  Check,
  XCircle
} from "lucide-react";

export type CaseStudyData = any;

export interface ICaseStudyDetailUIProps {
  data?: any;
}

export default function CaseStudyDetailUI({}: ICaseStudyDetailUIProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const techStack = [
    "Python (FastAPI)",
    "SQLAlchemy 2.0",
    "PostgreSQL (OLTP)",
    "Apache Kafka",
    "ClickHouse (OLAP)",
    "Redis Cache",
    "Docker",
    "PyTest",
    "GitHub Actions",
  ];

  const problemSolutions = [
    {
      id: "race-conditions",
      title: "Race Conditions & Concurrency",
      domain: "OLTP Engine • PostgreSQL",
      problem: {
        heading: "The Bottleneck & Danger",
        description:
          "Concurrent withdrawal & transfer requests targeting the same wallet simultaneously cause race conditions in standard databases. Without locking, interleaved reads and writes lead to negative wallet balances, phantom funds, and corrupted ledger states under load.",
        impact: "High Risk of Data Corruption & Financial Imbalance",
      },
      solution: {
        heading: "The Architectural Pattern",
        description:
          "Implemented Pessimistic Row-Locking (`SELECT ... FOR UPDATE`) in PostgreSQL. Simultaneous requests hitting the same wallet ID are forced into a strict, deterministic database lock queue, serializing execution and guaranteeing 100% mathematical balance integrity.",
        pattern: "Pessimistic Row-Locking (`SELECT ... FOR UPDATE`)",
        tag: "PostgreSQL ACID Locking",
      },
    },
    {
      id: "dual-write",
      title: "The Distributed Dual-Write Problem",
      domain: "Data Consistency • Event Bus",
      problem: {
        heading: "The Bottleneck & Danger",
        description:
          "Executing simultaneous network writes to a primary SQL database and an external message queue (Kafka/Redis) invites dual-write failure. If the database commit succeeds but the network call to Kafka fails, the analytics layer permanently desynchronizes from operational truth.",
        impact: "Cross-Database State Desynchronization & Event Loss",
      },
      solution: {
        heading: "The Architectural Pattern",
        description:
          "Implemented the Transactional Outbox Pattern. Ledger events are committed directly into a local PostgreSQL `transaction_outbox` table within the exact same atomic ACID transaction block as the balance update. An outbox daemon polls and publishes to Kafka asynchronously, ensuring zero event loss.",
        pattern: "Transactional Outbox Pattern (Atomic ACID Commit)",
        tag: "Atomic ACID Outbox",
      },
    },
    {
      id: "olap-starvation",
      title: "Analytical Resource Starvation",
      domain: "OLAP Analytics • ClickHouse",
      problem: {
        heading: "The Bottleneck & Danger",
        description:
          "Running heavy historical aggregate queries, real-time reporting dashboards, or audit scans directly against operational transaction tables consumes database CPU and locks indexes, stalling the live API ingestion layer and causing HTTP timeouts.",
        impact: "Operational API Freeze & Query Starvation",
      },
      solution: {
        heading: "The Architectural Pattern",
        description:
          "Constructed a CQRS (Command Query Responsibility Segregation) event pipeline. Immutable transaction events are micro-batched into ClickHouse—a high-performance columnar OLAP data warehouse—enabling lightning-fast analytics across millions of rows without touching operational OLTP tables.",
        pattern: "CQRS Pattern + ClickHouse Columnar OLAP Engine",
        tag: "CQRS + ClickHouse Warehouse",
      },
    },
    {
      id: "network-shock",
      title: "Downstream Network Shock & Outages",
      domain: "Fault Tolerance • Apache Kafka",
      problem: {
        heading: "The Bottleneck & Danger",
        description:
          "If downstream data warehouse nodes undergo routine maintenance, experience network spikes, or go temporarily offline, tight synchronous coupling causes upstream API requests to fail or stall, crashing client application flows.",
        impact: "Cascade System Failures & Network Shock Waves",
      },
      solution: {
        heading: "The Architectural Pattern",
        description:
          "Integrated Apache Kafka as an asynchronous message buffer between ingestion workers and analytical storage. Kafka safely buffers message offsets during downstream disruptions, guaranteeing At-Least-Once Delivery and eliminating cascade system failures.",
        pattern: "Apache Kafka Event Buffering & Decoupling",
        tag: "Kafka Offset Buffer",
      },
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* NAVIGATION BACK LINK */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-accent-color transition-colors duration-200"
        >
          <span>←</span>
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* HERO SECTION */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-borderColor shadow-sm space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] tracking-wider font-extrabold uppercase text-accent-color px-3 py-1 rounded-full bg-accent-color/10 border border-accent-color/20">
              Problem ➔ Solution Architecture
            </span>
            <span className="text-[10px] tracking-wider font-extrabold uppercase text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Verified Performance
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-linear-to-r from-accent-color to-secondary-accent-color bg-clip-text text-transparent leading-tight">
            High-Throughput Distributed Financial Ledger & Analytics Engine
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">
            A production-grade, asynchronous financial transaction engine built with{" "}
            <strong className="text-font-color font-semibold">Python (FastAPI)</strong> and{" "}
            <strong className="text-font-color font-semibold">SQLAlchemy 2.0</strong>. The platform uses the{" "}
            <strong className="text-font-color font-semibold">CQRS (Command Query Responsibility Segregation)</strong> pattern to isolate high-speed transaction updates from intensive historical queries, guaranteeing mathematical data integrity under heavy traffic.
          </p>
        </div>

        {/* TECH STACK TAGS */}
        <div className="pt-2 border-t border-borderColor/60">
          <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color block mb-2">
            Applied Tech Stack
          </span>
          <TagsCapsule tags={techStack} />
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-primary-background/90 p-5 rounded-2xl border border-borderColor/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-accent-color">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Throughput</span>
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-font-color">152.8</div>
            <div className="text-xs text-muted-foreground font-medium">Sustained Requests / Sec</div>
          </div>

          <div className="bg-primary-background/90 p-5 rounded-2xl border border-borderColor/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-accent-color">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Volume</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-font-color">160,996</div>
            <div className="text-xs text-muted-foreground font-medium">Atomic Transactions</div>
          </div>

          <div className="bg-primary-background/90 p-5 rounded-2xl border border-borderColor/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Error Rate</span>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-font-color">0.00%</div>
            <div className="text-xs text-muted-foreground font-medium">System Failures</div>
          </div>

          <div className="bg-primary-background/90 p-5 rounded-2xl border border-borderColor/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-accent-color">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Idempotency</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-font-color">409</div>
            <div className="text-xs text-muted-foreground font-medium">Conflict Duplicate Catch</div>
          </div>
        </div>
      </section>

      {/* CORE PROBLEM ➔ SOLUTION SHOWCASE SECTION */}
      <section className="space-y-10">
        <div className="space-y-2 border-b border-borderColor pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color">
            Architectural Engineering Breakdown
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-font-color flex items-center gap-3">
            <span>⚡</span> Core Engineering Challenges: Problem ➔ Solution
          </h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Deep dive into the four major distributed system bottlenecks encountered and the exact architectural patterns engineered to eliminate them.
          </p>
        </div>

        {/* PROBLEM ➔ SOLUTION COMPARISON CARDS */}
        <div className="space-y-12">
          {problemSolutions.map((item, index) => (
            <div
              key={item.id}
              className="bg-secondary-background/60 backdrop-blur-md rounded-3xl border border-borderColor p-6 md:p-8 space-y-6 shadow-sm hover:border-accent-color/40 transition-colors"
            >
              {/* Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-borderColor/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-accent-color/10 border border-accent-color/30 text-accent-color font-mono font-bold flex items-center justify-center text-sm">
                    0{index + 1}
                  </span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-font-color">
                    {item.title}
                  </h3>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary-background border border-borderColor text-muted-foreground">
                  {item.domain}
                </span>
              </div>

              {/* Side-by-Side Grid: Problem vs Solution */}
              <div className="grid md:grid-cols-2 gap-6 items-stretch">
                {/* Left Column: The Problem */}
                <div className="bg-primary-background p-6 rounded-2xl border border-borderColor/80 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-rose-500">
                      <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> {item.problem.heading}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500">
                        PROBLEM
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.problem.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-borderColor/60 flex items-center gap-2 text-xs font-mono text-rose-500/90 font-medium">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.problem.impact}</span>
                  </div>
                </div>

                {/* Right Column: The Architectural Solution */}
                <div className="bg-primary-background p-6 rounded-2xl border border-accent-color/40 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-accent-color">
                      <span className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> {item.solution.heading}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-accent-color/10 border border-accent-color/30 text-accent-color">
                        SOLVED
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.solution.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-borderColor/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-semibold">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{item.solution.pattern}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CQRS SYSTEM ARCHITECTURE VISUALIZER */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-borderColor shadow-sm space-y-8">
        <div className="space-y-2 border-b border-borderColor pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color">
              Data Flow Visualizer
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-font-color flex items-center gap-3">
              <Layers className="w-7 h-7 text-accent-color" /> CQRS Architecture Blueprint
            </h2>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-primary-background border border-borderColor text-muted-foreground self-start md:self-auto">
            Strict ACID OLTP ➔ Asynchronous OLAP
          </span>
        </div>

        {/* VISUAL ARCHITECTURE FLOW */}
        <div className="space-y-6">
          {/* Top Stage: Client Request & FastAPI */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-lg bg-primary-background p-4 rounded-2xl border border-borderColor text-center shadow-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-color font-bold">API Ingestion Layer</span>
              <h4 className="text-sm font-bold text-font-color flex items-center justify-center gap-2">
                <Server className="w-4 h-4 text-accent-color" /> Client Request ➔ FastAPI Ingestion API
              </h4>
            </div>

            <div className="my-3 flex flex-col items-center text-muted-foreground">
              <ArrowDown className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          {/* Dual Branches: OLTP vs OLAP */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Branch 1: OLTP Lock Queue */}
            <div className="bg-primary-background p-6 rounded-2xl border border-borderColor space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-borderColor/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-accent-color" />
                    <span className="text-sm font-bold text-font-color">PostgreSQL (OLTP Engine)</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent-color font-bold bg-accent-color/10 px-2 py-0.5 rounded-md">
                    Strict ACID
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Handles high-speed transactional updates using <code className="text-font-color font-mono bg-secondary-background px-1 py-0.5 rounded">SELECT ... FOR UPDATE</code> row-level locking. Eliminates race conditions by ordering concurrent wallet access.
                </p>
              </div>
              <div className="pt-2 text-xs font-mono text-muted-foreground flex items-center gap-2 border-t border-borderColor/40">
                <Lock className="w-3.5 h-3.5 text-accent-color" /> Sequential Execution Queue
              </div>
            </div>

            {/* Branch 2: Outbox + Kafka + ClickHouse */}
            <div className="bg-primary-background p-6 rounded-2xl border border-borderColor space-y-4">
              <div className="flex items-center justify-between border-b border-borderColor/60 pb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-accent-color" />
                  <span className="text-sm font-bold text-font-color">Transactional Outbox & Kafka</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent-color font-bold bg-accent-color/10 px-2 py-0.5 rounded-md">
                  Event-Driven
                </span>
              </div>

              {/* Step Sequence */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-background/60 border border-borderColor/60">
                  <span className="font-mono font-semibold text-font-color">1. Transactional Outbox Table</span>
                  <span className="text-[10px] text-muted-foreground">Atomically Bound to DB</span>
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-background/60 border border-borderColor/60">
                  <span className="font-mono font-semibold text-font-color">2. Outbox Worker Daemon</span>
                  <span className="text-[10px] text-muted-foreground">Polled Asynchronously</span>
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-background/60 border border-borderColor/60">
                  <span className="font-mono font-semibold text-font-color">3. Apache Kafka Broker</span>
                  <span className="text-[10px] text-muted-foreground">Offset Buffer & Decoupler</span>
                </div>
                <div className="flex items-center justify-center text-muted-foreground">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-accent-color/10 border border-accent-color/30 text-font-color font-bold">
                  <span className="font-mono flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-accent-color" /> 4. ClickHouse OLAP Warehouse
                  </span>
                  <span className="text-[10px] font-mono text-accent-color">Micro-Batched</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EMPIRICAL SOLUTION VERIFICATION (LOCUST LOAD TEST) */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-borderColor shadow-sm space-y-8">
        <div className="space-y-2 border-b border-borderColor pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color">
              Empirical Solution Proof
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-font-color flex items-center gap-3">
              <span>📊</span> Stress-Test & Performance Benchmarks
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-primary-background px-3 py-1.5 rounded-lg border border-borderColor text-muted-foreground">
            <span>Swarm Engine:</span>
            <span className="font-bold text-font-color">Locust Saturation Swarm</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
          To verify data integrity and throughput limits under extreme concurrent saturation, the API was subjected to an intense multi-user swarm utilizing <strong className="text-font-color">Locust</strong>:
        </p>

        {/* SATURATION METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-background p-5 rounded-2xl border border-borderColor space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">Sustained Throughput</div>
            <div className="text-2xl font-extrabold text-accent-color">152.8 RPS</div>
            <p className="text-xs text-muted-foreground">Maintained requests per second without database lock timeouts.</p>
          </div>

          <div className="bg-primary-background p-5 rounded-2xl border border-borderColor space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">Volume Processed</div>
            <div className="text-2xl font-extrabold text-accent-color">160,996</div>
            <p className="text-xs text-muted-foreground">Atomic transactions committed without balance drift.</p>
          </div>

          <div className="bg-primary-background p-5 rounded-2xl border border-borderColor space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-extrabold">System Error Rate</div>
            <div className="text-2xl font-extrabold text-emerald-500">0.00% Failures</div>
            <p className="text-xs text-muted-foreground">Zero unhandled exception drops or corruption incidents.</p>
          </div>
        </div>

        {/* IDEMPOTENCY PROTECTION BOX */}
        <div className="bg-primary-background p-5 rounded-2xl border border-borderColor flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent-color/10 border border-accent-color/20 text-accent-color shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-font-color">Idempotency Protection & Duplicate Filtering Gate</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrated a unique Redis/SQL caching index gate, returning an explicit <code className="text-font-color font-mono bg-secondary-background px-1.5 py-0.5 rounded border border-borderColor">409 Conflict</code> to catch and drop network-level duplicate requests safely.
            </p>
          </div>
        </div>

        {/* LOCUST BENCHMARK IMAGE CONTAINER */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-font-color flex items-center gap-2">
              <span>📈</span> Real-Time Performance Saturation Chart
            </h3>
            <span className="text-xs text-muted-foreground font-mono">Locust Benchmark Swarm</span>
          </div>

          <div 
            className="relative rounded-2xl overflow-hidden border border-borderColor shadow-lg bg-primary-background group cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          >
            <div className="relative aspect-16/9 w-full max-h-[500px]">
              <Image
                src="/images/locust_benchmark.png"
                alt="Locust Load Test Performance Benchmark"
                fill
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.01]"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-black/70 px-4 py-2 rounded-full backdrop-blur-xs">
                Click to expand benchmark graph
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* LOCAL DEVELOPMENT & CI/CD ECOSYSTEM EXECUTION */}
      <section className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-borderColor shadow-sm space-y-8">
        <div className="space-y-2 border-b border-borderColor pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-accent-color">
            Verification & Execution
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-font-color flex items-center gap-3">
            <Terminal className="w-7 h-7 text-accent-color" /> Ecosystem Execution & CI/CD
          </h2>
          <p className="text-sm text-muted-foreground">
            Fully containerized Docker stack with single-command bootstrappers and GitHub Actions regression suites.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Local Execution Steps */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-font-color flex items-center gap-2">
              <span>⚙️</span> Local Development Execution
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-font-color flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-color/10 border border-accent-color/30 text-accent-color font-mono flex items-center justify-center text-[10px]">1</span>
                  Spin up cluster infrastructure:
                </div>
                <div className="bg-primary-background p-3 rounded-xl border border-borderColor font-mono text-xs text-accent-color">
                  docker-compose up -d
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-font-color flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-color/10 border border-accent-color/30 text-accent-color font-mono flex items-center justify-center text-[10px]">2</span>
                  Execute single-command automation bootstrapper:
                </div>
                <p className="text-xs text-muted-foreground">
                  Checks infrastructure health, configures table migrations, and launches background workers.
                </p>
                <div className="bg-primary-background p-3 rounded-xl border border-borderColor font-mono text-xs text-accent-color space-y-1">
                  <div>chmod +x run_system.sh</div>
                  <div>./run_system.sh</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-font-color flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent-color/10 border border-accent-color/30 text-accent-color font-mono flex items-center justify-center text-[10px]">3</span>
                  Verify analytics ingestion (ClickHouse):
                </div>
                <div className="bg-primary-background p-3 rounded-xl border border-borderColor font-mono text-xs text-accent-color break-all">
                  docker-compose exec clickhouse clickhouse-client --query &quot;SELECT * FROM analytical_ledger_events&quot;
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: CI/CD Pipeline */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-font-color flex items-center gap-2">
              <span>🚀</span> Continuous Integration (CI/CD)
            </h3>

            <div className="bg-primary-background p-6 rounded-2xl border border-borderColor space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent-color/10 border border-accent-color/20 text-accent-color">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-font-color">GitHub Actions Pipeline</h4>
                  <span className="text-xs font-mono text-muted-foreground">.github/workflows/ci-pipeline.yml</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Every commit automatically triggers isolated service containers in GitHub&apos;s cloud, boots the engine layers, and verifies system integrity rules using an integrated <strong className="text-font-color font-semibold">PyTest</strong> regression suite.
              </p>

              <div className="p-3 rounded-xl bg-secondary-background/80 border border-borderColor/80 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-emerald-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PyTest Regression Suite
                  </span>
                  <span>PASSED</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Isolated postgres + clickhouse + kafka docker containers spawned in CI matrix.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FULLSCREEN IMAGE MODAL FOR LOCUST BENCHMARK */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-primary-background p-4 rounded-2xl border border-borderColor space-y-4">
            <div className="flex items-center justify-between border-b border-borderColor pb-2">
              <h4 className="text-sm font-bold text-font-color">Locust Load Test Performance Benchmark</h4>
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-secondary-background border border-borderColor hover:bg-accent-color hover:text-white transition-colors"
              >
                Close (ESC)
              </button>
            </div>
            <div className="relative aspect-16/9 w-full max-h-[75vh]">
              <Image
                src="/images/locust_benchmark.png"
                alt="Locust Load Test Performance Benchmark Full View"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <CareerFooter />
    </main>
  );
}
