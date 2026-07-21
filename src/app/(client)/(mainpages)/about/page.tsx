"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import { Mail, Code2, Zap, Sparkles } from "lucide-react";
import { Icons } from "@/Icon";
import ImageViewer from "@/components/ImageViewer/ImageViewer";

export default function AboutPage() {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);

    // Framer motion variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 },
        },
    } as const;

    const cardHoverVariants = {
        hover: {
            y: -8,
            borderColor: "var(--color-accent-color)",
            boxShadow: "0 10px 30px -10px rgba(var(--accent), 0.15)",
            transition: { duration: 0.3, ease: "easeOut" }
        }
    } as const;

    const frontendSkills = [
        "React", "Next.js", "TypeScript", "Tailwind CSS",
        "React Server Components (RSC)", "WebSockets / SSE",
        "Framer Motion", "Zustand", "i18n & Localization",
        "HTML5 / CSS3", "Responsive Design"
    ];

    const backendSkills = [
        "Node.js", "Express", "Python", "FastAPI & Pydantic",
        "REST & GraphQL", "PostgreSQL (pgvector)", "MongoDB",
        "Serverless & Edge (Vercel Edge, AWS Lambda)",
        "Vector DBs (Pinecone, Milvus, Qdrant)"
    ];

    const aiSkills = [
        "LangGraph & LangChain", "LlamaIndex",
        "Local Inference (Ollama, vLLM)", "RAG Architectures",
        "Multi-Agent Systems", "Function / Tool Calling",
        "Structured Prompting", "Embedding Generation",
        "Document Chunking", "Unstructured Data ETL"
    ];

    const toolsSkills = [
        "Git & GitHub", "Docker", "Vercel & GCP",
        "CLI & Env Management (uv, Poetry)",
        "E2E Testing (Playwright, Cypress)",
        "LLMOps & Observability (LangSmith, W&B)",
        "CI/CD Pipelines", "Linux Shell", "System Design"
    ];

    return (
        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-mac bg-primary-background text-font-color selection:bg-accent-color/20 selection:text-accent-color">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto px-6 py-16 space-y-24"
            >
                {/* 1. HERO SECTION (Bio + Picture) */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
                                {strings.about}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-color)] via-[var(--color-secondary-accent-color)] to-[var(--color-accent-color)] animate-pulse-slow">
                                {strings.aboutTitle}
                            </h1>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-primary-foreground leading-snug">
                            {strings.aboutSubtitle}
                        </h2>

                        <div className="space-y-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
                            <p>{strings.aboutBioPart1}</p>
                            <p>{strings.aboutBioPart2}</p>
                        </div>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 200, damping: 12 }}
                            className="relative group rounded-3xl overflow-hidden border border-borderColor bg-secondary-background/40 p-4 shadow-xl max-w-sm w-full"
                        >
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary-background border border-borderColor/50 shadow-inner">
                                <ImageViewer
                                    images={[
                                        {
                                            id: "about_avatar_1",
                                            src: "/images/about.webp",
                                            alt: "Hameed Hussain Avatar",
                                            blurSrc: "/images/about_blur.webp",
                                            type: "image"
                                        },
                                    ]}
                                    aspectRatio="square" curvedEdge={true}
                                />
                            </div>
                            <div className="absolute inset-0 bg-radial from-accent-color/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </motion.div>
                    </div>
                </motion.section>

                {/* 2. TECHNICAL EXPERTISE */}
                <motion.section variants={itemVariants} className="space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight">{strings.skillsTitle}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">{strings.skillsSubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Frontend Card */}
                        <motion.div
                            variants={cardHoverVariants}
                            whileHover="hover"
                            className="bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-3xl">💻</span>
                                    <span className="text-5xl font-black text-accent-color/5 select-none absolute right-4 top-2 group-hover:text-accent-color/10 transition-colors duration-300">01</span>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-primary-foreground">{strings.frontend}</h3>
                            </div>
                            <div className="mt-6">
                                <TagsCapsule tags={frontendSkills} theme="accent" />
                            </div>
                        </motion.div>

                        {/* Backend Card */}
                        <motion.div
                            variants={cardHoverVariants}
                            whileHover="hover"
                            className="bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                        >
                            <div className="space-y-4 font-sans">
                                <div className="flex justify-between items-center">
                                    <span className="text-3xl">⚙️</span>
                                    <span className="text-5xl font-black text-accent-color/5 select-none absolute right-4 top-2 group-hover:text-accent-color/10 transition-colors duration-300">02</span>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-primary-foreground">{strings.backend}</h3>
                            </div>
                            <div className="mt-6">
                                <TagsCapsule tags={backendSkills} theme="accent" />
                            </div>
                        </motion.div>

                        {/* Applied AI Card */}
                        <motion.div
                            variants={cardHoverVariants}
                            whileHover="hover"
                            className="bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-3xl">🤖</span>
                                    <span className="text-5xl font-black text-accent-color/5 select-none absolute right-4 top-2 group-hover:text-accent-color/10 transition-colors duration-300">03</span>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-primary-foreground">{strings.appliedAi || "Applied AI & Systems"}</h3>
                            </div>
                            <div className="mt-6">
                                <TagsCapsule tags={aiSkills} theme="accent" />
                            </div>
                        </motion.div>

                        {/* Tools/Infrastructure Card */}
                        <motion.div
                            variants={cardHoverVariants}
                            whileHover="hover"
                            className="bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-3xl">🛠️</span>
                                    <span className="text-5xl font-black text-accent-color/5 select-none absolute right-4 top-2 group-hover:text-accent-color/10 transition-colors duration-300">04</span>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-primary-foreground">{strings.toolsAndDevops}</h3>
                            </div>
                            <div className="mt-6">
                                <TagsCapsule tags={toolsSkills} theme="accent" />
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* 3. ENGINEERING VALUES */}
                <motion.section variants={itemVariants} className="space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight">{strings.philosophyTitle}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">{strings.philosophySubtitle}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-linear-to-br from-secondary-background/50 to-primary-background/30 p-8 rounded-3xl border border-borderColor shadow-xs space-y-4 flex flex-col items-start"
                        >
                            <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color">
                                <Code2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">{strings.valueCleanCode}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{strings.valueCleanCodeDesc}</p>
                        </motion.div>

                        {/* Value 2 */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-linear-to-br from-secondary-background/50 to-primary-background/30 p-8 rounded-3xl border border-borderColor shadow-xs space-y-4 flex flex-col items-start"
                        >
                            <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">{strings.valuePerformance}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{strings.valuePerformanceDesc}</p>
                        </motion.div>

                        {/* Value 3 */}
                        <motion.div
                            whileHover={{ y: -4 }}
                            className="bg-linear-to-br from-secondary-background/50 to-primary-background/30 p-8 rounded-3xl border border-borderColor shadow-xs space-y-4 flex flex-col items-start"
                        >
                            <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">{strings.valueUserCentric}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{strings.valueUserCentricDesc}</p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* 4. LET'S CONNECT (CTA) */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-color/5 via-secondary-accent-color/5 to-accent-color/10 rounded-3xl blur-md" />
                    <div className="relative bg-secondary-background/30 backdrop-blur-sm border border-borderColor p-8 md:p-12 rounded-3xl text-center space-y-6 overflow-hidden">
                        <div className="space-y-2 max-w-xl mx-auto">
                            <h2 className="text-3xl font-extrabold tracking-tight">{strings.connectTitle}</h2>
                            <p className="text-muted-foreground text-sm">{strings.connectSubtitle}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="mailto:hameedhussain@example.com"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-color text-white font-semibold shadow-md shadow-accent-color/20 hover:bg-accent-color/90 transition-colors w-full sm:w-auto justify-center"
                            >
                                <Mail className="w-4 h-4" />
                                {strings.contactEmail}
                            </motion.a>

                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background hover:bg-secondary-background/80 text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                            >
                                <Icons.github className="w-4 h-4" />
                                {strings.contactGithub}
                            </motion.a>

                            <motion.a
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background hover:bg-secondary-background/80 text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                            >
                                <Icons.linkedin className="w-4 h-4" />
                                {strings.contactLinkedin}
                            </motion.a>
                        </div>
                    </div>
                </motion.section>
            </motion.div>
        </main>
    );
}