import fs from "fs/promises";
import path from "path";

export async function getCareer(
  company: string,
  lang: string = "en"
) {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "career",
    company,
    `${lang}.json`
  );

  try {
    const file = await fs.readFile(filePath, "utf-8");
    return JSON.parse(file);
  } catch {
    const fallbackPath = path.join(
      process.cwd(),
      "src",
      "data",
      "career",
      company,
      "en.json"
    );
    const file = await fs.readFile(fallbackPath, "utf-8");
    return JSON.parse(file);
  }
}