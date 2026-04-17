import fs from "node:fs/promises";
import path from "node:path";

/**
 * Recursively gets a list of all files in a directory.
 * @param dirPath Path to the directory
 * @param baseDir Optional base directory to calculate relative paths from
 * @returns Array of file info objects
 */
export async function getFileInventory(
  dirPath: string,
  baseDir: string = dirPath,
): Promise<{ path: string; relPath: string; size: number }[]> {
  const inventory: { path: string; relPath: string; size: number }[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      inventory.push(...(await getFileInventory(fullPath, baseDir)));
    } else if (entry.isFile()) {
      const stats = await fs.stat(fullPath);
      inventory.push({
        path: fullPath,
        relPath: path.relative(baseDir, fullPath),
        size: stats.size,
      });
    }
  }

  return inventory;
}
