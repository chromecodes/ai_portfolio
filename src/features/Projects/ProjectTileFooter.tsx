import Link from "next/link";
import { Project } from "@/types/project";
import useLanguageStore from "@/utils/i18n/useLanguageStore";

export const ProjectTileFooter = ({ project }: { project: Project }) => {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    return (
        <div>
            <div className="border-t p-4 mt-auto">
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
    );
}