import fs from "fs/promises";
import path from "path";
import { FuturePageData } from "@/types/future";
import enData from "@/data/future/en.json";
import esData from "@/data/future/es.json";
import arData from "@/data/future/ar.json";

const staticMap: Record<string, FuturePageData> = {
    en: enData as FuturePageData,
    es: esData as FuturePageData,
    ar: arData as FuturePageData,
};

export async function getFuture(lang: string): Promise<FuturePageData> {
    try {
        const filePath = path.join(
            process.cwd(),
            "src",
            "data",
            "future",
            `${lang}.json`
        );
        const file = await fs.readFile(filePath, "utf-8");
        return JSON.parse(file) as FuturePageData;
    } catch {
        return staticMap[lang] || (enData as FuturePageData);
    }
}

export function getFutureStatic(lang: string): FuturePageData {
    return staticMap[lang] || (enData as FuturePageData);
}
