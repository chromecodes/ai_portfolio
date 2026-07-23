import { CareerData } from "../types";
import enData from "@/data/career/careergraph/en.json";
import arData from "@/data/career/careergraph/ar.json";

const graphMap: Record<string, CareerData[]> = {
  en: enData as CareerData[],
  ar: arData as CareerData[],
};

export function getCareerGraphData(lang: string = "en"): CareerData[] {
  return graphMap[lang] || (enData as CareerData[]);
}

export const CAREER_DATA: CareerData[] = enData as CareerData[];
