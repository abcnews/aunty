/**
 * @file
 * Helpers for use in template init scripts.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { stripTypeScriptTypes } from "node:module";
import { $ } from "zx";
import { loadJson, isLocalDevelopment } from "./util.ts";
import type { PackageJson } from "../types.ts";

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
 * Edits a package.json file using a callback.
 *
 * @param dir The directory containing package.json
 * @param callback A function to modify the package object
 */
export async function editPackageJson(
  dir: string,
  callback: (
    pkg: PackageJson,
  ) => Promise<PackageJson | void> | PackageJson | void,
) {
  const pkgPath = path.join(dir, "package.json");
  const pkg = ((await loadJson(pkgPath)) as PackageJson) || {};
  const result = await callback(pkg);
  const finalPkg = result || pkg;
  await fs.writeFile(pkgPath, JSON.stringify(finalPkg, null, 2) + "\n");
}

/**
 * Recursively finds files matching a pattern.
 *
 * @param dir The directory to search in
 * @param pattern The glob pattern to match
 * @returns An array of absolute file paths
 */
export async function findFiles(
  dir: string,
  pattern: string,
): Promise<string[]> {
  const { glob } = await import("zx");
  return await glob(pattern, { cwd: dir, absolute: true });
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

/**
 * Gets the root directory of the aunty package.
 * Resolves relative to the root since template scripts get bundled by esbuild
 * into `dist/bin/commander.js`, altering their local directory context.
 */
export function getAuntyRoot(): string {
  return path.resolve(import.meta.dirname, "../../");
}

/**
 * Adds @abcnews/aunty to the package.json devDependencies of the target directory.
 * Resolves to the local development path if running in local development mode,
 * or the version of the currently executing aunty.
 *
 * @todo: remove or make local dev checks optional once the Vite helpers are
 * published, so we can use the local version for real projects too.
 *
 * @param baseDir The directory of the newly created project
 */
export async function installAunty(baseDir: string): Promise<void> {
  const localDev = isLocalDevelopment();
  let auntyDepValue = "";

  const auntyRoot = getAuntyRoot();

  if (localDev) {
    auntyDepValue = `file:${auntyRoot}`;
  } else {
    const pkg = await loadJson<PackageJson>(
      path.join(auntyRoot, "package.json"),
    );
    auntyDepValue = pkg ? `^${pkg.version}` : "latest";
  }

  await editPackageJson(baseDir, (pkg) => {
    if (!pkg.devDependencies) {
      pkg.devDependencies = {};
    }
    pkg.devDependencies["@abcnews/aunty"] = auntyDepValue;
  });
}

/**
 * Renames _gitignore to .gitignore in the target directory.
 *
 * @param baseDir The directory containing the _gitignore file
 */
export async function renameGitignore(baseDir: string): Promise<void> {
  const { log } = await import("@clack/prompts");
  const gitignoreFromPath = path.resolve(baseDir, "_gitignore");
  const gitignoreToPath = path.resolve(baseDir, ".gitignore");
  
  try {
    await fs.access(gitignoreFromPath);
  } catch {
    log.error(
      "Base template must include a _gitignore file (npm strips .gitignore)",
    );
    throw new Error("Missing _gitignore file");
  }

  await fs.rename(gitignoreFromPath, gitignoreToPath);
}

/**
 * Rewrites .ts and .tsx extensions in imports to .js and .jsx.
 *
 * @param content The source code content
 * @returns The content with rewritten import paths
 */
export function rewriteImports(content: string): string {
  return content
    .replace(/(from\s+['"])(.*?)\.ts(['"])/g, "$1$2.js$3")
    .replace(/(import\s+['"])(.*?)\.ts(['"])/g, "$1$2.js$3");
}

/**
 * Converts a .ts file to .js by stripping types and rewriting imports.
 *
 * @param tsFile The path to the TypeScript file
 */
export async function stripTypesFromFile(tsFile: string) {
  const jsFile = tsFile.replace(/\.ts$/, ".js");
  const content = await fs.readFile(tsFile, "utf-8");
  const stripped = stripTypeScriptTypes(content);
  const rewritten = rewriteImports(stripped);
  await fs.writeFile(jsFile, rewritten);
  await fs.unlink(tsFile);
}
