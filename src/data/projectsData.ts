import { Project } from "@/types/project";
import enData from "./projects/pojecthub/en.json";
import arData from "./projects/pojecthub/ar.json";

const hubMap: Record<string, Project[]> = {
  en: enData as Project[],
  ar: arData as Project[],
};

export function getProjectsData(lang: string = "en"): Project[] {
  return hubMap[lang] || (enData as Project[]);
}

export const PROJECTS_DATA: Project[] = enData as Project[];
