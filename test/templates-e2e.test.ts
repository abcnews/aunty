import { test, describe, before } from "node:test";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import {
  createProject,
  buildProject,
  assertBuildOutputsExist,
} from "./helpers.ts";

const EXPECTED_LOGO = "│ ⣾⢷⡾⢷⡾⣷  aunty\n│ ⢿⡾⢷⡾⢷⡿  create";

describe("svelte", () => {
  /** Throw and don't proceed if a silly duffer left a node_modules or .DS_Store in the template dirs */
  before(async () => {
    const templatesDir = path.resolve(import.meta.dirname, "../templates");

    async function checkDir(
      dir: string,
    ): Promise<{ nodeModules: string[]; dsStores: string[] }> {
      const nodeModules: string[] = [];
      const dsStores: string[] = [];
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules") {
            nodeModules.push(fullPath);
          } else {
            const nested = await checkDir(fullPath);
            nodeModules.push(...nested.nodeModules);
            dsStores.push(...nested.dsStores);
          }
        } else if (entry.isFile() && entry.name.toLowerCase() === ".ds_store") {
          dsStores.push(fullPath);
        }
      }

      return { nodeModules, dsStores };
    }

    const { nodeModules, dsStores } = await checkDir(templatesDir);
    assert.deepStrictEqual(
      nodeModules,
      [],
      `Found unexpected node_modules directory in templates: ${nodeModules.join(", ")}`,
    );
    assert.deepStrictEqual(
      dsStores,
      [],
      `Found unexpected .DS_Store files in templates: ${dsStores.join(", ")}`,
    );
  });

  test("creates and builds base svelte project with TypeScript", async () => {
    const projectName = "svelte-base-ts";

    const { projectDir, transcript } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Svelte",
      "What kind of project do you want?": "base",
      "Would you like to add a Builder?": false,
      "Do you want to use TypeScript?": true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Verify CLI transcript
    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "prompt.text: What is your project named? -> svelte-base-ts",
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: Continue anyway? -> true",
      "prompt.select: Select a project type: -> Svelte",
      "prompt.select: What kind of project do you want? -> base",
      "prompt.confirm: Would you like to add a Builder? -> false",
      "prompt.confirm: Do you want to use TypeScript? -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds odyssey svelte project with TypeScript", async () => {
    const projectName = "svelte-odyssey-ts";

    const { projectDir, transcript } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Svelte",
      "What kind of project do you want?": "odyssey",
      "Would you like to add a Builder?": false,
      "Do you want to use TypeScript?": true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "prompt.text: What is your project named? -> svelte-odyssey-ts",
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: Continue anyway? -> true",
      "prompt.select: Select a project type: -> Svelte",
      "prompt.select: What kind of project do you want? -> odyssey",
      "prompt.confirm: Would you like to add a Builder? -> false",
      "prompt.confirm: Do you want to use TypeScript? -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds scrollyteller svelte project with TypeScript", async () => {
    const projectName = "svelte-scrollyteller-ts";

    const { projectDir, transcript } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Svelte",
      "What kind of project do you want?": "scrollyteller",
      "Would you like to add a Builder?": false,
      "Do you want to use TypeScript?": true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "prompt.text: What is your project named? -> svelte-scrollyteller-ts",
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: Continue anyway? -> true",
      "prompt.select: Select a project type: -> Svelte",
      "prompt.select: What kind of project do you want? -> scrollyteller",
      "prompt.confirm: Would you like to add a Builder? -> false",
      "prompt.confirm: Do you want to use TypeScript? -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds base svelte project with Builder and TypeScript", async () => {
    const projectName = "svelte-base-builder-ts";

    const { projectDir } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Svelte",
      "What kind of project do you want?": "base",
      "Would you like to add a Builder?": true,
      "Do you want to use TypeScript?": true,
    });

    // Check files exist
    await fs.access(path.join(projectDir, "builder/index.html"));
    await fs.access(path.join(projectDir, "src/components/Builder/Builder.svelte"));

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Also assert builder output exists
    await fs.access(path.join(projectDir, "dist/builder/index.html"));
  });

  test("creates and builds kitchen sink svelte project with JavaScript", async () => {
    const projectName = "svelte-kitchen-sink-js";

    const { projectDir, transcript } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Svelte",
      "What kind of project do you want?": "scrollyteller",
      "Would you like to add a Builder?": true,
      "Do you want to use TypeScript?": false,
    });

    // Check files exist
    await fs.access(path.join(projectDir, "builder/index.html"));
    await fs.access(path.join(projectDir, "src/components/Builder/Builder.svelte"));

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Also assert builder output exists
    await fs.access(path.join(projectDir, "dist/builder/index.html"));

    // Verify JS transcript logs JS conversion spinner
    assert.ok(transcript.some(t => t.includes("Converting project to JavaScript")));
  });
});

describe("vanilla", () => {
  test("creates and builds base vanilla project with TypeScript", async () => {
    const projectName = "vanilla-base-ts";

    const { projectDir, transcript } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Plain JS",
      "What kind of project do you want?": "base",
      "Do you want to use TypeScript?": true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Verify CLI transcript
    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "prompt.text: What is your project named? -> vanilla-base-ts",
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: Continue anyway? -> true",
      "prompt.select: Select a project type: -> Plain JS",
      "prompt.select: What kind of project do you want? -> base",
      "prompt.confirm: Do you want to use TypeScript? -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds base vanilla project with JavaScript", async () => {
    const projectName = "vanilla-base-js";

    const { projectDir, transcript } = await createProject(projectName, {
      "What is your project named?": projectName,
      "Continue anyway?": true,
      "Select a project type:": "Plain JS",
      "What kind of project do you want?": "base",
      "Do you want to use TypeScript?": false,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Verify CLI transcript (including JavaScript patch spinner logs)
    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "prompt.text: What is your project named? -> vanilla-base-js",
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: Continue anyway? -> true",
      "prompt.select: Select a project type: -> Plain JS",
      "prompt.select: What kind of project do you want? -> base",
      "prompt.confirm: Do you want to use TypeScript? -> false",
      "spinner.start: Converting project to JavaScript",
      "spinner.message: Converting .ts to .js",
      "spinner.message: Installing dependencies",
      "spinner.message: Formatting project",
      "spinner.stop: Project converted to JavaScript",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });
});

