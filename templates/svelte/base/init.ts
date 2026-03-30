import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ projectName, baseDir }: helpers.InitOptions) {
  // Copy template to destination
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);

  // String replacements
  await helpers.replaceInFiles(
    baseDir,
    ["index.html", "src/coremedia.ts", "README.md"],
    {
      "__PROJECT_NAME__": projectName,
      "__PROJECT_NAME_ACTO__": projectName.replace(/-/g, ""),
      "__PROJECT_TYPE__": "Svelte",
    },
  );

  // Add metadata to package.json
  const gitUser = await helpers.getGitUser();
  await helpers.updatePackageJson(baseDir, {
    name: projectName,
    license: "MIT",
    contributors: gitUser ? [gitUser] : [],
    aunty: { type: "svelte" },
  });
}
