export interface Project {
  id: string;
  category: 'fullstack' | 'software' | 'cli' | 'library' | 'casestudy';
  logo: string;
  icon: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  description: string;
  problem: string;
  solution: string;
  themeColor: "pink" | "green" | "teal" | "purple" | "blue" | "emerald" | "zinc";
  subBadges: string[];
  badges: string[];
  title:string;
  path: string;
}
