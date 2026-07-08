// src/data/career.ts

import { CareerData } from "../types";


export const CAREER_DATA: CareerData[] = [
  {
    id: "origin",
    company_name: "Self Learning",
    time_period: 10,
    icon: "/icons/flag.svg",
    tooltip_icon: "/icons/flag_light.png",
    description: "Acquired foundational programming skills through self-study and online courses.",
    projects: ["Personal Projects"],
  },

  {
    id: "cognizant",
    company_name: "Cognizant",
    time_period: 26,
    icon: "/icons/cognizant.png",
    tooltip_icon: "/icons/cognizant.png",
    description: "Worked on scalable frontend systems.",
    projects: ["Dashboard", "Admin Panel", "Analytics"],
  },
  {
    id: "prostack360",
    company_name: "Prostack360",
    time_period: 38,
    icon: "/icons/prostack360.png",
    tooltip_icon: "/icons/prostack360.png",
    description: "Worked on scalable frontend systems.",
    projects: ["Dashboard", "Admin Panel", "Analytics"],
  },

  {
    id: "future",
    company_name: "Future Goal",
    time_period: 0,
    icon: "/icons/question.svg",
    tooltip_icon: "/icons/question_light.png",
    description: "Full-stack development.",
    projects: ["API Platform"],
  },
]
