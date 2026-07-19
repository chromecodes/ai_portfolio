"use client";
import { useParams } from "next/navigation";
import type { CareerData, CareerDetail, DetailedCareerDetail } from "@/types/career";
import Image from "next/image";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

export interface ICareerUIProps {
    data: object;
}

function DetailedCareerUI({ data }: { data: DetailedCareerDetail }) {
    return (
        <div className="space-y-24">
            {/* HERO SECTION */}
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
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                        "{data.company.headline}"
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {data.company.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30 transition-all duration-300 hover:scale-105"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-gray-150/50 dark:border-gray-800">
                    <video
                        src={data.company.media.video}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
            </section>

            {/* MY ROLE, IMPACT & INSIGHTS */}
            <section className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50/20 dark:from-gray-900/50 dark:to-indigo-950/10 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="space-y-4">
                    <span className="text-xs uppercase tracking-widest font-extrabold text-blue-600 dark:text-blue-400">Leadership & Impact</span>
                    <h2 className="text-3xl font-bold tracking-tight">{data.roles.title}</h2>
                    <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">{data.roles.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="text-blue-500 text-lg">🎯</span> Key Deliverables & Impact
                        </h3>
                        <ul className="space-y-3">
                            {data.roles.impact.map((imp, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>{imp}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-xs">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="text-indigo-500 text-lg">💡</span> Engineering Insights
                        </h3>
                        <ul className="space-y-3">
                            {data.roles.engineering_insights.map((insight, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <span className="text-amber-500 font-bold">▪</span>
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* PROJECTS SECTION */}
            <div className="space-y-24">
                {data.projects.map((project, pIdx) => (
                    <section key={pIdx} className="space-y-10 border-t border-gray-100 dark:border-gray-800 pt-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-600 dark:text-indigo-400">Project Case Study</span>
                                <span className="h-px bg-gray-200 dark:bg-gray-800 flex-grow" />
                            </div>
                            <h2 className="text-4xl font-extrabold tracking-tight">{project.project_name}</h2>
                            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl">{project.project_context}</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {project.core_pillars.map((pillar) => (
                                    <span
                                        key={pillar}
                                        className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-750"
                                    >
                                        {pillar}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ARCHITECTURE & TECH STACK CARDS */}
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Architecture Details Card */}
                            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 p-6 md:p-8 rounded-2xl border border-gray-150/60 dark:border-gray-800/80 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold tracking-tight border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                    <span>⚙️</span> System Architecture
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">High-Level Data Flow</span>
                                        <p className="text-gray-750 dark:text-gray-300 font-mono text-xs bg-gray-100 dark:bg-gray-950 p-2.5 rounded-lg border border-gray-200/40 dark:border-gray-900 leading-relaxed">{project.architecture.high_level}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Design Paradigm</span>
                                        <p className="text-gray-700 dark:text-gray-400 leading-relaxed">{project.architecture.design_paradigm}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Infrastructure</span>
                                        <p className="text-gray-700 dark:text-gray-400 leading-relaxed">{project.architecture.infrastructure}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Asset Delivery</span>
                                        <p className="text-gray-700 dark:text-gray-400 leading-relaxed">{project.architecture.asset_delivery}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Stack Details Card */}
                            <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950 p-6 md:p-8 rounded-2xl border border-gray-150/60 dark:border-gray-800/80 shadow-sm space-y-6">
                                <h3 className="text-xl font-bold tracking-tight border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                    <span>🛠️</span> Applied Tech Stack
                                </h3>
                                <div className="space-y-3.5 text-sm">
                                    {Object.entries(project.tech_stack).map(([key, list]) => (
                                        <div key={key} className="grid grid-cols-3 gap-2 py-1.5 border-b border-gray-100/50 dark:border-gray-900/55 last:border-0">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider self-center capitalize">{key.replace(/_/g, ' ')}</span>
                                            <div className="col-span-2 flex flex-wrap gap-1.5">
                                                {list.map((tech) => (
                                                    <span key={tech} className="px-2 py-0.5 text-xs rounded bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 font-medium">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* KEY FEATURES LAYOUT */}
                        <div className="space-y-16 pt-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight">Key Architectural Components</h3>
                                <p className="text-sm text-gray-500">Breakdown of specific modules, problems solved, and concrete engineering outcomes.</p>
                            </div>

                            {project.key_features.map((feat, fIdx) => {
                                const featImages = feat.media
                                    .filter(m => m.type === "image")
                                    .map(m => ({
                                        id: m.id,
                                        src: m.src,
                                        blurSrc: m.src,
                                        alt: m.alt,
                                        width: 1200,
                                        height: 800,
                                    }));
                                const featVideos = feat.media.filter(m => m.type === "video");

                                return (
                                    <div key={fIdx} className="grid lg:grid-cols-12 gap-8 items-start border-b border-gray-100/60 dark:border-gray-850 pb-12 last:border-0 last:pb-0">
                                        {/* Description Content */}
                                        <div className="lg:col-span-7 space-y-6">
                                            <div className="space-y-3">
                                                <h4 className="text-xl font-bold text-gray-950 dark:text-white">{feat.title}</h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {feat.tags.map((tag) => (
                                                        <span key={tag} className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-sm leading-relaxed">
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    <strong className="text-gray-900 dark:text-white font-semibold">Challenge:</strong> {feat.problem}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-300">
                                                    <strong className="text-gray-900 dark:text-white font-semibold">Solution:</strong> {feat.solution}
                                                </p>
                                            </div>

                                            <div className="space-y-2 bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technical Deep-Dive</span>
                                                <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                    {feat.technical_details.map((detail, idx) => (
                                                        <li key={idx} className="leading-relaxed">{detail}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {feat.outcome && (
                                                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 text-xs text-emerald-800 dark:text-emerald-300 flex gap-2">
                                                    <span className="font-bold">✨ Impact:</span>
                                                    <span className="leading-relaxed">{feat.outcome}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Media Viewer Content */}
                                        <div className="lg:col-span-5 space-y-4">
                                            {/* Video render */}
                                            {featVideos.map((video) => (
                                                <div key={video.id} className="relative group overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-black aspect-video flex items-center justify-center">
                                                    <video
                                                        src={video.src}
                                                        autoPlay
                                                        loop
                                                        muted
                                                        playsInline
                                                        controls
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ))}

                                            {/* Image slider render */}
                                            {featImages.length > 0 && (
                                                <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                                                    <ImageViewer images={featImages} aspectRatio="landscape" curvedEdge={true} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}

export default function CareerUI(props: ICareerUIProps) {
    const data = props.data as CareerData;
    const params = useParams();

    if ('roles' in data) {
        return (
            <main className="max-w-6xl mx-auto px-6 py-16">
                <DetailedCareerUI data={data} />
                <footer className="flex justify-between text-sm text-gray-500 pt-10 mt-16 border-t">
                    <button>← Back to Career Map</button>
                    <button>Next Company →</button>
                </footer>
            </main>
        );
    }

    const legacyData = data as CareerDetail;

    return (
        <div>

            <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">

                {/* HERO */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-4">
                        {legacyData.company.logo && (
                            <Image
                                src={legacyData.company.logo}
                                alt={legacyData.company.name}
                                width={80}
                                height={80}
                            />
                        )}
                        <h1 className="text-3xl font-bold">{legacyData.company.name}</h1>
                        <p className="text-lg text-gray-600">{legacyData.company.role}</p>
                        <p className="text-sm text-gray-500">{legacyData.company.duration}</p>
                    </div>

                    {legacyData.company.media?.video && (
                        <video
                            src={legacyData.company.media.video}
                            autoPlay
                            loop
                            muted
                            className="rounded-xl shadow-lg"
                        />
                    )}
                </section>

                {/* PRODUCT CONTEXT */}
                <section className="space-y-6">
                    <h2 className="section-title">{legacyData.productContext.title}</h2>
                    <p className="text-gray-600">{legacyData.productContext.description}</p>

                    <div className="flex flex-wrap gap-3">
                        {legacyData.productContext.modules.map((m) => (
                            <span
                                key={m}
                                className="px-3 py-1 text-sm rounded-full bg-gray-100"
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </section>

                {/* ARCHITECTURE */}
                <section className="space-y-6">
                    <h2 className="section-title">System Architecture</h2>

                    <Image
                        src={legacyData.architecture.diagram}
                        alt="Architecture Diagram"
                        width={1200}
                        height={600}
                        className="rounded-lg border"
                    />

                    <ul className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                        {Object.entries(legacyData.architecture.stack).map(([k, v]) => (
                            <li key={k}>
                                <strong className="capitalize">{k}:</strong> {v}
                            </li>
                        ))}
                    </ul>

                    <ul className="list-disc pl-6 text-gray-600">
                        {legacyData.architecture.highlights.map((h) => (
                            <li key={h}>{h}</li>
                        ))}
                    </ul>
                </section>

                {/* ROLE */}
                <section className="space-y-6">
                    <h2 className="section-title">My Role</h2>
                    <ul className="list-disc pl-6 text-gray-600">
                        {legacyData.role.map((r) => (
                            <li key={r}>{r}</li>
                        ))}
                    </ul>
                </section>

                {/* PROJECTS */}
                {legacyData.projects.map((project) => (
                    <section key={project.title} className="space-y-8">
                        <h2 className="section-title">{project.title}</h2>

                        <div className="flex flex-wrap gap-3">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <p><strong>Problem:</strong> {project.problem}</p>
                                <p><strong>Solution:</strong> {project.solution}</p>

                                <ul className="list-disc pl-6 text-gray-600">
                                    {project.tech.map((t) => (
                                        <li key={t}>{t}</li>
                                    ))}
                                </ul>

                                <ul className="list-disc pl-6 text-green-700">
                                    {project.outcome.map((o) => (
                                        <li key={o}>{o}</li>
                                    ))}
                                </ul>
                            </div>

                            <video
                                src={project.media}
                                autoPlay
                                loop
                                muted
                                className="rounded-xl border"
                            />
                        </div>
                    </section>
                ))}

                {/* TECH STACK */}
                <section className="space-y-6">
                    <h2 className="section-title">Tech Stack</h2>
                    <ul className="grid md:grid-cols-2 gap-4 text-gray-600">
                        {Object.entries(legacyData.techStack).map(([k, v]) => (
                            <li key={k}>
                                <strong className="capitalize">{k}:</strong> {v}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* IMPACT */}
                <section className="space-y-6">
                    <h2 className="section-title">Impact</h2>
                    <ul className="list-disc pl-6 text-gray-600">
                        {legacyData.impact.map((i) => (
                            <li key={i}>{i}</li>
                        ))}
                    </ul>
                </section>

                {/* LEARNINGS */}
                <section className="space-y-6">
                    <h2 className="section-title">Engineering Learnings</h2>
                    <ul className="list-disc pl-6 text-gray-600">
                        {legacyData.learnings.map((l) => (
                            <li key={l}>{l}</li>
                        ))}
                    </ul>
                </section>

                {/* NAV */}
                <footer className="flex justify-between text-sm text-gray-500 pt-10 border-t">
                    <button>← Back to Career Map</button>
                    <button>Next Company →</button>
                </footer>
            </main>

        </div>
    );
}


