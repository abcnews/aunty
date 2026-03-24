import {
  intro,
  outro,
  text,
  select,
  confirm,
  log,
  cancel,
} from "@clack/prompts";
import path from "node:path";
import fs from "node:fs/promises";
import pc from "picocolors";
import { $ } from "zx";
import { getHeader, spin } from "../../lib/terminal.ts";
import { isProjectNameAvailable } from "../../lib/ftp.ts";
import templates from "../../../templates/index.ts";

/**
 * The main entry point for the 'aunty create' command.
 */
export async function run(destDirArg?: string): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "create"));

  // 1. Get project name
  const projectName =
    destDirArg ||
    (await text({
      message: "What is your project named?",
      placeholder: destDirArg || "my-new-project",
      validate: (value) => {
        if (!value || value.length === 0) {
          return "Project name is required";
        }
        if (!value.match(/^[a-z0-9-]+$/)) {
          return "Project name should be lowercase-alphanumeric-with-hypens";
        }
      },
    }));

  if (typeof projectName === "symbol") {
    cancel("Operation cancelled.");
    return 0;
  }

  const finalProjectName = projectName || destDirArg || "my-new-project";
  const projectDest = path.resolve(process.cwd(), finalProjectName);

  // 1.5. Check FTP for name collision
  const ftpSpinner = spin("Checking project name availability...");
  const isAvailable = await isProjectNameAvailable(finalProjectName);
  ftpSpinner.stop("Project name checked");

  if (isAvailable === "error") {
    const shouldContinue = await confirm({
      message: pc.red(
        "Could not connect to FTP to check name availability. Continue anyway?",
      ),
      initialValue: true,
    });
    if (!shouldContinue || typeof shouldContinue === "symbol") {
      cancel("Create cancelled.");
      return 0;
    }
  }
  if (isAvailable === "exists") {
    const shouldContinue = await confirm({
      message: pc.yellow(
        `Project name "${finalProjectName}" already exists on FTP. Continue?`,
      ),
      initialValue: false,
    });
    if (!shouldContinue || typeof shouldContinue === "symbol") {
      cancel("Create cancelled.");
      return 0;
    }
  }

  // 2. Select project type
  const projectType = await select({
    message: "Select a project type:",
    options: templates.projects.map((p) => ({ value: p, label: p.name })),
  });

  if (typeof projectType === "symbol") {
    cancel("Operation cancelled.");
    return 0;
  }

  const selectedProject = projectType as (typeof templates.projects)[0];

  // 3. Ask questions for patches
  const selectedPatches: string[] = [];
  if (selectedProject.questions && selectedProject.questions.length > 0) {
    for (const q of selectedProject.questions) {
      const answer = await select({
        message: q.question,
        options: [
          { value: true, label: "Yes" },
          { value: false, label: "No" },
        ],
      });

      if (typeof answer === "symbol") {
        cancel("Operation cancelled.");
        return 0;
      }

      if (answer) {
        selectedPatches.push(q.action);
      }
    }
  }

  // 4. Create directory
  if (
    await fs
      .access(projectDest)
      .then(() => true)
      .catch(() => false)
  ) {
    cancel(`Directory ${pc.cyan(projectDest)} already exists.`);
    return 1;
  }

  const s = spin(`Creating ${pc.bold(finalProjectName)}...`);

  try {
    // 5. Run baseInit
    await selectedProject.baseInit({
      projectName: finalProjectName,
      baseDir: projectDest,
    });

    // 6. Run selected patches
    for (const action of selectedPatches) {
      const patch = selectedProject.patches.find(
        (p: { name: string }) => p.name === action,
      );
      if (patch) {
        await patch.init({
          projectName: finalProjectName,
          baseDir: projectDest,
        });
      }
    }

    s.stop(`Created project ${pc.bold(finalProjectName)}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    s.cancel(`Failed to create project: ${message}`);
    return 1;
  }

  // 7. NPM Install
  const installSpinner = spin("Installing dependencies...");
  try {
    await $({ cwd: projectDest })`npm install`.quiet();
    installSpinner.stop("Dependencies installed");
  } catch {
    installSpinner.cancel(
      "Failed to install dependencies. You may need to run 'npm install' manually.",
    );
  }

  log.step("Next steps:");
  log.message(
    [`cd ${finalProjectName}`, "npm run dev"]
      .map((s, i) => `  ${pc.bold(i + 1)}. ${s}`)
      .join("\n"),
  );

  outro("Happy coding.");
  return 0;
}
