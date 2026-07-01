import { test, describe } from "node:test";
import assert from "node:assert";
import {
  createProject,
  buildProject,
  assertBuildOutputsExist,
} from "./helpers.ts";

const EXPECTED_LOGO = "│  ⣾⢷⡾⢷⡾⣷ aunty\n│  ⢿⡾⢷⡾⢷⡿ create";

describe("svelte", () => {
  test("creates and builds base svelte project with TypeScript", async () => {
    const projectName = "svelte-base-ts";

    const { projectDir, transcript } = await createProject({
      projectName,
      projectType: "base",
      useTypescript: true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Verify CLI transcript
    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: continue on FTP warning -> true",
      "prompt.select: root template selected",
      "prompt.select: project type selected -> base",
      "prompt.confirm: use typescript -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds base svelte project with JavaScript", async () => {
    const projectName = "svelte-base-js";

    const { projectDir, transcript } = await createProject({
      projectName,
      projectType: "base",
      useTypescript: false,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    // Verify CLI transcript (including JavaScript patch spinner logs)
    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: continue on FTP warning -> true",
      "prompt.select: root template selected",
      "prompt.select: project type selected -> base",
      "prompt.confirm: use typescript -> false",
      "spinner.start: Converting project to JavaScript",
      "spinner.message: Converting .ts to .js",
      "spinner.message: Updating config",
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

  test("creates and builds odyssey svelte project with TypeScript", async () => {
    const projectName = "svelte-odyssey-ts";

    const { projectDir, transcript } = await createProject({
      projectName,
      projectType: "odyssey",
      useTypescript: true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: continue on FTP warning -> true",
      "prompt.select: root template selected",
      "prompt.select: project type selected -> odyssey",
      "prompt.confirm: use typescript -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds odyssey svelte project with JavaScript", async () => {
    const projectName = "svelte-odyssey-js";

    const { projectDir, transcript } = await createProject({
      projectName,
      projectType: "odyssey",
      useTypescript: false,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: continue on FTP warning -> true",
      "prompt.select: root template selected",
      "prompt.select: project type selected -> odyssey",
      "prompt.confirm: use typescript -> false",
      "spinner.start: Converting project to JavaScript",
      "spinner.message: Converting .ts to .js",
      "spinner.message: Updating config",
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

  test("creates and builds scrollyteller svelte project with TypeScript", async () => {
    const projectName = "svelte-scrollyteller-ts";

    const { projectDir, transcript } = await createProject({
      projectName,
      projectType: "scrollyteller",
      useTypescript: true,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: continue on FTP warning -> true",
      "prompt.select: root template selected",
      "prompt.select: project type selected -> scrollyteller",
      "prompt.confirm: use typescript -> true",
      "spinner.start: Installing dependencies...",
      "spinner.stop: Dependencies installed",
      "log.step: Next steps:",
      `log.message: 1. cd ${projectName}\n2. npm run dev`,
      "outro: Happy coding.",
    ]);
  });

  test("creates and builds scrollyteller svelte project with JavaScript", async () => {
    const projectName = "svelte-scrollyteller-js";

    const { projectDir, transcript } = await createProject({
      projectName,
      projectType: "scrollyteller",
      useTypescript: false,
    });

    await buildProject(projectDir);
    await assertBuildOutputsExist(projectDir);

    assert.deepStrictEqual(transcript, [
      `intro: ${EXPECTED_LOGO}`,
      "spinner.start: Checking project name availability...",
      "spinner.stop: Project name checked",
      "prompt.confirm: continue on FTP warning -> true",
      "prompt.select: root template selected",
      "prompt.select: project type selected -> scrollyteller",
      "prompt.confirm: use typescript -> false",
      "spinner.start: Converting project to JavaScript",
      "spinner.message: Converting .ts to .js",
      "spinner.message: Updating config",
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
