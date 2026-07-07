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

import { existsSync } from "node:fs";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

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
    const result = await $({ stdio: "inherit" }).nothrow()`${process.execPath} ${localAuntyPath} ${process.argv.slice(2)}`;
    process.exit(result.exitCode);
  }

  // Resolve paths for the built JS and original TS commander files.
  const builtCommanderPath = path.resolve(dirname, "../../dist/bin/commander.js");
  const commanderPath = path.resolve(dirname, "commander.ts");

  let execPath;
  let execArgs;

  /** If running from node_modules, we are almost certainly running in prod  */
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

  const result = await $({ stdio: "inherit" }).nothrow()`${execPath} ${execArgs}`;
  process.exit(result.exitCode);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
