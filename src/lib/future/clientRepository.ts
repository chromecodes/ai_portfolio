import { FuturePageData } from "@/types/future";
import enData from "@/data/future/en.json";
import esData from "@/data/future/es.json";
import arData from "@/data/future/ar.json";

const staticMap: Record<string, FuturePageData> = {
    en: enData as FuturePageData,
    es: esData as FuturePageData,
    ar: arData as FuturePageData,
};

export function getFutureStatic(lang: string): FuturePageData {
    return staticMap[lang] || (enData as FuturePageData);
}

