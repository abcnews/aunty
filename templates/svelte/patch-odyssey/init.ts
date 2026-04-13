import * as helpers from "../../../src/commands/create/initHelpers.ts";
import type { InitOptions } from "../../../src/commands/create/types.ts";

export async function init({ baseDir }: InitOptions) {
  // The only Odyssey change is changing the promise which we await.
  // This updates the import and the line with the .then().
  await helpers.replaceInFile(baseDir, "src/coremedia.ts", {
    whenDOMReady: "whenOdysseyLoaded",
  });
}
