"use client";

import { useState, useMemo } from "react";
import useLanguageStore from "@/utils/i18n/useLanguageStore";
import { getProjectsData } from "@/data/projectsData";
import { Project } from "@/types/project";
import FeaturesTile from "@/features/Career/page/FeaturesTile";
import { ProjectIntroTile } from "@/features/Projects/ProjectIntroTile";

type CategoryFilter = "all" | Project["category"];

interface TabItem {
    id: CategoryFilter;
    labelKey: string;
}


export default function ProjectsPage() {
    const lang = useLanguageStore((state) => state.language);
    const strings = useLanguageStore((state) => state.strings as Record<string, string>);
    const [activeTab, setActiveTab] = useState<CategoryFilter>("all");

    // Filtered projects list based on active tab selection & language
    const filteredProjects = useMemo(() => {
        const data = getProjectsData(lang);
        if (activeTab === "all") return data;
        return data.filter((p) => p.category === activeTab);
    }, [activeTab, lang]);

    const tabs: TabItem[] = [
        { id: "all", labelKey: "catAll" },
        { id: "fullstack", labelKey: "catFullstack" },
        { id: "software", labelKey: "catSoftware" },
        { id: "cli", labelKey: "catCli" },
        { id: "library", labelKey: "catLibrary" },
        { id: "casestudy", labelKey: "catCaseStudy" },
    ];



    return (
        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-mac bg-primary-background text-font-color selection:bg-accent-color/20 selection:text-accent-color">
            <div className="max-w-6xl mx-auto px-6 py-4">
                {/* FILTERING TABS */}
                <div className="flex justify-start md:justify-center overflow-x-auto pb-4 border-b border-borderColor scrollbar-none">
                    <div className="flex gap-2 p-1 bg-secondary-background/60 backdrop-blur-md border border-borderColor rounded-full whitespace-nowrap">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-200 ease-out active:scale-95 hover:cursor-pointer ${isActive
                                        ? "bg-accent-color text-primary-background shadow-xs"
                                        : "text-muted-foreground hover:text-font-color hover:bg-secondary-background/60"
                                        }`}
                                >
                                    {strings[tab.labelKey]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PROJECTS GRID WITH CSS FADE-IN */}
                <div key={activeTab} className="grid mt-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch animate-[fadeIn_0.3s_ease-out]">
                    {filteredProjects.map((project, index) => {
                        return <ProjectIntroTile key={project.id} project={project} index={index} />
                    })}
                </div>
            </div>
        </main>
    );
}