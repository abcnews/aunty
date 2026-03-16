import fs from "node:fs/promises";

/**
 * Loads and parses a JSON file
 * @param filePath The path to the file
 */
export async function loadJson<T = any>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (err: any) {
    return null;
  }
}
