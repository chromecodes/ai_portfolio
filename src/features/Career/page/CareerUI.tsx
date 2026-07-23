"use client";
import { useParams } from "next/navigation";
import type careerTypes from "@/types/career";
import Image from "next/image";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { HeroSection } from "./HeroSecrion";
import FeaturesTile from "./FeaturesTile";
import CareerFooter from "./CareerFooter";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export interface ICareerUIProps {
    data: careerTypes;
}

export default function CareerUI({ data }: ICareerUIProps) {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);

    return (
        <main className="max-w-6xl mx-auto mt-16 px-6 py-6 space-y-20">
            <div className="space-y-20">
                {/* HERO SECTION */}

                <HeroSection data={data.company} />

                {/* MY ROLE, IMPACT & INSIGHTS */}
                <section className="space-y-8 
                                    bg-linear-to-br from-accent-color/15 
                                    to-primary-background/10 
                                    p-8 md:p-12 rounded-3xl 
                                    border shadow-sm">
                    <div className="space-y-4">
                        <span className="text-xs 
                                         uppercase tracking-widest 
                                         font-extrabold
                                         text-accent-color">{strings.roleAndResponseibilities}</span>
                        <h2 className="text-3xl font-bold tracking-tight">{data.roles.title}</h2>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">{data.roles.description}</p>
                    </div>

                    <div
                        className={`grid gap-8 pt-4 grid-cols-1 ${data.roles.engineering_insights.length > 0 ? "md:grid-cols-2" : "md:grid-cols-1"
                            }`}
                    >
                        <div className="space-y-4 bg-secondary-background p-6 rounded-2xl border shadow-xs">
                            <h3 className="text-xl font-bold  flex items-center gap-2">
                                <span className="text-primary-foreground text-lg">🎯</span> {strings.keyDeliverablesAndImpact}
                            </h3>
                            <ul className="space-y-3">
                                {data.roles.impact.map((imp, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                        <span className="text-emerald-500 font-bold">✓</span>
                                        <span>{imp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {
                            data.roles.engineering_insights.length > 0 && (
                                <div className="space-y-4 bg-secondary-background p-6 rounded-2xl border shadow-xs">
                                    <h3 className="text-xl font-bold  flex items-center gap-2">
                                        <span className="text-primary-foreground text-lg">💡</span> {strings.engineeringInsights}
                                    </h3>
                                    <ul className="space-y-3">
                                        {data.roles.engineering_insights.map((insight, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                                <span className="text-amber-500 font-bold">▪</span>
                                                <span>{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>)
                        }
                    </div>
                </section>

                {/* PROJECTS SECTION */}
                <div className="space-y-24">
                    {data.projects.map((project, pIdx) => (
                        <section key={pIdx} className="space-y-10 border-t pt-16">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs 
                                                     uppercase tracking-widest font-extrabold
                                                     text-accent-color">{strings.projects}</span>
                                    <span className="h-px bg-secondary-background flex-grow" />
                                </div>
                                <h2 className="text-4xl font-extrabold tracking-tight">{project.project_name}</h2>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">{project.project_context}</p>
                                <TagsCapsule tags={project.core_pillars} />
                            </div>

                            {/* ARCHITECTURE & TECH STACK CARDS */}
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Architecture Details Card */}
                                <div className="bg-linear-to-br from-secondary-background to-primary-background p-6 md:p-8 rounded-2xl border shadow-sm space-y-6">
                                    <h3 className="text-xl font-bold tracking-tight border-b pb-3 flex items-center gap-2">
                                        <span>⚙️</span> {strings.systemArchitecture}
                                    </h3>
                                    <div className="space-y-4 text-sm">
                                        {project.architecture.map((arch, aIdx: number) => (
                                            <div key={aIdx} className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-wider">{arch.title}</span>
                                                <p className={"text-muted-foreground font-mono text-xs p-2.5 leading-relaxed" + (aIdx === 0 ? "border bg-primary-background shadow-xs rounded-xl" : "")}>{arch.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tech Stack Details Card */}
                                <div className="bg-linear-to-br 
                                from-secondary-background to-primary-background
                                 p-6 md:p-8 rounded-2xl
                                  shadow-sm space-y-6">
                                    <h3 className="text-xl font-bold tracking-tight border-b  pb-3 flex items-center gap-2">
                                        <span>🛠️</span> {strings.appliedTechStack}
                                    </h3>

                                    <div className="flex flex-col gap-4 text-sm">
                                        {project.tech_stack.map((tech, tIdx: number) => (
                                            <div key={tech.title + tIdx} className="
                                                flex flex-col  
                                                border-b 
                                                pb-4
                                                last:border-0">
                                                <span className="text-xs 
                                                font-bold 
                                                  ">{tech.title}</span>
                                                <TagsCapsule tags={tech.items} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* KEY FEATURES LAYOUT */}
                            <div className="space-y-16 pt-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold tracking-tight">{strings.keyArchitecturalComponents}</h3>
                                    <p className="text-sm text-muted-foreground">{strings.breakdownOfSpecificModulesProblemsSolvedAndConcreteEngineeringOutcomes}</p>
                                </div>
                                {
                                    project.key_features.map((feature: careerTypes['projects'][number]['key_features'][number], index: number) => (
                                        <FeaturesTile
                                            key={index}
                                            features={feature}
                                            index={index} />
                                    ))
                                }
                            </div>
                        </section>
                    ))}
                </div>
            </div>
            <CareerFooter />
        </main >
    );
}