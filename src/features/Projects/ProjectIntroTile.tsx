import { Project } from "@/types/project";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { FC } from "react";
import Link from "next/link";

interface IProps {
    project: Project;
    index: number;
}


// Icon emblem mapping (CSS text characters / unicode glyphs instead of SVG icons)
const EMBLEM_MAP: Record<string, string> = {
    Box: "◈",
    Shirt: "✦",
    Stethoscope: "✚",
    CreditCard: "💳",
    Calendar: "📅",
    Heart: "♥",
    Terminal: ">_",
    HelpCircle: "❖",
};

export const ProjectIntroTile: FC<IProps> = ({ project, index }) => {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    // Theme styles using CSS theme variables (No hardcoded hex or tailwind colors)
    const themeStyles: Record<Project["themeColor"], { glow: string; iconBg: string }> = {

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

    return (
        <article
            key={project.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="relative flex flex-col h-full 
            bg-secondary-background/40 border border-borderColor hover:border-accent-color/40 
            hover:-translate-y-1.5 hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 ease-out group"
        >
            {/* Cover Visual Area using pure CSS background grid & HTML orbital rings (No SVG) */}
            <div className="relative h-44 w-full overflow-hidden
             bg-secondary-background/80 border-b 
             border-borderColor/40 flex items-center 
             justify-center">
                {/* Dynamic Theme Glow */}
                <div className={`absolute inset-0 
                bg-gradient-to-b ${themeStyles[project.themeColor].glow} opacity-40 
                group-hover:opacity-75 transition-opacity duration-500`} />

                {/* Pure CSS Dotted Grid Pattern */}
                <div className="absolute inset-0 
                bg-[radial-gradient(hsl(var(--primary-foreground-muted)/0.2)_1px,transparent_1px)] 
                [background-size:14px_14px] opacity-40 pointer-events-none" />

                {/* CSS HTML Orbital Rings */}
                <div className="absolute w-36 h-36 rounded-full border border-dashed border-borderColor/40 pointer-events-none opacity-60 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute w-52 h-52 rounded-full border border-borderColor/20 pointer-events-none opacity-40 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-borderColor/30 to-transparent top-1/2 pointer-events-none" />
                <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-borderColor/30 to-transparent left-1/2 pointer-events-none" />

                {/* Emblem Icon Container (Pure CSS Typography Badge, No SVG) */}
                <div className={`relative z-10 w-12 h-12 rounded-2xl border ${themeStyles[project.themeColor].iconBg} flex items-center justify-center font-mono text-xl font-black shadow-md backdrop-blur-xs transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3`}>
                    <span>{EMBLEM_MAP[project.icon]}</span>
                </div>

                {/* Floating sub-badges */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 px-4">
                    {project.tags.map((badge, idx) => (
                        <span key={idx} className="bg-primary-background/90 backdrop-blur-xs text-font-color border border-borderColor px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide shadow-xs transition-transform duration-200 group-hover:scale-105">
                            {badge}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-col flex-1 p-6 space-y-4">
                {/* Metadata / What it is Tags */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] tracking-wider font-extrabold uppercase text-accent-color px-2 py-0.5 rounded-full bg-accent-color/10 border border-accent-color/20">
                        {project.category}
                    </span>
                    {project.badges.map((key, idx) => {
                        const isFeatured = key === "badgFeatured";
                        return (
                            <span
                                key={idx}
                                className={`text-[8px] tracking-wider font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${isFeatured
                                    ? "bg-accent-color/15 text-accent-color border-accent-color/30 font-bold"
                                    : "bg-secondary-background text-muted-foreground border-borderColor/60"
                                    }`}
                            >
                                {key}
                            </span>
                        );
                    })}
                </div>

                {/* Project Title */}
                <h3 className="text-lg font-bold tracking-tight text-font-color group-hover:text-accent-color transition-colors duration-200">
                    {project.title}
                </h3>

                {/* Problem Statement */}
                <div className="space-y-1">
                    <span className="text-[9px] font-extrabold text-muted-foreground/60 uppercase tracking-widest block">{project.problem.title}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {project.problem.description}
                    </p>
                </div>

                {/* Solution (Highlighted Callout) */}
                <div className="p-3.5 rounded-xl border border-accent-color/20 bg-accent-color/5 flex flex-col gap-1 transition-colors duration-200 group-hover:border-accent-color/30">
                    <span className="text-[9px] font-extrabold text-accent-color uppercase tracking-widest block">{project.solution.title}</span>
                    <span className="text-[11px] text-accent-color font-semibold leading-relaxed">
                        {project.solution.description}
                    </span>
                </div>

                {/* Tech Stack/Tools */}
                <div className="space-y-2 pt-1">
                    <span className="text-[9px] font-extrabold text-muted-foreground/60 uppercase tracking-widest block">{project.techStack.title}</span>
                    <div className="flex flex-wrap gap-1">
                        {project.techStack.items.map((tech, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 
                            px-2 py-0.5 rounded-lg border border-borderColor bg-secondary-background/60
                             text-[9px] font-mono text-muted-foreground hover:border-accent-color/20 
                             transition-colors">
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* View for more details link */}
                <div className="border-t border-borderColor/40 pt-4 mt-auto">
                    {project.path ? (
                        <Link
                            href={`/projects/${project.path}`}
                            className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-accent-color transition-colors duration-200 group-hover:cursor-pointer"
                        >
                            <span>{strings.viewForMoreDetails}</span>
                            <span className="transform transition-transform duration-300 ease-out group-hover:translate-x-1.5">➔</span>
                        </Link>
                    ) : (
                        <a
                            href={project.demoUrl || project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground group-hover:text-accent-color transition-colors duration-200 group-hover:cursor-pointer"
                        >
                            <span>{strings.viewForMoreDetails}</span>
                            <span className="transform transition-transform duration-300 ease-out group-hover:translate-x-1.5">➔</span>
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
