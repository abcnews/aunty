#!/usr/bin/env tsx

import { readdir, realpath } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

console.log(`[aunty] Starting from: ${filename}`);

/**
 * When running `aunty` globally, check if we're inside a project that
 * has its own local version of `@abcnews/aunty` installed. If so,
 * prefer the local version to ensure project-specific behavior.
 */
const localBinDir = join(process.cwd(), "node_modules/@abcnews/aunty/src/bin");

let localExecuted = false;

// Look for any file starting with 'aunty.' (handles both .ts and .js)
const files = await readdir(localBinDir).catch((_) => []);
const localFile = files.find((f) => f.startsWith("aunty."));
const localPath = localFile && resolve(localBinDir, localFile);

// if installed in node_modules, execute that version.
if (localPath && (await realpath(localPath)) !== (await realpath(filename))) {
  console.log(`[aunty] Local version detected: ${localPath}`);
  if (localPath.endsWith(".js")) {
    require(localPath);
  } else {
    await import(localPath);
  }
  localExecuted = true;
}

if (!localExecuted) {
  // Otherwise keep running this version
  console.log("[aunty] No local version found, continuing.");
  await import("./commander.ts");
}
