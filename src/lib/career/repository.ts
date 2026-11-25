import fs from "fs/promises";
import path from "path";

// Only allow safe filename segments — blocks path traversal (../, ..\, absolute paths)
const SAFE_SLUG = /^[A-Za-z0-9_-]+$/;
const SAFE_LANG = /^[A-Za-z]{2,8}(-[A-Za-z0-9]{2,8})?$/;

export async function getCareer(
  company: string,
  lang: string = "en"
) {
  if (!SAFE_SLUG.test(company) || !SAFE_LANG.test(lang)) {
    throw new Error(`Career data not found`);
  }

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