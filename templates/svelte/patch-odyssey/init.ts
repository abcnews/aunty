import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ baseDir = "" }) {
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);
  await helpers.addDependency(
    baseDir,
    "@abcnews/svelte-scrollyteller",
    "^3.0.0",
  );
}
