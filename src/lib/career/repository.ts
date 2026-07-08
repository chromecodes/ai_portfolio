import fs from "fs/promises";
import path from "path";

export async function getCareer(
  company: string,
  lang: string
) {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "career",
    company,
    `${lang}.json`
  );

  const file = await fs.readFile(filePath, "utf-8");

  return JSON.parse(file);
}