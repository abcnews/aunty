import { $ } from "zx";
import * as helpers from "../../../src/lib/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";
import { spin } from "../../../src/lib/terminal.ts";

/**
 * Strips TypeScript types from project files and converts to plain JavaScript.
 */
export async function init({ baseDir }: InitOptions) {
  const s = spin("Converting project to JavaScript");

  // 1. Convert .ts to .js
  s.message("Converting .ts to .js");
  const tsFiles = await helpers.findFiles(baseDir, "**/*.ts");
  await Promise.all(tsFiles.map(helpers.stripTypesFromFile));

  // 2. Update index.html to point to .js entry points
  await helpers.replaceInFiles(baseDir, ["index.html"], { ".ts": ".js" });

  // 3. Format the project
  s.message("Installing dependencies");
  await $({ cwd: baseDir })`npm install`.quiet();
  s.message("Formatting project");
  await $({ cwd: baseDir })`npm run format`.quiet();

  s.stop("Project converted to JavaScript");
}
