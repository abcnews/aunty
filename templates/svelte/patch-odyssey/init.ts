import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ baseDir }: helpers.InitOptions) {
  // The only Odyssey change is changing the promise which we await.
  // This updates the import and the line with the .then().
  await helpers.replaceInFile(baseDir, "src/coremedia.ts", {
    whenDOMReady: "whenOdysseyLoaded",
  });
}
