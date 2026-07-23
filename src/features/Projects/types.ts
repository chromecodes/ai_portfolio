import { ImageViewerItem } from "@/components/ImageViewer/types";

export interface CaseStudyData {
  project_name: string;
  quotation_text: string;
  project_type: string;
  project_repo_url?: string;
  project_demo_url?: string;
  project_context: string;
  core_pillars: {
    title: string;
    items: string[];
  };
  architecture_diagram: string;
  architecture: Array<{
    title: string;
    description: string;
  }>;

  sections: {
    system_topology: {
      title: string;
      sub_title: string;
      flow_diagram: string;
    };

    terminal_architecture: {
      title: string;
      file_name: string;
      architecture_diagram: string;
      architecture: Array<{
        title: string;
        description: string;
      }>
    };
    tech_stack: {
      title: string;
      items: Array<{
        title: string;
        items: string[];
      }>;
    };
    core_engineering_problems: {
      title: string;
      sub_title: string;
      description: string;
      items: Array<{
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
    };
    benchmarks: {
      title: string;
      sub_title: string;
      description: string;
      chart_title: string;
      chart_index: string;
      results: {
        sustained_rps: { title: string; item: string };
        total_transactions: { title: string; item: string };
        error_rate: { title: string; item: string };
        idempotency_gate: { title: string; item: string };
        chart_image: ImageViewerItem[];
      };
    }

      local_development: {
      title: string;
      sub_title: string;
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
      sub_title: string;
      pipeline_file: string;
      description: string;
    };
  };


}
