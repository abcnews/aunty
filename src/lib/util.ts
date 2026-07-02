import { realpathSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import pc from "picocolors";
import type { PackageJson } from "../types.ts";

/**
 * Determines if the current execution of the CLI is running from a local development clone
 * (e.g., cloned project, npm link, or running via tsx from sources) rather than being run
 * as an installed package inside a project's node_modules directory.
 */
export function isLocalDevelopment(): boolean {
  try {
    const realDir = realpathSync(import.meta.dirname);
    return !realDir.includes("node_modules");
  } catch {
    return false;
  }
}

/**
 * Loads and parses a JSON file
 * @param filePath The path to the file
 */
export async function loadJson<T = unknown>(
  filePath: string,
): Promise<T | null> {
  try {
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
/**
 * Format bytes into a human-readable string with color coding.
 * < 1MB = green
 * >= 1MB = yellow (orange)
 */
export function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted = `${size.toFixed(1)}${units[unitIndex]}`;

  if (bytes >= 1024 * 1024) {
    return pc.yellow(formatted);
  }

  return pc.green(formatted);
}
/**
 * Walks up the directory tree to find the nearest package.json.
 */
export async function findProjectDetails(
  startDir: string,
): Promise<{ root: string; pkg: PackageJson } | null> {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const pkgPath = path.join(currentDir, "package.json");
    const pkg = await loadJson<PackageJson>(pkgPath);

    if (pkg) {
      return { root: currentDir, pkg };
    }

    currentDir = path.dirname(currentDir);
  }

  const { log } = await import("@clack/prompts");
  log.error(
    `Could not find ${pc.cyan("package.json")} in this or any parent directory.`,
  );
  return null;
}

/**
 * Runs the npm run build script for the project.
 */
export async function runBuild(options: { stdio?: "inherit" | "pipe" | "ignore" } = {}): Promise<void> {
  const { stdio = "inherit" } = options;
  
  const details = await findProjectDetails(process.cwd());
  if (!details) {
    throw new Error("Could not find project details.");
  }

  const { pkg } = details;
  if (!pkg.scripts?.build) {
    throw new Error("Could not find a build script in package.json.");
  }

  const { $ } = await import("zx");
  await $({ stdio })`npm run build`;
}
