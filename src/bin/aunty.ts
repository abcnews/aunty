#!/usr/bin/env node

/**
 * @file Aunty CLI Entry Point
 *
 * This is the main file that launches Aunty. It handles:
 * - Deferring to the locally installed version if available
 * - Importing the commander CLI logic directly
 */

import { existsSync } from "node:fs";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { $ } from "zx";

const filename = fileURLToPath(import.meta.url);

/**
 * Bootstrap the CLI by preferring a local version if it exists.
 */
async function run() {
  const localAuntyPath = path.join(
    process.cwd(),
    "node_modules/@abcnews/aunty/dist/bin/aunty.js",
  );

  // If a local version exists and we are not it, prefer the local version.
  // Do not defer to local version for the 'migrate' command, as it is used to upgrade the project.
  const isMigrate = process.argv.includes("migrate");
  if (
    !isMigrate &&
    existsSync(localAuntyPath) &&
    (await realpath(localAuntyPath)) !== (await realpath(filename))
  ) {
    const result = await $({ stdio: "inherit", nothrow: true })`${process.execPath} ${localAuntyPath} ${process.argv.slice(2)}`;
    process.exit(result.exitCode);
  }

  // Import the commander CLI logic directly in the same process
  await import("./commander.js");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
