export interface Project {
  id: string;
  category: 'fullstack' | 'software' | 'cli' | 'library' | 'casestudy';
  logo: string;
  icon: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  description: string;
  problem: {
    title: string;
    description: string;
  };
  solution: {
    title: string;
    description: string;
  };
  themeColor: "pink" | "green" | "teal" | "purple" | "blue" | "emerald" | "zinc";
  badges: string[];
  techStack: {
    title: string;
    items: string[];
  };
  title:string;
  path: string;
}
