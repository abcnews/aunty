import path from "node:path";
import * as helpers from "../../../src/commands/create/initHelpers.ts";

export async function init({
  baseDir = "",
}: {
  projectName?: string;
  baseDir?: string;
}) {
  const contentsDir = path.resolve(import.meta.dirname, "contents");
  await helpers.copyContents(contentsDir, baseDir);
  await helpers.addDependency(
    baseDir,
    "@abcnews/svelte-scrollyteller",
    "^3.0.0",
  );

  // Thge only Odyssey change is which promise we await
  await helpers.replaceInFile(path.join(baseDir, "src/main.ts"), {
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
