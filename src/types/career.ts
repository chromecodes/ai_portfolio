import { ImageViewerItem } from "@/components/ImageViewer/types";

export interface CareerDetail {
  slug: string;
  company: {
    name: string;
    role: string;
    duration: string;
    headline?: string;
    media?: {
      "video": "",
      "images": []
    }
    logo?: string;
  };
  productContext: {
    title: string;
    description: string;
    modules: string[];
  };
  architecture: {
    diagram: string;
    stack: Record<string, string>;
    highlights: string[];
  };
  role: string[];
  projects: {
    id: string;
    title: string;
    tags: string[];
    problem: string;
    solution: string;
    tech: string[];
    media: string;
    outcome: string[];
  }[];
  techStack: Record<string, string>;
  impact: string[];
  learnings: string[];
}

export interface DetailedCareerDetail {
  slug: string;
  company: {
    logo: string;
    name: string;
    role: string;
    duration: string;
    headline: string;
    media: {
      video: string;
      images: string[];
    };
    tags: string[];
  };
  roles: {
    title: string;
    description: string;
    impact: string[];
    engineering_insights: string[];
  };
  projects: {
    project_name: string;
    project_context: string;
    core_pillars: string[];
    architecture: {
      high_level: string;
      infrastructure: string;
      design_paradigm: string;
      asset_delivery: string;
    };
    tech_stack: {
      frontend: string[];
      state_management: string[];
      editors: string[];
      real_time_data: string[];
      cloud_infrastructure: string[];
    };
    key_features: {
      title: string;
      tags: string[];
      problem: string;
      solution: string;
      technical_details: string[];
      outcome?: string;
      media: {
        id: string;
        type: "video" | "image";
        src: string;
        alt: string;
      }[];
    }[];
  }[];
}

export type CareerData = CareerDetail | DetailedCareerDetail;

