export interface Project {
  id: string;
  category: 'fullstack' | 'software' | 'cli' | 'library' | 'casestudy';
  image: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  titleKey: string;
  whatItIsKey: string;
  problemKey: string;
  solutionKey: string;
  gridSpan: string;
  iconName: string;
  themeColor: "pink" | "green" | "teal" | "purple" | "blue" | "emerald" | "zinc";
  subBadges: string[];
  badgesKey: string[];
}
