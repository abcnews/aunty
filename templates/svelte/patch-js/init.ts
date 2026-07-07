import fs from "node:fs/promises";
import { $ } from "zx";
import { stripTypeScriptTypes } from "node:module";
import * as helpers from "../../../src/lib/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";
import { spin } from "../../../src/lib/terminal.ts";

/**
 * Removes type annotations and rewrites imports in a .svelte file.
 */
async function processSvelteFile(file: string) {
  let content = await fs.readFile(file, "utf-8");
  const scriptRegex = /<script lang="ts">([\s\S]*?)<\/script>/g;
  const matches = Array.from(content.matchAll(scriptRegex));

  if (matches.length === 0) return;

  for (const match of matches) {
    const stripped = stripTypeScriptTypes(match[1]);
    const rewritten = helpers.rewriteImports(stripped);
    content = content.replace(
      match[0],
      `<script>\n${rewritten.trim()}\n</script>`,
    );
  }
  await fs.writeFile(file, content);
}

/**
 * Strips TypeScript types from project files and converts to plain JavaScript.
 */
export async function init({ baseDir }: InitOptions) {
  const s = spin("Converting project to JavaScript");

  // 1. Convert .ts to .js
  s.message("Converting .ts to .js");
  const tsFiles = await helpers.findFiles(baseDir, "**/*.ts");
  await Promise.all(tsFiles.map(helpers.stripTypesFromFile));

  // 2. Un-typescript .svelte files
  const svelteFiles = await helpers.findFiles(baseDir, "**/*.svelte");
  await Promise.all(svelteFiles.map(processSvelteFile));

  // 3. Update index.html to point to .js entry points
  await helpers.replaceInFiles(baseDir, ["index.html"], { ".ts": ".js" });

  // 4. Update config (empty for now as we're keeping TS bits for JSDoc support)
  s.message("Updating config");

  // 6. Format the project
  s.message("Installing dependencies");
  await $({ cwd: baseDir })`npm install`.quiet();
  s.message("Formatting project");
  await $({ cwd: baseDir })`npm run format`.quiet();

  s.stop("Project converted to JavaScript");
}
