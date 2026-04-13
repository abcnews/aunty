import fs from "node:fs/promises";
import path from "node:path";
import { log } from "@clack/prompts";
import pc from "picocolors";
import { spin } from "./terminal.ts";
import { loadJson } from "./util.ts";
import type { PackageJson } from "../types.ts";

/**
 * Standard Vite configuration filenames.
 */
export const VITE_CONFIG_NAMES = [
  "vite.config.ts",
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.mts",
  "vite.config.cjs",
  "vite.config.cts",
];

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

  return null;
}

/**
 * Searches for a local Vite configuration file in the project root.
 */
export async function findLocalViteConfig(
  root: string,
): Promise<string | null> {
  for (const name of VITE_CONFIG_NAMES) {
    const configPath = path.join(root, name);
    const exists = await fs
      .access(configPath)
      .then(() => true)
      .catch(() => false);
    if (exists) return configPath;
  }
  return null;
}

/**
 * Dynamically resolves an internal configuration path for a project type.
 */
export async function getInternalConfigPath(
  type: string,
): Promise<string | null> {
  const configPath = path.resolve(
    import.meta.dirname,
    `../../templates/${type}/base/vite.config.ts`,
  );
  const exists = await fs
    .access(configPath)
    .then(() => true)
    .catch(() => false);
  return exists ? configPath : null;
}

/**
 * Bootstraps a Vite-based Aunty command by finding the project root
 * and resolving the configuration (local or internal).
 */
export async function resolveProjectConfig() {
  const details = await findProjectDetails(process.cwd());

  if (!details) {
    log.error(
      `Could not find ${pc.cyan("package.json")} in this or any parent directory.`,
    );
    return null;
  }

  const { root, pkg } = details;
  const s = spin(`Detecting build configuration...`);

  // 1. Resolve configuration (Local > Internal)
  let configFile = await findLocalViteConfig(root);
  const auntyType = pkg.aunty?.type;

  if (configFile) {
    s.stop(`Using local config: ${pc.cyan(path.basename(configFile))}`);
  } else if (auntyType) {
    configFile = await getInternalConfigPath(auntyType);
    if (configFile) {
      s.stop(`Using internal ${pc.cyan(auntyType)} configuration`);
    }
  }

  // 2. Bail early if no configuration was resolved
  if (!configFile) {
    s.cancel(`Could not determine how to build this project:`);

    if (!auntyType) {
      log.message(
        ` • Specify ${pc.cyan('"aunty": { "type": "svelte" }')} in your package.json.`,
      );
      log.message(
        ` • OR add a ${pc.cyan("vite.config.ts")} (or .js) to your project root.`,
      );
    } else {
      log.message(
        ` • The project type ${pc.red(auntyType)} does not have an internal configuration.`,
      );
    }

    return null;
  }

  return { root, configFile };
}

/**
 * Standardizes error reporting for Vite commands.
 */
export function handleViteError(err: unknown) {
  if (err instanceof Error) {
    log.error(`Vite threw an error: ${err.message}`);
    if (err.stack) {
      log.info(pc.dim(err.stack));
    }
  } else {
    log.error(String(err));
  }
  return 1;
}
