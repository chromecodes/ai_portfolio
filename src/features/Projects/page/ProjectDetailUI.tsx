"use client";

import React from "react";
import { ProjectDetail } from "@/types/projectDetail";
import { ProjectHeroSection } from "./ProjectHeroSection";
import FeaturesTile from "@/features/Career/page/FeaturesTile";
import CareerFooter from "@/features/Career/page/CareerFooter";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export interface IProjectDetailUIProps {
  data: ProjectDetail;
}

export default function ProjectDetailUI({ data }: IProjectDetailUIProps) {
  const strings = useLanguageStore((state) => state.strings as Record<string, string>);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* HERO SECTION */}
      <ProjectHeroSection
        projectName={data.project_name}
        projectContext={data.project_context}
        corePillars={data.core_pillars}
        media={data.media}
        projectDemoUrl={data.project_demo_url}
        projectRepoUrl={data.project_repo_url}
      />

      {/* ARCHITECTURE & TECH STACK CARDS */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Architecture Details Card */}
        <div className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-6">
          <h3 className="text-xl font-bold tracking-tight border-b border-borderColor pb-3 flex items-center gap-2 text-font-color">
            <span>⚙️</span> {strings.systemArchitecture || "System Architecture"}
          </h3>
          <div className="space-y-4 text-sm">
            {data.architecture.map((arch, aIdx: number) => (
              <div key={aIdx} className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-color">
                  {arch.title.replace("_", " ")}
                </span>
                <p
                  className={
                    "text-muted-foreground font-mono text-xs p-3 leading-relaxed rounded-xl border border-borderColor/60 " +
                    (aIdx === 0 ? "bg-primary-background shadow-xs font-semibold" : "bg-secondary-background/40")
                  }
                >
                  {arch.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Details Card */}
        <div className="bg-secondary-background/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-borderColor shadow-sm space-y-6">
          <h3 className="text-xl font-bold tracking-tight border-b border-borderColor pb-3 flex items-center gap-2 text-font-color">
            <span>🛠️</span> {strings.appliedTechStack || "Applied Tech Stack"}
          </h3>

          <div className="flex flex-col gap-4 text-sm">
            {data.tech_stack.map((tech, tIdx: number) => (
              <div
                key={tech.title + tIdx}
                className="flex flex-col border-b border-borderColor/40 pb-4 last:border-0"
              >
                <span className="text-xs font-bold text-font-color mb-1">
                  {tech.title}
                </span>
                <TagsCapsule tags={tech.items} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KEY FEATURES SECTION */}
      <section className="space-y-12 border-t border-borderColor pt-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
            Features & Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-font-color">
            {strings.keyArchitecturalComponents || "Key Features & Engineering Modules"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {strings.breakdownOfSpecificModulesProblemsSolvedAndConcreteEngineeringOutcomes ||
              "Breakdown of specific modules, problems solved, and concrete engineering outcomes."}
          </p>
        </div>

        <div className="space-y-16">
          {data.key_features.map((feature, index: number) => (
            <FeaturesTile
              key={feature.id || index}
              features={feature as any}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <CareerFooter />
    </main>
  );
}
