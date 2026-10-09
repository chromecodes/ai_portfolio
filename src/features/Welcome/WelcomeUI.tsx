"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
    Briefcase,
    FolderGit2,
    UserRound,
    Telescope,
    ArrowRight,
    Mail,
    Languages,
    FolderOpen,
} from "lucide-react";
import { Icons } from "@/Icon";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { getProjectsData } from "@/data/projectsData";
import { getCareerGraphData } from "@/features/Career/Graph/data/careerData";
import { Project } from "@/types/project";
import TiltCard from "./TiltCard";
import MagneticButton from "./MagneticButton";
import Marquee from "./Marquee";
import CountUp from "./CountUp";
import "./welcome.css";

// Full-page cinematic 3D world — fixed viewport-filling canvas behind the content
const PageScene = dynamic(() => import("./PageScene"), { ssr: false, loading: () => null });

// Theme styles for featured project tiles (mirrors ProjectTileHeader)
const projectThemeStyles: Record<Project["themeColor"], { glow: string; iconBg: string }> = {
    pink: {
        glow: "from-accent-color/20 via-secondary-accent-color/5 to-transparent",
        iconBg: "bg-accent-color/10 text-accent-color border-accent-color/30",
    },
    green: {
        glow: "from-success-color/20 via-accent-color/5 to-transparent",
        iconBg: "bg-success-color/10 text-success-color border-success-color/30",
    },
    teal: {
        glow: "from-secondary-accent-color/20 via-success-color/5 to-transparent",
        iconBg: "bg-secondary-accent-color/10 text-secondary-accent-color border-secondary-accent-color/30",
    },
    purple: {
        glow: "from-accent-color/20 via-secondary-accent-color/10 to-transparent",
        iconBg: "bg-accent-color/10 text-accent-color border-accent-color/30",
    },
    blue: {
        glow: "from-secondary-accent-color/20 via-accent-color/5 to-transparent",
        iconBg: "bg-secondary-accent-color/10 text-secondary-accent-color border-secondary-accent-color/30",
    },
    emerald: {
        glow: "from-success-color/20 via-secondary-accent-color/5 to-transparent",
        iconBg: "bg-success-color/10 text-success-color border-success-color/30",
    },
    zinc: {
        glow: "from-font-color-muted/15 via-secondary-background to-transparent",
        iconBg: "bg-secondary-background text-font-color border-borderColor",
    },
};

const FEATURED_COUNT = 3;

// Aggregate tech tags + stacks for the marquee (React Compiler memoizes this)
function buildMarqueeItems(projects: Project[]): string[] {
    const seen = new Set<string>();
    projects.forEach((p) => {
        p.tags.forEach((t) => seen.add(t));
        p.techStack?.items.forEach((t) => seen.add(t));
    });
    return Array.from(seen).slice(0, 14);
}

export default function WelcomeUI() {
    const lang = useLanguageStore((state) => state.language);
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    const exploreRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLElement | null>(null);
    const mainRef = useRef<HTMLElement | null>(null);
    const reduced = useReducedMotion();

    // Data-driven highlights
    const projects = getProjectsData(lang);
    const featuredProjects = projects.slice(0, FEATURED_COUNT);

    const careerNodes = getCareerGraphData(lang);
    const totalMonths = careerNodes
        .filter((n) => n.id !== "future")
        .reduce((sum, n) => sum + (n.time_period || 0), 0);
    const years = Math.max(1, Math.round(totalMonths / 12));

    // Tech marquee — aggregated from project tags + stacks
    const marqueeItems = buildMarqueeItems(projects);

    const stats = [
        { icon: FolderOpen, value: years, suffix: "+", labelKey: "welcomeStatsYears" },
        { icon: Briefcase, value: projects.length, suffix: "", labelKey: "welcomeStatsProjects" },
        { icon: Languages, value: 3, suffix: "", labelKey: "welcomeStatsLangs" },
    ];

    // Destination cards — each points to a detailed page
    const destinations = [
        { id: "career", href: "/career", icon: Briefcase, titleKey: "career", descKey: "welcomeCareerDesc" },
        { id: "projects", href: "/projects", icon: FolderGit2, titleKey: "projects", descKey: "welcomeProjectsDesc" },
        { id: "about", href: "/about", icon: UserRound, titleKey: "about", descKey: "welcomeAboutDesc" },
        { id: "future", href: "/future", icon: Telescope, titleKey: "future", descKey: "welcomeFutureDesc" },
    ];

    // --- Scroll-driven parallax (main is the scroll container; drives the 3D dolly too) ---
    const { scrollYProgress } = useScroll({
        container: mainRef,
        target: heroRef,
        offset: ["start start", "end start"],
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, -70]);

    // --- Framer motion variants ---
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    } as const;

    // Kinetic word-by-word headline
    const wordContainer = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
    } as const;

    const wordVariant = {
        hidden: { opacity: 0, y: 34, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { type: "spring", stiffness: 110, damping: 16 },
        },
    } as const;

    // Scroll-reveal sections (stagger flows from parent)
    const sectionReveal = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
    } as const;

    const itemReveal = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 90, damping: 18 },
        },
    } as const;

    const fadeUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    } as const;

    const scrollToExplore = () => {
        exploreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const heroContentStyle = reduced ? undefined : { opacity: heroOpacity, y: heroY };

    return (
        <>
            {/* Cinematic 3D world — the career graph as a flyable constellation */}
            <PageScene
                scrollContainerRef={mainRef}
                careerNodes={careerNodes.map((n) => ({
                    id: n.id,
                    label: n.company_name,
                    time: n.time_period,
                    projects: n.projects,
                }))}
            />

            <main
                ref={mainRef}
                className="relative min-h-0 flex-1 overflow-y-auto scrollbar-mac text-font-color selection:bg-accent-color/20 selection:text-accent-color"
            >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto px-6 pb-16"
            >
                {/* 1. HERO — text floating over the 3D world */}
                <motion.section ref={heroRef} className="relative flex items-center justify-center min-h-[92vh]">
                    {/* Animated aurora blobs + grid overlay */}
                    <div className="absolute inset-0 overflow-hidden" aria-hidden>
                        <div className="aurora-blob aurora-blob-1" />
                        <div className="aurora-blob aurora-blob-2" />
                        <div className="aurora-blob aurora-blob-3" />
                        <div className="welcome-grid absolute inset-0" />
                    </div>

                    {/* Soft backdrop for readability over the 3D world */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                        <div className="w-[42rem] h-[42rem] max-w-full rounded-full bg-primary-background/40 blur-3xl" />
                    </div>

                    <motion.div
                        style={heroContentStyle}
                        className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-6 py-24"
                    >
                        <div className="space-y-6">
                            <motion.span
                                variants={fadeUp}
                                className="inline-flex items-center gap-2.5 rounded-full border border-borderColor bg-secondary-background/60 backdrop-blur-md px-4 py-1.5 text-xs uppercase tracking-widest font-extrabold text-accent-color"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-color opacity-60" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-color" />
                                </span>
                                {strings.welcomeTag}
                            </motion.span>

                            <motion.h1
                                variants={wordContainer}
                                initial="hidden"
                                animate="visible"
                                className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-color)] via-[var(--color-secondary-accent-color)] to-[var(--color-accent-color)] text-shimmer pb-2"
                            >
                                {strings.homePageName.split(" ").map((word, i) => (
                                    <motion.span
                                        key={i}
                                        variants={wordVariant}
                                        className="inline-block will-change-transform"
                                    >
                                        {word}{"\u00A0"}
                                    </motion.span>
                                ))}
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-color to-secondary-accent-color"
                            >
                                {strings.homePageTitle}
                            </motion.p>

                            <motion.p
                                variants={fadeUp}
                                className="max-w-xl mx-auto leading-relaxed text-muted-foreground"
                            >
                                {strings.welcomeSubtitle}
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2"
                            >
                                <MagneticButton>
                                    <motion.button
                                        onClick={scrollToExplore}
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-color to-secondary-accent-color text-white font-semibold shadow-lg shadow-accent-color/25 hover:shadow-accent-color/40 hover:cursor-pointer transition-shadow w-full sm:w-auto justify-center"
                                    >
                                        {strings.welcomeCtaExplore}
                                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                    </motion.button>
                                </MagneticButton>

                                <MagneticButton>
                                    <Link
                                        href="/projects"
                                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background/60 backdrop-blur-md hover:bg-secondary-background text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                                    >
                                        <FolderGit2 className="w-4 h-4" />
                                        {strings.welcomeCtaProjects}
                                    </Link>
                                </MagneticButton>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Scroll hint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                        aria-hidden
                    >
                        <div className="scroll-hint-wheel">
                            <span />
                        </div>
                    </motion.div>
                </motion.section>

                {/* 2. TECH MARQUEE — infinite scrolling ribbon */}
                <section className="py-2">
                    <Marquee items={marqueeItems} />
                </section>

                {/* 3. QUICK STATS — animated count-up highlights */}
                <motion.section
                    variants={sectionReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16"
                >
                    {stats.map((stat) => (
                        <motion.div key={stat.labelKey} variants={itemReveal} className="h-full">
                            <div className="group flex items-center gap-4 bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 hover:border-accent-color/40 transition-colors duration-300 h-full">
                                <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black tracking-tight text-primary-foreground">
                                        <CountUp value={stat.value} suffix={stat.suffix} />
                                    </p>
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                        {strings[stat.labelKey]}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.section>

                {/* 4. EXPLORE — 3D tilt destination cards */}
                <motion.section
                    ref={exploreRef}
                    variants={sectionReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="space-y-10 scroll-mt-6 mt-24"
                >
                    <div className="space-y-2 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight float-text">{strings.welcomeExploreTitle}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                            {strings.welcomeExploreSubtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {destinations.map((dest) => (
                            <motion.div key={dest.id} variants={itemReveal} className="h-full">
                                <TiltCard>
                                    <Link
                                        href={dest.href}
                                        className="relative flex flex-col h-full bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 space-y-4 overflow-hidden group transition-colors duration-300 hover:border-accent-color/40"
                                    >
                                        <span className="text-5xl font-black text-accent-color/5 select-none absolute right-4 top-2 group-hover:text-accent-color/10 transition-colors duration-300">
                                            0{destinations.indexOf(dest) + 1}
                                        </span>
                                        <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color w-fit group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                                            <dest.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight text-primary-foreground">
                                            {strings[dest.titleKey]}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed grow">
                                            {strings[dest.descKey]}
                                        </p>
                                        <span className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-accent-color transition-colors duration-200">
                                            <span>{strings.welcomeExploreLabel}</span>
                                            <ArrowRight className="w-3.5 h-3.5 transform transition-transform duration-300 ease-out group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                                        </span>
                                    </Link>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* 5. FEATURED WORK — 3D tilt project cards */}
                <motion.section
                    variants={sectionReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="space-y-10 mt-24"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight float-text">{strings.welcomeFeaturedTitle}</h2>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            {strings.welcomeFeaturedSubtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {featuredProjects.map((project) => {
                            const IconComponent = Icons[project.icon as keyof typeof Icons];
                            const theme = projectThemeStyles[project.themeColor] ?? projectThemeStyles.zinc;
                            return (
                                <motion.div key={project.id} variants={itemReveal} className="h-full">
                                    <TiltCard maxTilt={8}>
                                        <Link
                                            href={`/projects/${project.path}`}
                                            className="relative flex flex-col h-full bg-secondary-background/40 border border-borderColor hover:border-accent-color/40 rounded-3xl overflow-hidden group transition-colors duration-300"
                                        >
                                            {/* Cover visual — dotted grid + orbital rings + theme glow */}
                                            <div className="relative h-36 w-full overflow-hidden bg-secondary-background/80 border-b border-borderColor/40 flex items-center justify-center">
                                                <div className={`absolute inset-0 bg-linear-to-b ${theme.glow} opacity-40 group-hover:opacity-75 transition-opacity duration-500`} />
                                                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary-foreground-muted)/0.40)_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
                                                <div className="absolute w-28 h-28 rounded-full border border-dashed border-borderColor/40 pointer-events-none group-hover:scale-105 group-hover:rotate-45 transition-transform duration-500" />
                                                <div className="absolute w-44 h-44 rounded-full border border-borderColor/20 pointer-events-none group-hover:scale-105 transition-transform duration-500" />
                                                <div className={`relative z-10 w-12 h-12 rounded-2xl border ${theme.iconBg} flex items-center justify-center shadow-md backdrop-blur-xs transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3`}>
                                                    {IconComponent ? <IconComponent className="w-6 h-6" /> : "?"}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-3 grow">
                                                <h3 className="text-base font-bold tracking-tight text-primary-foreground line-clamp-1">
                                                    {project.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                                    {project.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {project.tags.slice(0, 3).map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-secondary-background border border-borderColor px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer link to detail page */}
                                            <div className="border-t border-borderColor p-4">
                                                <span className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-accent-color transition-colors duration-200">
                                                    <span>{strings.viewForMoreDetails}</span>
                                                    <ArrowRight className="w-3.5 h-3.5 transform transition-transform duration-300 ease-out group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                                                </span>
                                            </div>
                                        </Link>
                                    </TiltCard>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div variants={itemReveal} className="flex justify-center">
                        <Link
                            href="/projects"
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent-color transition-colors duration-200 group"
                        >
                            {strings.welcomeViewAll}
                            <ArrowRight className="w-4 h-4 transform transition-transform duration-300 ease-out group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                        </Link>
                    </motion.div>
                </motion.section>

                {/* 6. LET'S CONNECT — spinning gradient border + magnetic socials */}
                <motion.section
                    variants={sectionReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="mt-24"
                >
                    <div className="border-spin rounded-3xl p-0.5">
                        <div className="relative bg-primary-background rounded-[22px] p-8 md:p-12 text-center space-y-6 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-color/5 via-secondary-accent-color/5 to-accent-color/10 pointer-events-none" />
                            <motion.div variants={itemReveal} className="relative space-y-2 max-w-xl mx-auto">
                                <h2 className="text-3xl font-extrabold tracking-tight float-text">{strings.welcomeCtaTitle}</h2>
                                <p className="text-muted-foreground text-sm">{strings.welcomeCtaSubtitle}</p>
                            </motion.div>

                            <motion.div
                                variants={itemReveal}
                                className="relative flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                            >
                                    <MagneticButton>
                                        <motion.a
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-color to-secondary-accent-color text-white font-semibold shadow-lg shadow-accent-color/25 hover:shadow-accent-color/40 transition-shadow w-full sm:w-auto justify-center"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {strings.contactEmail}
                                        </motion.a>
                                    </MagneticButton>

                                    <MagneticButton>
                                        <motion.a
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            href={process.env.NEXT_PUBLIC_GITHUB}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background hover:bg-secondary-background/80 text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                                        >
                                            <Icons.github className="w-4 h-4" />
                                            {strings.contactGithub}
                                        </motion.a>
                                    </MagneticButton>

                                    <MagneticButton>
                                        <motion.a
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            href={process.env.NEXT_PUBLIC_LINKEDIN}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background hover:bg-secondary-background/80 text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                                        >
                                            <Icons.linkedin className="w-4 h-4" />
                                            {strings.contactLinkedin}
                                        </motion.a>
                                    </MagneticButton>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            </motion.div>
            </main>
        </>
    );
}
