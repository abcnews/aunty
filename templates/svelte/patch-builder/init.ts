import * as helpers from "../../../src/lib/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";
import path from "node:path";
import fs from "node:fs/promises";

/**
 * Patch in a builder by copying templates and editing entry points.
 */
export async function init({ projectName, baseDir }: InitOptions) {
  // Copy patch-builder files to target
  const contentsDir = path.resolve(helpers.getAuntyRoot(), "templates/svelte/patch-builder/contents");
  await helpers.copyContents(contentsDir, baseDir);

  // Update builder/index.html with project name
  await helpers.replaceInFile(baseDir, "builder/index.html", {
    __PROJECT_NAME__: projectName,
  });

  // Modify the entry point to conditionally load and mount the builder
  const entryFile = "src/index.ts";
  const entryPath = path.join(baseDir, entryFile);
  const entryContent = await fs.readFile(entryPath, "utf-8");

  const searchPattern = `// __ADDITIONAL_MOUNTS__`;

  const builderMountCode = `const [builderMountEl] = selectMounts('builder');

if (builderMountEl) {
  const appProps = getMountValue(builderMountEl);
  const builderModule = await import('./components/Builder/Builder.svelte');
  mount(builderModule.default, {
    target: builderMountEl
  });
}

// __ADDITIONAL_MOUNTS__`;

  if (entryContent.includes(searchPattern)) {
    await helpers.replaceInFile(baseDir, entryFile, {
      [searchPattern]: builderMountCode,
    });
  }
}
