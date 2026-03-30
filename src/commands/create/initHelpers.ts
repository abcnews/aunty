/**
 * @file
 * Helpers for use in template init scripts.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { $ } from "zx";
import { loadJson } from "../../lib/util.ts";
import type { InitOptions } from "./types.ts";

export type { InitOptions };

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Recursively copies contents from one directory to another.
 *
 * @param src The source directory
 * @param dest The destination directory
 */
export async function copyContents(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyContents(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }),
  );
}

/**
 * Updates a package.json file with the provided data.
 *
 * @param dir The directory containing package.json
 * @param data The data to merge into package.json
 */
export async function updatePackageJson(
  dir: string,
  data: Record<string, unknown>,
) {
  const pkgPath = path.join(dir, "package.json");
  const pkg = (await loadJson(pkgPath)) || {};
  const updatedPkg = { ...pkg, ...data };
  await fs.writeFile(pkgPath, JSON.stringify(updatedPkg, null, 2) + "\n");
}

/**
 * Adds a dependency to a package.json file.
 *
 * @param dir The directory containing package.json
 * @param name The name of the dependency
 * @param version The version of the dependency (e.g. ^3.0.0)
 * @param isDev Whether to add as devDependencies
 */
export async function addDependency(
  dir: string,
  name: string,
  version = "",
  isDev = false,
) {
  const pkgPath = path.join(dir, "package.json");
  const pkg = ((await loadJson(pkgPath)) as PackageJson) || {};
  const field = (
    isDev ? "devDependencies" : "dependencies"
  ) as keyof PackageJson;

  if (!pkg[field]) {
    (pkg as Record<string, unknown>)[field] = {};
  }

  const dependencies = pkg[field] as Record<string, string>;
  dependencies[name] = version;

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

/**
 * Replaces strings in a file, relative to a base directory.
 *
 * @param baseDir The base directory
 * @param relPath The relative path to the file
 * @param replacements A record of search/replace terms
 */
export async function replaceInFile(
  baseDir: string,
  relPath: string,
  replacements: Record<string, string>,
) {
  const filePath = path.join(baseDir, relPath);
  let content = await fs.readFile(filePath, "utf-8");

  Object.entries(replacements).forEach(([search, replace]) => {
    content = content.replaceAll(search, replace);
  });

  await fs.writeFile(filePath, content);
}

/**
 * Replaces strings in multiple files, relative to a base directory.
 *
 * @param baseDir The base directory
 * @param relPaths An array of relative paths to the files
 * @param replacements A record of search/replace terms
 */
export async function replaceInFiles(
  baseDir: string,
  relPaths: string[],
  replacements: Record<string, string>,
) {
  await Promise.all(
    relPaths.map((relPath) => replaceInFile(baseDir, relPath, replacements)),
  );
}

/**
 * Gets the git user name and email.
 *
 * @returns An object with name and email, or null if not available
 */
export async function getGitUser(): Promise<{
  name: string;
  email: string;
} | null> {
  try {
    const name = (await $`git config user.name`.quiet()).stdout.trim();
    const email = (await $`git config user.email`.quiet()).stdout.trim();
    if (!name || !email) return null;
    return { name, email };
  } catch {
    return null;
  }
}
