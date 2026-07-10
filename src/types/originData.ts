import { ImageViewerItem } from "@/components/ImageViewer/types";

export interface IOrginData {
  slug: string;
  company: {
    name: string;
    role: string;
    duration: string;
    logo: string;
    heroMedia: string;
  };
  introduction: {
    title: string;
    description: string[];
    modules: string[];
  };
  learningJourney: {
    title: string;
    description: string[][];
  };

  projects: {
    id: string;
    title: string;
    tags: string[];
    goal: {
      title: string;
      description: string;
    };
    solution: {
      title: string;
      description: string;
    };
    skills: string[];
    concepts: {
      title: string;
      items: string[];
    };
    images: ImageViewerItem[];
    challenges: {
      title: string;
      items: string[];
    };
    outcome: {
      title: string;
      items: string[];
    };
  }[];
  techStack: Record<string, string>;
  impact: string[];
  learnings: string[];
}
