import { Project } from "@/types/project";

export const PROJECTS_DATA: Project[] = [
  {
    id: "easyform-ai",
    category: "fullstack",
    logo: "/icons/easyform.webp",
    icon: "Box",
    techStack: {
      title:"Stack / Tools",
      items: ["Next.js", "TypeScript", "MongoDb", "Redis", "Zod", "Nodejs", ],
    },
    title: "EasyForm",
    description: "EasyForm is a platform that allows you to create forms using AI.",
    problem: {
      title: "problem",
      description: "Creating forms is a tedious and time-consuming process. It requires technical knowledge and understanding of HTML, CSS, and JavaScript.",
    },
    solution:{
      title: "solution",
      description: "EasyForm is a platform that allows you to create forms using AI.",
    },
    themeColor: "pink",
    tags: ["Applied AI", "Dynamic Modules", "Scalable"],
    badges: ["SaaS", "Commercial", "Featured"],
    path: "easyform",
  },
  
];
