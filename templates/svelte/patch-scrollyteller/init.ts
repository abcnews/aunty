import path from "node:path";
import * as helpers from "../../../src/lib/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";

export async function init({ projectName, baseDir }: InitOptions) {
  // Copy template to destination
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);

  await helpers.editPackageJson(baseDir, (pkg) => {
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies["@abcnews/svelte-scrollyteller"] = "^3.0.0";
  });

  // String replacements
  await helpers.replaceInFiles(baseDir, ["index.html", "src/index.ts"], {
    __PROJECT_NAME__: projectName,
    __PROJECT_NAME_ACTO__: projectName.replace(/-/g, ""),
  });
}
