import fs from "fs/promises";
import path from "path";
import { ProjectDetail } from "@/types/projectDetail";

// Only allow safe filename segments — blocks path traversal (../, ..\, absolute paths)
const SAFE_SLUG = /^[A-Za-z0-9_-]+$/;
const SAFE_LANG = /^[A-Za-z]{2,8}(-[A-Za-z0-9]{2,8})?$/;

export async function getProject(
  slug: string,
  lang: string = "en"
): Promise<ProjectDetail> {
  if (!SAFE_SLUG.test(slug) || !SAFE_LANG.test(lang)) {
    throw new Error(`Project "${slug}" not found`);
  }

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

