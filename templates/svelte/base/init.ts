import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ projectName = "", baseDir = "" }) {
  // Copy template to destination
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);

  // String replacements
  await helpers.replaceInFile(path.join(baseDir, "index.html"), {
    __AUNTY_NAME_ACTO: projectName.replace(/-/g, ""),
  });
  await helpers.replaceInFile(path.join(baseDir, "index.html"), {
    __AUNTY_NAME: projectName,
  });

  // Add metadata to package.json
  const gitUser = await helpers.getGitUser();
  await helpers.updatePackageJson(baseDir, {
    name: projectName,
    license: "MIT",
    contributors: gitUser ? [gitUser] : [],
    aunty: { type: "svelte" },
  });
}
