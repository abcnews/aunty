import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({ baseDir }: helpers.InitOptions) {
  // Thge only Odyssey change is changing the promise which we await.
  // This updates the import and the line with the .then().
  await helpers.replaceInFile(path.join(baseDir, "src/coremedia.ts"), {
    whenDOMReady: "whenOdysseyLoaded",
  });

  // We manually fire the Odyssey promise in the index.html.
  await helpers.replaceInFile(path.join(baseDir, "index.html"), {
    "</body>": `
    <!-- Mock Odyssey's loaded event so *whenOdysseyLoaded* resolves -->
    <script>
      window.dispatchEvent(new CustomEvent('odyssey:api'));
    </script>
  </body>
    `,
  });
}
