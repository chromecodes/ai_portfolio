import { Project } from "@/types/project";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { FC } from "react";
import Link from "next/link";
import { Icons } from "@/Icon";
import { ProjectTileHeader } from "./ProjectTileHeader";
import { ProjectTileFooter } from "./ProjectTileFooter";
import { ProjectTileContent } from "./ProjectTileContent";

interface IProps {
    project: Project;
    index: number;
}

export const ProjectIntroTile: FC<IProps> = ({ project, index }) => {
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);

    // Theme styles using CSS theme variables (No hardcoded hex or tailwind colors)


    return (
        <article
            key={project.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="relative flex flex-col h-full bg-secondary-background/40 border border-borderColor hover:border-accent-color/40 hover:-translate-y-1.5 hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-300 ease-out group"
        >
            {/* Cover Visual Area using pure CSS background grid & HTML orbital rings (No SVG) */}
            <ProjectTileHeader project={project} />

            {/* Content Details */}
            <ProjectTileContent project={project} />
            {/* View for more details link */}
            <ProjectTileFooter project={project} />
        </article>
    );
}
