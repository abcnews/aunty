import path from "node:path";
import fs from "node:fs/promises";
import * as helpers from "../../../src/lib/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";

export async function init({ projectName, baseDir }: InitOptions) {
  // Copy template to destination
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);

  // String replacements
  await helpers.replaceInFiles(baseDir, ["index.html", "src/index.ts"], {
    __PROJECT_NAME__: projectName,
    __PROJECT_NAME_ACTO__: projectName.replace(/-/g, ""),
    __PROJECT_TYPE__: "Svelte",
  });

  // Rename _gitignore to .gitignore (npm strips .gitignore from packages)
  await helpers.renameGitignore(baseDir);

  // Add metadata to package.json
  const gitUser = await helpers.getGitUser();
  await helpers.editPackageJson(baseDir, (pkg) => {
    Object.assign(pkg, {
      name: projectName,
      license: "MIT",
      contributors: gitUser ? [gitUser] : [],
      aunty: { type: "svelte" },
    });
  });

  await helpers.installAunty(baseDir);
}
