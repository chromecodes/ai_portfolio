"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import RingLoader from "@/features/Loaders/RingLoader";
import ProjectDetailUI from "@/features/Projects/page/ProjectDetailUI";
import CaseStudyDetailUI, { CaseStudyData } from "@/features/Projects/page/CaseStudyDetailUI";
import { ProjectDetail } from "@/types/projectDetail";
import Link from "next/link";

export default function ProjectPage() {
  const params = useParams() as { slug: string };
  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = params.slug;
    if (!slug) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/mainpages/projects/${slug}`);
        if (!response.ok) {
          throw new Error(`Project "${slug}" not found`);
        }
        const resData = await response.json();
        if (resData.success) {
          setProjectData(resData.data);
        } else {
          setError(resData.message || "Failed to load project");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.slug]);

  if (loading) {
    return <RingLoader />;
  }

  if (error || !projectData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
        <span className="text-4xl">🔍</span>
        <h2 className="text-2xl font-bold text-font-color">Project Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error || "We couldn't find the project details you were looking for."}
        </p>
        <Link
          href="/projects"
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full bg-accent-color text-primary-background shadow-xs hover:opacity-90 transition-opacity"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  if (projectData.project_type === "Case Study") {
    return <CaseStudyDetailUI data={projectData as CaseStudyData} />;
  }

  return <ProjectDetailUI data={projectData as ProjectDetail} />;
}
