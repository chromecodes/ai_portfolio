import { Project } from "@/types/project";

export const ProjectTileContent = ({ project }: { project: Project }) => {

    return (

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
                        <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-borderColor bg-secondary-background/60 text-[9px] font-mono text-muted-foreground hover:border-accent-color/20 transition-colors">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}