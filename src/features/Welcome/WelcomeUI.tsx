"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import Image from "next/image";
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
    Hammer,
    Compass,
    BookOpen,
    Bot,
    Layers,
    Terminal,
    Cpu,
    Rocket,
    Clock,
    FlaskConical,
    LucideIcon,
} from "lucide-react";
import { Icons } from "@/Icon";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { getProjectsData } from "@/data/projectsData";
import { getCareerGraphData } from "@/features/Career/Graph/data/careerData";
import { getFutureStatic } from "@/lib/future/clientRepository";
import TagsCapsule from "@/components/UI/tags/TagsCapsule";
import { Project } from "@/types/project";
import ScrambleText from "./ScrambleText";
import WelcomeGradient from "./WelcomeGradient";
import CircuitBackground from "./CircuitBackground";
import "./welcome.css";

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

const SITE_LANGUAGES = 3; // en / es / ar

// Icon lookup for the future-roadmap telemetry & pipeline items (same keys as FutureUI)
const NOW_ICON_MAP: Record<string, LucideIcon> = {
    Hammer,
    Compass,
    BookOpen,
    Bot,
    Layers,
    Terminal,
    Cpu,
    Rocket,
};

// Aggregate tech tags + stacks for the flowing tech ribbon (React Compiler memoizes this)
function buildTechItems(projects: Project[]): string[] {
    const seen = new Set<string>();
    projects.forEach((p) => {
        p.tags.forEach((t) => seen.add(t));
        p.techStack?.items.forEach((t) => seen.add(t));
    });
    return Array.from(seen).slice(0, 18);
}

export default function WelcomeUI() {
    const lang = useLanguageStore((state) => state.language);
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    const exploreRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement | null>(null);

    // Data-driven highlights
    const projects = getProjectsData(lang);
    const featuredProjects = projects.slice(0, FEATURED_COUNT);

    // Career stops — real entries from the career graph (future goal excluded),
    // themed like the featured project tiles
    const CAREER_THEMES = ["blue", "teal", "emerald", "pink"] as const;
    const careerStops = getCareerGraphData(lang)
        .filter((n) => n.id !== "future")
        .map((n, i) => ({
            ...n,
            theme: projectThemeStyles[CAREER_THEMES[i % CAREER_THEMES.length]],
        }));

    const totalMonths = getCareerGraphData(lang)
        .filter((n) => n.id !== "cognizant" && n.id !== "future")
        .reduce((sum, n) => sum + (n.time_period || 0), 0);
    const years = Math.max(1, Math.round(totalMonths / 12));

    // "Right now" telemetry + pipeline — pulled from the (translated) future roadmap
    const futureData = getFutureStatic(lang);
    const telemetryBadges = futureData.telemetry.badges;
    const visionPillars = futureData.meta.vision_pillars;
    const labProjects = futureData.pipeline.projects;

    // Tech ribbon — aggregated from project tags + stacks
    const techItems = buildTechItems(projects);

    const stats = [
        { icon: Briefcase, value: years, suffix: "+", labelKey: "welcomeStatsYears" },
        { icon: FolderOpen, value: projects.length, suffix: "", labelKey: "welcomeStatsProjects" },
        { icon: FolderGit2, value: 1, suffix: "", labelKey: "welcomeStatsProducts" },
        // { icon: Languages, value: SITE_LANGUAGES, suffix: "", labelKey: "welcomeStatsLangs" },
    ];

    // Destination cards — each points to a detailed page
    const destinations = [
        { id: "career", href: "/career", icon: Briefcase, titleKey: "career", descKey: "welcomeCareerDesc" },
        { id: "projects", href: "/projects", icon: FolderGit2, titleKey: "projects", descKey: "welcomeProjectsDesc" },
        { id: "about", href: "/about", icon: UserRound, titleKey: "about", descKey: "welcomeAboutDesc" },
        { id: "future", href: "/future", icon: Telescope, titleKey: "future", descKey: "welcomeFutureDesc" },
    ];

    // --- Framer motion variants ---
    // Scroll-reveal sections (stagger flows from parent)
    const sectionReveal = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
    } as const;

    // 3D card cascade — cards rise from the bottom and settle into the grid;
    // the stagger from the parent section flows left-to-right in DOM order
    const itemReveal = {
        hidden: { opacity: 0, y: 90, rotateX: 12, scale: 0.96, transformPerspective: 900 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            transformPerspective: 900,
            transition: { type: "spring", stiffness: 80, damping: 20 },
        },
    } as const;

    const scrollToExplore = () => {
        exploreRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Page scroll progress — drives the circuit current pulses (background)
    const { scrollYProgress } = useScroll({ container: mainRef });

    return (
        <>
            <main
                ref={mainRef}
                className="relative min-h-0 flex-1 overflow-y-auto scrollbar-mac text-font-color selection:bg-accent-color/20 selection:text-accent-color"
            >
                <div className="relative">
                    {/* Page-long circuit backdrop — travels with the scroll */}
                    {/* <CircuitBackground progress={scrollYProgress} /> */}

                    {/* Accent aurora gradient backdrop — slow flow + shimmer,
                        reacts to scrolling (rotation follows position, glows swell with velocity) */}
                    <WelcomeGradient progress={scrollYProgress} />

                    <div className="max-w-6xl mx-auto px-6 pb-16">
                        {/* 1. HERO — visible immediately, no scroll reveal */}
                        <section className="relative flex items-center justify-center min-h-[64vh]">
                            <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-6 px-6">
                                <div className="space-y-6">
                                    <span
                                        className="inline-flex items-center gap-2.5 rounded-full border border-borderColor bg-secondary-background/60 backdrop-blur-md px-4 py-1.5 text-xs uppercase tracking-widest font-extrabold text-accent-color"
                                    >
                                        <span className="relative flex h-2 w-2">
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-color" />
                                        </span>
                                        {strings.welcomeTag}
                                    </span>

                                    <h1 className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-accent-color)] via-[var(--color-secondary-accent-color)] to-[var(--color-accent-color)] pb-2">
                                        <ScrambleText text={strings.homePageName} />
                                    </h1>

                                    <p
                                        className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-color to-secondary-accent-color"
                                    >
                                        <ScrambleText text={strings.homePageTitle} delayMs={220} />
                                    </p>

                                    <p
                                        className="max-w-xl mx-auto leading-relaxed text-muted-foreground"
                                    >
                                        {strings.welcomeSubtitle}
                                    </p>

                                    <div
                                        className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2"
                                    >
                                        <button
                                            onClick={scrollToExplore}
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-color to-secondary-accent-color text-white font-semibold shadow-lg shadow-accent-color/25 hover:shadow-accent-color/40 hover:cursor-pointer transition-shadow w-full sm:w-auto justify-center"
                                        >
                                            {strings.welcomeCtaExplore}
                                            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                        </button>

                                        <Link
                                            href="/projects"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background/60 backdrop-blur-md hover:bg-secondary-background text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                                        >
                                            <FolderGit2 className="w-4 h-4" />
                                            {strings.welcomeCtaProjects}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Scroll hint — points down toward the explore section */}
                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                                aria-hidden
                            >
                                <div className="scroll-hint-wheel">
                                    <span />
                                </div>
                            </div>
                        </section>

                        {/* 2. TECH RIBBON — infinite flow (CSS marquee, pauses on hover) */}
                        <section className="py-2" aria-hidden>
                            <div className="tech-marquee overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
                                <div className="tech-marquee-track flex w-max">
                                    {[0, 1].map((half) => (
                                        <div key={half} className="flex items-center gap-2 pr-2">
                                            {techItems.map((item, i) => (
                                                <span
                                                    key={`${half}-${i}`}
                                                    className="flex items-center gap-2 whitespace-nowrap rounded-full border border-borderColor bg-secondary-background/60 backdrop-blur-sm px-4 py-1.5 text-xs font-bold tracking-wide text-muted-foreground"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-accent-color/70" />
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* 3. QUICK STATS — static count-up highlights */}
                        <motion.section
                            variants={sectionReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
                        >
                            {stats.map((stat) => (
                                <motion.div key={stat.labelKey} variants={itemReveal} className="h-full">
                                    <div className="group flex items-center gap-4 bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 hover:border-accent-color/40 transition-colors duration-300 h-full">
                                        <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color shrink-0">
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-3xl font-black tracking-tight text-primary-foreground">
                                                {stat.value}{stat.suffix}
                                            </p>
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                                                {strings[stat.labelKey]}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.section>


                        {/* 7. CAREER PATH — stops along the journey */}
                        <motion.section
                            variants={sectionReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            className="space-y-10 mt-24"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold tracking-tight">{strings.welcomeCareerTitle}</h2>
                                <p className="text-muted-foreground text-sm max-w-2xl">
                                    {strings.welcomeCareerSubtitle}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                                {careerStops.map((stop) => (
                                    <motion.div key={stop.id} variants={itemReveal} className="h-full">
                                        <Link
                                            href="/career"
                                            className="relative flex flex-col h-full bg-secondary-background/40 border border-borderColor hover:border-accent-color/40 rounded-3xl overflow-hidden group transition-colors duration-300"
                                        >
                                            {/* Cover visual — company icon + theme glow + grid + rings */}
                                            <div className="relative h-36 w-full overflow-hidden bg-secondary-background/80 border-b border-borderColor/40 flex items-center justify-center">
                                                <div className={`absolute inset-0 bg-linear-to-b ${stop.theme.glow} opacity-40`} />
                                                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary-foreground-muted)/0.40)_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
                                                <div className="absolute w-28 h-28 rounded-full border border-dashed border-borderColor/40 pointer-events-none" />
                                                <div className="absolute w-44 h-44 rounded-full border border-borderColor/20 pointer-events-none" />
                                                <Image
                                                    src={stop.icon}
                                                    alt={stop.company_name}
                                                    width={56}
                                                    height={56}
                                                    unoptimized
                                                    className="relative z-10 h-14 w-14 rounded-2xl border border-borderColor/60 bg-secondary-background object-contain p-1.5 shadow-md backdrop-blur-xs"
                                                />
                                                {/* duration badge */}
                                                <span className="absolute top-3 left-3 rtl:right-3 rtl:left-auto z-10 flex items-center gap-1 rounded-full border border-borderColor bg-secondary-background/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold tracking-wide text-muted-foreground">
                                                    {stop.time_period} {strings.welcomeMonthsShort}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-3 grow">
                                                <h3 className="text-base font-bold tracking-tight text-primary-foreground line-clamp-1">
                                                    {stop.company_name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                                    {stop.description}
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {stop.projects.slice(0, 3).map((project) => (
                                                        <span
                                                            key={project}
                                                            className="bg-secondary-background border border-borderColor px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                                                        >
                                                            {project}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer link to the career map */}
                                            <div className="border-t border-borderColor p-4">
                                                <span className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-accent-color transition-colors duration-200">
                                                    <span>{strings.viewForMoreDetails}</span>
                                                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                                                </span>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div variants={itemReveal} className="flex justify-center">
                                <Link
                                    href="/career"
                                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent-color transition-colors duration-200 group"
                                >
                                    {strings.welcomeViewCareer}
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>
                            </motion.div>
                        </motion.section>

                        {/* 6. FEATURED WORK — spotlight project cards */}
                        <motion.section
                            variants={sectionReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            className="space-y-10 mt-24"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold tracking-tight">{strings.welcomeFeaturedTitle}</h2>
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
                                            <Link
                                                href={`/projects/${project.path}`}
                                                className="relative flex flex-col h-full bg-secondary-background/40 border border-borderColor hover:border-accent-color/40 rounded-3xl overflow-hidden group transition-colors duration-300"
                                            >
                                                {/* Cover visual — dotted grid + orbital rings + theme glow */}
                                                <div className="relative h-36 w-full overflow-hidden bg-secondary-background/80 border-b border-borderColor/40 flex items-center justify-center">
                                                    <div className={`absolute inset-0 bg-linear-to-b ${theme.glow} opacity-40`} />
                                                    <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary-foreground-muted)/0.40)_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />
                                                    <div className="absolute w-28 h-28 rounded-full border border-dashed border-borderColor/40 pointer-events-none" />
                                                    <div className="absolute w-44 h-44 rounded-full border border-borderColor/20 pointer-events-none" />
                                                    <div className={`relative z-10 w-12 h-12 rounded-2xl border ${theme.iconBg} flex items-center justify-center shadow-md backdrop-blur-xs`}>
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
                                                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                                                    </span>
                                                </div>
                                            </Link>
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
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>
                            </motion.div>
                        </motion.section>

                        {/* 4. RIGHT NOW — live telemetry, pillars & lab pipeline from the future roadmap */}
                        <motion.section
                            variants={sectionReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            className="space-y-8 mt-24"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="flex items-center justify-center gap-3 text-3xl font-extrabold tracking-tight">
                                    {strings.welcomeNowTitle}
                                    <span className="relative flex h-2.5 w-2.5" aria-hidden>
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                    </span>
                                </h2>
                                <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                                    {strings.welcomeNowSubtitle}
                                </p>
                            </div>

                            {/* Telemetry badges — building / exploring / researching */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {telemetryBadges.map((badge) => {
                                    const IconComp = NOW_ICON_MAP[badge.icon] ?? Hammer;
                                    return (
                                        <motion.div key={badge.id} variants={itemReveal} className="h-full">
                                            <Link
                                                href="/future"
                                                className="relative flex flex-col h-full bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 space-y-4 group transition-colors duration-300 hover:border-accent-color/40"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${badge.bgColor} ${badge.color}`}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                    <IconComp className={`w-5 h-5 ${badge.color}`} />
                                                </div>
                                                <p className="text-sm font-bold text-primary-foreground leading-snug">
                                                    {badge.title}
                                                </p>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Vision pillars */}
                            <motion.div variants={itemReveal} className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                                    {strings.welcomePillarsLabel}
                                </span>
                                <TagsCapsule tags={visionPillars} theme="accent" />
                            </motion.div>

                            {/* In the lab — active pipeline teasers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {labProjects.map((proj) => {
                                    const ProjIcon = NOW_ICON_MAP[proj.icon] ?? Terminal;
                                    const isProgress = proj.status_type === "progress";
                                    return (
                                        <motion.div key={proj.id} variants={itemReveal} className="h-full">
                                            <Link
                                                href="/future"
                                                className="relative flex flex-col h-full bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 space-y-4 group transition-colors duration-300 hover:border-accent-color/40"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="p-2.5 rounded-xl bg-accent-color/10 text-accent-color shrink-0">
                                                            <ProjIcon className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-base font-bold tracking-tight text-primary-foreground truncate">
                                                            {proj.name}
                                                        </h3>
                                                    </div>
                                                    <span
                                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isProgress
                                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                                            }`}
                                                    >
                                                        {isProgress ? <Clock className="w-3 h-3" /> : <FlaskConical className="w-3 h-3" />}
                                                        {proj.status}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 grow">
                                                    {proj.problem}
                                                </p>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {proj.stack.slice(0, 4).map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="bg-secondary-background border border-borderColor px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <motion.div variants={itemReveal} className="flex justify-center">
                                <Link
                                    href="/future"
                                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-accent-color transition-colors duration-200 group"
                                >
                                    {strings.welcomeViewFuture}
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </Link>
                            </motion.div>
                        </motion.section>


                        {/* 5. EXPLORE — spotlight destination cards */}
                        <motion.section
                            ref={exploreRef}
                            variants={sectionReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            className="space-y-10 scroll-mt-6 mt-24"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="text-3xl font-extrabold tracking-tight">{strings.welcomeExploreTitle}</h2>
                                <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                                    {strings.welcomeExploreSubtitle}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {destinations.map((dest) => (
                                    <motion.div key={dest.id} variants={itemReveal} className="h-full">
                                        <Link
                                            href={dest.href}
                                            className="relative flex flex-col h-full bg-secondary-background/40 backdrop-blur-md rounded-3xl border border-borderColor p-6 space-y-4 overflow-hidden group transition-colors duration-300 hover:border-accent-color/40"
                                        >
                                            <span className="text-5xl font-black text-accent-color/5 select-none absolute right-4 top-2 group-hover:text-accent-color/10 transition-colors duration-300">
                                                0{destinations.indexOf(dest) + 1}
                                            </span>
                                            <div className="p-3 bg-accent-color/10 rounded-2xl text-accent-color w-fit">
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
                                                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                                            </span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>




                        {/* 8. LET'S CONNECT — static gradient border panel */}
                        <motion.section
                            variants={sectionReveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-80px" }}
                            className="mt-24"
                        >
                            {/* 4. LET'S CONNECT (CTA) */}
                            <motion.section variants={itemReveal} className="relative">
                                <div className="absolute inset-0  via-secondary-accent-color/5 to-accent-color/10 rounded-3xl blur-md" />
                                <div className="relative bg-secondary-background/30 backdrop-blur-sm border border-borderColor p-8 md:p-12 rounded-3xl text-center space-y-6 overflow-hidden">
                                    <div className="space-y-2 max-w-xl mx-auto">
                                        <h2 className="text-3xl font-extrabold tracking-tight">{strings.connectTitle}</h2>
                                        <p className="text-muted-foreground text-sm">{strings.connectSubtitle}</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-color text-white font-semibold shadow-md shadow-accent-color/20 hover:bg-accent-color/90 transition-colors w-full sm:w-auto justify-center"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {strings.contactEmail}
                                        </motion.a>

                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={process.env.NEXT_PUBLIC_GITHUB}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background hover:bg-secondary-background/80 text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                                        >
                                            <Icons.github className="w-4 h-4" />
                                            {strings.contactGithub}
                                        </motion.a>

                                        <motion.a
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={process.env.NEXT_PUBLIC_LINKEDIN}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary-background hover:bg-secondary-background/80 text-font-color font-semibold border border-borderColor w-full sm:w-auto justify-center transition-colors"
                                        >
                                            <Icons.linkedin className="w-4 h-4" />
                                            {strings.contactLinkedin}
                                        </motion.a>
                                    </div>
                                </div>
                            </motion.section>
                        </motion.section>
                    </div>
                </div>
            </main>
        </>
    );
}
