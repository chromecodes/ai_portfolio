"use client";
import { useParams } from "next/navigation";


export interface IOrginPageProps {
    data: object;
}

import type { IOrginData } from "@/types/originData";
import Image from "next/image";
import ImageViewer from "@/components/ImageViewer/ImageViewer";
import { Icons } from "@/Icon";
import QuotationBox from "@/components/UI/QuotationBox";


export default function OrginPage(props: IOrginPageProps) {


    const data = props.data as IOrginData;

    return (
        <div>

            <main className="max-w-6xl mx-auto px-6 py-16">
                <div className="space-y-24">

                    {/* HERO */}
                    <section className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            {data.company.logo ? (
                                <div className="relative w-20 h-20 overflow-hidden rounded-2xl bg-white shadow-md flex items-center justify-center p-3 border border-gray-100 transition-all duration-300 hover:scale-105">
                                    <Image
                                        src={data.company.logo}
                                        alt={data.company.name}
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative w-20 h-20 overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md flex items-center justify-center text-white font-extrabold text-2xl transition-all duration-300 hover:scale-105">
                                    {data.company.name.charAt(0)}
                                </div>
                            )}
                            <div className="space-y-2">
                                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{data.company.name}</h1>
                                <p className="text-xl font-medium text-gray-700 dark:text-gray-300">{data.company.role}</p>
                                <p className="text-sm font-semibold text-gray-500">{data.company.duration}</p>
                            </div>
                            <QuotationBox quote={data.company.headline} />
                        </div>

                        {data.company.heroMedia ? (
                            <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-gray-150/50 dark:border-gray-800">
                                <video
                                    src={data.company.heroMedia}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>
                        ) : (
                            /* simulated IDE/terminal mockup */
                            <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-950 text-gray-100 font-mono text-[11px] md:text-xs shadow-2xl p-6 h-[280px] flex flex-col justify-between transition-all duration-300 hover:border-blue-550/40">
                                <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    </div>
                                    <span className="text-gray-500 text-[10px]">bash - learning-journey.sh</span>
                                </div>
                                <div className="flex-grow space-y-1.5 text-blue-400 leading-normal">
                                    <p className="text-gray-550"># Initializing software engineering fundamentals...</p>
                                    <p className="text-emerald-400">$ odin --start-journey</p>
                                    <p className="text-white">🚀 Journey started at Dec 2021</p>
                                    <p className="text-purple-400">
                                        [Odin Project] <span className="text-yellow-400">Learning HTML, CSS, & Javascript...</span>
                                    </p>
                                    <p className="text-blue-300">
                                        [Concepts] <span className="text-gray-305">DOM, Algorithms, OOP, Component Architectures</span>
                                    </p>
                                    <p className="text-emerald-400">$ build --projects --interactive</p>
                                    <p className="text-white">✓ Recipes Website (Semantic HTML)</p>
                                    <p className="text-white">✓ Portfolio & Calculator (CSS Layouts & JS)</p>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-900 pt-3 mt-3 text-gray-550 text-[10px]">
                                    <span>Status: Learning active</span>
                                    <span>Branch: main</span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* INTRODUCTION / FOUNDATION */}
                    <section className="grid md:grid-cols-12 gap-8 items-start bg-gradient-to-br from-gray-50 to-blue-50/20 dark:from-gray-900/50 dark:to-indigo-950/10 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="md:col-span-8 space-y-6">
                            <span className="text-xs uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">Foundation</span>
                            <h2 className="text-3xl font-bold tracking-tight">{data.introduction.title}</h2>
                            <div className="space-y-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                {data.introduction.description.map((desc, index) => (
                                    <p key={index}>{desc}</p>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
                            <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
                                <span>🛠️</span> Core Technologies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {data.introduction.modules.map((m) => (
                                    <span
                                        key={m}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 transition-all duration-300 hover:scale-105"
                                    >
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* LEARNING JOURNEY */}
                    <section className="space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400">Curriculum Path</span>
                                <span className="h-px bg-gray-200 dark:bg-gray-800 flex-grow" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight">{data.learningJourney.title}</h2>
                        </div>

                        <div className="grid md:grid-cols-12 gap-8">
                            {/* Journey Paragraphs */}
                            <div className="md:col-span-6 space-y-4 text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                {(data.learningJourney.description as any[]).map((desc, index) => {
                                    if (!Array.isArray(desc)) {
                                        return <p key={index}>{desc}</p>;
                                    }
                                    return null;
                                })}
                            </div>

                            {/* Explored Topics Card */}
                            <div className="md:col-span-6 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 p-6 md:p-8 rounded-2xl border border-gray-150/60 dark:border-gray-800/80 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold tracking-tight border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                    <span>🚀</span> Explored Engineering Concepts
                                </h3>
                                <ul className="grid sm:grid-cols-2 gap-3 text-xs md:text-sm">
                                    {(data.learningJourney.description as any[]).map((desc) => {
                                        if (Array.isArray(desc)) {
                                            return desc.map((d: string) => (
                                                <li key={d} className="flex gap-2 text-gray-700 dark:text-gray-300 items-start">
                                                    <span className="text-emerald-500 font-bold">✓</span>
                                                    <span className="leading-tight">{d}</span>
                                                </li>
                                            ));
                                        }
                                        return null;
                                    })}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* PROJECTS */}
                    <div className="space-y-24">
                        {data.projects.map((project, pIdx) => (
                            <section key={pIdx} className="space-y-10 border-t border-gray-100 dark:border-gray-800 pt-16">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400">Project Case Study</span>
                                        <span className="h-px bg-gray-200 dark:bg-gray-800 flex-grow" />
                                    </div>
                                    <h2 className="text-4xl font-extrabold tracking-tight">{project.title}</h2>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {project.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-12 gap-8 items-start">
                                    {/* Project details */}
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="bg-blue-50/30 dark:bg-blue-950/10 p-5 rounded-xl border border-blue-100/30 dark:border-blue-900/10 text-sm space-y-2">
                                                <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                                                    <span>🎯</span> {project.goal.title}
                                                </h4>
                                                <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed">{project.goal.description}</p>
                                            </div>
                                            <div className="bg-indigo-50/30 dark:bg-indigo-950/10 p-5 rounded-xl border border-indigo-100/30 dark:border-indigo-900/10 text-sm space-y-2">
                                                <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                                                    <span>💡</span> {project.solution.title}
                                                </h4>
                                                <p className="text-gray-700 dark:text-gray-400 text-xs leading-relaxed">{project.solution.description}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{project.concepts.title}</span>
                                            <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {project.concepts.items.map((t) => (
                                                    <li key={t}>{t}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {project.outcome && project.outcome.items && project.outcome.items.length > 0 && (
                                            <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 text-xs space-y-2">
                                                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                                    <span>✨</span> {project.outcome.title || "Outcomes"}
                                                </span>
                                                <ul className="list-disc pl-4 space-y-1.5 text-emerald-850 dark:text-emerald-400">
                                                    {project.outcome.items.map((o) => (
                                                        <li key={o}>{o}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Media & Links */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm bg-gray-950">
                                            {project.images && project.images.length > 0 && (
                                                <ImageViewer images={project.images} aspectRatio="landscape" curvedEdge={true} />
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            {Object.entries(project.links).map(([key, url]) => {
                                                const IconComponent = key === "github" ? Icons.github : Icons.externalLink;
                                                const label = key === "github" ? "Source Code" : "Live Demo";

                                                return IconComponent ? (
                                                    <a
                                                        key={`${key}-btn`}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-grow flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300"
                                                    >
                                                        <IconComponent className="h-4 w-4" />
                                                        <span>{label}</span>
                                                    </a>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>

                </div>

                {/* NAV */}
                <footer className="flex justify-between text-sm text-gray-500 pt-10 mt-16 border-t">
                    <button>← Back to Career Map</button>
                    <button>Next Company →</button>
                </footer>
            </main>

        </div>
    );
}


