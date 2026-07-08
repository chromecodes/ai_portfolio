export interface IOrginData {
  slug: string;
  company: {
    name: string;
    role: string;
    duration: string;
    logo: string;
    heroMedia: string;
  };
  productContext: {
    title: string;
    description: string[];
    modules: string[];
  };
    aboutContext: {
    title: string;
    description: string[][];
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
