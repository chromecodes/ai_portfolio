import fs from "fs/promises";
import path from "path";
import { ProjectDetail } from "@/types/projectDetail";

export async function getProject(
  slug: string,
  lang: string = "en"
): Promise<ProjectDetail> {
  const candidateSlugs = Array.from(
    new Set([slug, slug.replace(/-/g, ""), slug.toLowerCase()])
  );

  for (const s of candidateSlugs) {
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "projects",
      s,
      `${lang}.json`
    );

    try {
      const file = await fs.readFile(filePath, "utf-8");
      return JSON.parse(file) as ProjectDetail;
    } catch {
      try {
        const fallbackPath = path.join(
          process.cwd(),
          "src",
          "data",
          "projects",
          s,
          "en.json"
        );
        const file = await fs.readFile(fallbackPath, "utf-8");
        return JSON.parse(file) as ProjectDetail;
      } catch {
        // try next candidate slug
      }
    }
  }

  throw new Error(`Project "${slug}" not found`);
}

