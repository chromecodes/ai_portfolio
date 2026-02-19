export interface CareerDetail {
  slug: string;
  company: {
    name: string;
    role: string;
    duration: string;
    logo: string;
    heroMedia: string;
  };
  productContext: {
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
