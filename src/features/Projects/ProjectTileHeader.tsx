import { Icons } from "@/Icon";
import { Project } from "@/types/project";

export const ProjectTileHeader = ({ project }: { project: Project }) => {
    const IconComponent = Icons[project.icon as keyof typeof Icons];

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
        <div>
            {/* Cover Visual Area using pure CSS background grid & HTML orbital rings (No SVG) */}
            <div className="relative h-44 w-full overflow-hidden bg-secondary-background/80 border-b border-borderColor/40 flex items-center justify-center">
                {/* Dynamic Theme Glow */}
                <div className={`absolute inset-0 bg-linear-to-b ${themeStyles[project.themeColor].glow} opacity-40 group-hover:opacity-75 transition-opacity duration-500`} />

                {/* Pure CSS Dotted Grid Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary-foreground-muted)/0.40)_1px,transparent_1px)] [background-size:14px_14px] opacity-100 pointer-events-none" />

                {/* CSS HTML Orbital Rings */}
                <div className="absolute w-36 h-36 rounded-full border border-dashed border-borderColor/40 pointer-events-none opacity-100 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute w-52 h-52 rounded-full border border-borderColor/20 pointer-events-none opacity-90 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute w-full h-px bg-linear-to-r from-transparent via-borderColor/30 to-transparent top-1/2 pointer-events-none" />
                <div className="absolute h-full w-px bg-linear-to-b from-transparent via-borderColor/30 to-transparent left-1/2 pointer-events-none" />

                {/* Emblem Icon Container */}
                <div className={`relative z-10 w-12 h-12 rounded-2xl border ${themeStyles[project.themeColor].iconBg} flex items-center justify-center font-mono text-xl font-black shadow-md backdrop-blur-xs transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3`}>
                    {IconComponent ? <IconComponent className="w-6 h-6" /> : "?"}
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
        </div>
    );
}