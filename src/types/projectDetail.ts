export interface ArchitectureItem {
  title: string;
  description: string;
}

export interface TechStackGroup {
  title: string;
  items: string[];
}

export interface MediaItem {
  id?: string;
  type: "image" | "video";
  src: string;
  blurSrc?: string;
  alt?: string;
  displayMode?: string;
  width?: number;
  height?: number;
}

export interface KeyFeature {
  id?: string;
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
  technical_details?: {
    title: string;
    items: string[];
  };
  outcome?: {
    title: string;
    items: string[];
  };
  media?: MediaItem[];
  links?: {
    github?: string;
    live?: string;
  };
}

export interface ProjectDetail {
  project_name: string;
  media?: MediaItem[] | { video?: string; images?: string[] };
  project_demo_url?: string;
  project_repo_url?: string;
  project_context: string;
  core_pillars: string[];
  architecture: ArchitectureItem[];
  tech_stack: TechStackGroup[];
  key_features: KeyFeature[];
}
