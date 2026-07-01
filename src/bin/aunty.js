#!/usr/bin/env node

/**
 * @file Aunty CLI Entry Point
 *
 * This file MUST be plain JavaScript to ensure compatibility as a CLI entry point.
 * Using JS avoids the need for a global `tsx` or a pre-configured TypeScript
 * loader in the user's environment, preventing "env: tsx: No such file or directory" errors.
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

  // Resolve the main commander logic.
  const commanderPath = path.resolve(dirname, "commander.ts");

  /**
   * We must use `tsx` to execute our TypeScript source files without a build step.
   * To ensure this works even when `tsx` isn't in the global PATH, we resolve
   * the version installed as a dependency of @abcnews/aunty and use it directly.
   */
  const localTsx = path.resolve(dirname, "../../node_modules/.bin/tsx");
  const hasLocalTsx = existsSync(localTsx);
  const execPath = hasLocalTsx ? localTsx : "tsx";

  const result = spawnSync(execPath, [commanderPath, ...process.argv.slice(2)], {
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
