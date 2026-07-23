"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import {
    Rocket,
    Compass,
    Bot,
    Terminal,
    Layers,
    Mail,
    Sparkles,
    BookOpen,
    Hammer,
    Clock,
    FlaskConical,
    Cpu,
    LucideIcon
} from "lucide-react";
import { Icons } from "@/Icon";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { FuturePageData } from "@/types/future";
import { getFutureStatic } from "@/lib/future/clientRepository";

const ICON_MAP: Record<string, LucideIcon> = {
    Hammer,
    Compass,
    BookOpen,
    Bot,
    Layers,
    Terminal,
    Cpu,
    Rocket
};

export interface IFutureUIProps {
    initialData?: FuturePageData;
}

export default function FutureUI({ initialData }: IFutureUIProps) {
    const lang = useLanguageStore((state) => state.language);
    const [data, setData] = useState<FuturePageData>(initialData || getFutureStatic(lang));
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/mainpages/future/${lang}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data && isMounted) {
                        setData(json.data);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch future page data", err);
            }
            if (isMounted) {
                setData(getFutureStatic(lang));
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [lang]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            },
        },
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 },
        },
    } as const;

    const cardHoverVariants = {
        hover: {
            y: -6,
            transition: { duration: 0.25, ease: "easeOut" }
        }
    } as const;

    if (!data || !data.meta) {
        return null;
    }

    return (
        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-mac bg-primary-background text-font-color selection:bg-accent-color/20 selection:text-accent-color">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto px-6 py-16 space-y-20"
            >
                {/* 1. CORE VISION & HERO */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="space-y-4 max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-color/10 border border-accent-color/20 text-accent-color text-xs font-bold uppercase tracking-widest">
                            <Rocket className="w-3.5 h-3.5" />
                            <span>{data.meta.badge}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            {data.meta.title_part1}{" "}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-color)] to-[var(--color-secondary-accent-color)]">
                                {data.meta.title_part2}
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            {data.meta.subtitle}
                        </p>
                    </div>

                    {/* Core Vision Pillars */}
                    <div className="pt-2">
                        <TagsCapsule tags={data.meta.vision_pillars} theme="accent" />
                    </div>

                    {/* Right Now Status Badges */}
                    <div className="pt-4 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-500 uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>{data.telemetry.section_title}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {data.telemetry.badges.map((badge) => {
                                const IconComp = ICON_MAP[badge.icon] || Hammer;
                                return (
                                    <div
                                        key={badge.id}
                                        className="p-6 rounded-2xl bg-secondary-background/50 border border-borderColor shadow-xs flex flex-col justify-between space-y-4 transition-all duration-300 hover:border-accent-color/40"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${badge.bgColor} ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                            <IconComp className={`w-5 h-5 ${badge.color}`} />
                                        </div>
                                        <p className="text-base font-bold text-primary-foreground leading-snug">
                                            {badge.title}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.section>

                {/* 2. ACTIVE VECTORS & DOMAIN FOCUS */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="space-y-2 border-b border-borderColor pb-6">
                        <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
                            {data.vectors.section_tag}
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight">{data.vectors.section_title}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            {data.vectors.section_subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {data.vectors.items.map((vec) => {
                            const IconComp = ICON_MAP[vec.icon] || Bot;
                            return (
                                <motion.div
                                    key={vec.id}
                                    variants={cardHoverVariants}
                                    whileHover="hover"
                                    className="bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-8 flex flex-col justify-between space-y-6 hover:shadow-lg transition-all duration-300 relative group"
                                >
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color">
                                                <IconComp className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase bg-primary-background px-3 py-1 rounded-full border border-borderColor">
                                                {vec.index_label}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-accent-color">
                                                {vec.tag}
                                            </span>
                                            <h3 className="text-xl font-bold tracking-tight text-primary-foreground">
                                                {vec.title}
                                            </h3>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {vec.why}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-borderColor/60 space-y-2">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {data.vectors.focus_tech_label}
                                        </span>
                                        <TagsCapsule tags={vec.tech_stack} theme="accent" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* 3. PROJECT PIPELINE */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="space-y-2 border-b border-borderColor pb-6">
                        <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
                            {data.pipeline.section_tag}
                        </span>
                        <h2 className="text-3xl font-extrabold tracking-tight">{data.pipeline.section_title}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            {data.pipeline.section_subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {data.pipeline.projects.map((proj) => {
                            const ProjIcon = ICON_MAP[proj.icon] || Terminal;
                            const isProgress = proj.status_type === "progress";
                            return (
                                <div
                                    key={proj.id}
                                    className="bg-linear-to-br from-secondary-background/60 to-primary-background border border-borderColor rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-accent-color/40 transition-all"
                                >
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 rounded-xl bg-accent-color/10 text-accent-color">
                                                    <ProjIcon className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-2xl font-bold tracking-tight">{proj.name}</h3>
                                            </div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                                                    isProgress
                                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                }`}
                                            >
                                                {isProgress ? <Clock className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                                                {proj.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {proj.problem}
                                        </p>

                                        <div className="space-y-3 bg-secondary-background/80 p-5 rounded-2xl border border-borderColor/50">
                                            <span className="text-xs font-bold uppercase tracking-wider text-primary-foreground flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-accent-color" />
                                                {data.pipeline.core_highlights_label}
                                            </span>
                                            <ul className="space-y-2">
                                                {proj.highlights.map((item, hIdx) => (
                                                    <li key={hIdx} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                                                        <span className="text-accent-color font-bold mt-0.5">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {data.pipeline.tech_stack_label}
                                        </span>
                                        <TagsCapsule tags={proj.stack} theme="accent" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* 4. COLLABORATION & CONTACT (THE LAUNCHPAD) */}
                <motion.section variants={itemVariants} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-color/5 via-secondary-accent-color/5 to-accent-color/10 rounded-3xl blur-md" />
                    <div className="relative bg-secondary-background/40 backdrop-blur-sm border border-borderColor p-8 md:p-12 rounded-3xl space-y-8">
                        <div className="space-y-3 max-w-2xl">
                            <span className="text-xs uppercase tracking-widest font-extrabold text-accent-color">
                                {data.launchpad.section_tag}
                            </span>
                            <h2 className="text-3xl font-extrabold tracking-tight">{data.launchpad.section_title}</h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {data.launchpad.section_subtitle}
                            </p>
                        </div>

                        {/* Interactive Topic Selection Pills */}
                        <div className="space-y-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {data.launchpad.topic_select_label}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {data.launchpad.topics.map((topic, tIdx) => {
                                    const isSelected = selectedTopic === topic;
                                    return (
                                        <button
                                            key={tIdx}
                                            onClick={() => setSelectedTopic(isSelected ? null : topic)}
                                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                                                isSelected
                                                    ? "bg-accent-color text-white border-accent-color shadow-sm"
                                                    : "bg-primary-background/60 hover:bg-secondary-background text-font-color border-borderColor"
                                            }`}
                                        >
                                            {topic} {isSelected && "✓"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contact Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-borderColor/60 items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                                {selectedTopic ? (
                                    <span>
                                        {data.launchpad.selected_interest_prefix}{" "}
                                        <strong className="text-accent-color">{selectedTopic}</strong>
                                    </span>
                                ) : (
                                    <span>{data.launchpad.default_reach_out_text}</span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                <motion.a
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    href={`mailto:${data.launchpad.contacts.email_address}${
                                        selectedTopic ? `?subject=${encodeURIComponent(`Collaborate on: ${selectedTopic}`)}` : ""
                                    }`}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent-color text-white font-semibold text-xs shadow-md shadow-accent-color/20 hover:bg-accent-color/90 transition-colors justify-center"
                                >
                                    <Mail className="w-4 h-4" />
                                    {data.launchpad.contacts.email_label}
                                </motion.a>

                                <motion.a
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    href={data.launchpad.contacts.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-background hover:bg-secondary-background text-font-color font-semibold text-xs border border-borderColor justify-center transition-colors"
                                >
                                    <Icons.github className="w-4 h-4" />
                                    {data.launchpad.contacts.github_label}
                                </motion.a>

                                <motion.a
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    href={data.launchpad.contacts.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-background hover:bg-secondary-background text-font-color font-semibold text-xs border border-borderColor justify-center transition-colors"
                                >
                                    <Icons.linkedin className="w-4 h-4" />
                                    {data.launchpad.contacts.linkedin_label}
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </motion.div>
        </main>
    );
}
