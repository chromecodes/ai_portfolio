import { ImageViewerItem } from "@/components/ImageViewer/types";

export interface CaseStudyData {
  project_name: string;
  project_type: string;
  project_repo_url?: string;
  project_demo_url?: string;
  project_context: string;
  core_pillars: string[];
  architecture_diagram: string;
  architecture: Array<{
    title: string;
    description: string;
  }>;
  tech_stack: Array<{
    title: string;
    items: string[];
  }>;
  core_engineering_problems: Array<{
    id: string;
    title: string;
    tags: string[];
    problem: {
      title: string;
      description: string;
    };
    solution: {
      title: string;
      description: string;
    };
    technical_details: {
      title: string;
      items: string[];
    };
    outcome: {
      title: string;
      items: string[];
    };
  }>;
  benchmarks: {
    sustained_rps: string;
    total_transactions: string;
    error_rate: string;
    idempotency_gate: string;
    chart_image: ImageViewerItem[];
  };
  local_development: {
    title: string;
    description: string;
    steps: Array<{
      step: string;
      title: string;
      command: string;
      description: string;
    }>;
  };
  ci_cd: {
    title: string;
    pipeline_file: string;
    description: string;
  };
}