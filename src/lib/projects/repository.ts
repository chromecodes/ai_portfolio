import fs from "fs/promises";
import path from "path";
import { ProjectDetail } from "@/types/projectDetail";

export async function getProject(slug: string): Promise<ProjectDetail> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "projects",
    `${slug}.json`
  );

  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file) as ProjectDetail;
}
