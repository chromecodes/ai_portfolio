export default interface careerTypes {
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
  introduction: {
    title: string;
    description: string[];
    modules: string[];
  };
  learningJourney: {
    title: string;
    description: (string | string[])[];
  };
  techStack: {
    title: string;
    categories: {
      name: string;
      values: string[];
    }[];
  };
  learnings: {
    title: string;
    items: string[];
  };
  projects: {
    id: string;
    project_name: string;
    project_context: string;
    core_pillars: string[];
    architecture: [
      {
        title: string;
        description: string;
      }
    ]

    tech_stack: [
      { title: string, items: string[] }
    ]
    key_features: {
      title: string;
      tags: string[];
      problem: { title: string, description: string };
      solution: {title:string, description:string};
      technical_details: {title:string, items:string[]};
      outcome: {title:string, items:string[]};
      media: {
        id: string;
        type: "video" | "image";
        src: string;
        alt: string;
      }[];
      links?: {
        github?: string;
        live?: string;
      };
    }[];
  }[];
}
