import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ projectName, baseDir }: helpers.InitOptions) {
  // Copy template to destination
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);

  await helpers.addDependency(
    baseDir,
    "@abcnews/svelte-scrollyteller",
    "^3.0.0",
    false,
  );

  // String replacements
  await helpers.replaceInFiles(baseDir, ["index.html", "src/coremedia.ts"], {
    __PROJECT_NAME__: projectName,
    __PROJECT_NAME_ACTO__: projectName.replace(/-/g, ""),
  });
}
