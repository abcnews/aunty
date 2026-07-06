#!/usr/bin/env node

/**
 * @file Aunty CLI Entry Point
 * 
 * This is the main file that launches Aunty. It handles:
 * - Deferring to the locally installed version if available
 * - Deciding whether to use the built JS in prod, or `tsx` in dev-like environments
 *
 * This file MUST be plain JavaScript to ensure compatibility as a CLI entry point.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Bootstrap the CLI by preferring a local version if it exists.
 */
async function run() {
  const localAuntyPath = path.join(
    process.cwd(),
    "node_modules/@abcnews/aunty/src/bin/aunty.js",
  );

  // If a local version exists and we are not it, prefer the local version.
  if (
    existsSync(localAuntyPath) &&
    (await realpath(localAuntyPath)) !== (await realpath(filename))
  ) {
    console.log(`[aunty] Local version detected: ${localAuntyPath}`);
    const { status } = spawnSync(process.execPath, [localAuntyPath, ...process.argv.slice(2)], {
      stdio: "inherit",
    });
    process.exit(status ?? 0);
  }

  // Resolve paths for the built JS and original TS commander files.
  const builtCommanderPath = path.resolve(dirname, "../../dist/bin/commander.js");
  const commanderPath = path.resolve(dirname, "commander.ts");

  let execPath;
  let execArgs;

  /** If running from node_modules, we are almost certainly looking for the prod build  */
  const isRunningFromNodeModules = filename.includes("node_modules");

  if (isRunningFromNodeModules && existsSync(builtCommanderPath)) {
    // If the built files are available and we are executing from node_modules, use those directly with node
    execPath = process.execPath;
    execArgs = [builtCommanderPath, ...process.argv.slice(2)];
  } else {
    // Otherwise run the package via tsx
    // This is hit for local dev or when running straight from a Github branch
    const localTsx = path.resolve(dirname, "../../node_modules/.bin/tsx");
    execPath = existsSync(localTsx) ? localTsx : "tsx";
    execArgs = [commanderPath, ...process.argv.slice(2)];
  }

  const result = spawnSync(execPath, execArgs, {
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`[aunty] Failed to launch CLI process: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
