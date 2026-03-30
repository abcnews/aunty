#!/usr/bin/env tsx

/**
 * Aunty - ABC News Digital developer toolkit
 */

import path from "node:path";
import { Command } from "commander";
import { run as runDeploy } from "../commands/deploy/index.ts";
import { run as runReleaseCheck } from "../commands/release-check/index.ts";
import { run as runCreate } from "../commands/create/index.ts";
import { getLogo } from "../lib/terminal.ts";
import { loadJson } from "../lib/util.ts";
import pc from "picocolors";

const pkgPath = path.join(import.meta.dirname, "../../package.json");
const pkg = (await loadJson(pkgPath)) as { version?: string } | null;
const version = pkg?.version || "0.0.0";

const program = new Command();

program
  .name("aunty")
  .description(`${getLogo()} ABC News developer toolkit`)
  .version(version);

program
  .command("deploy")
  .description("Deploy the project to the content FTP")
  .argument(
    "[destDir]",
    "Override the target folder name (defaults to package.json version)",
  )
  .option("-d, --dry-run", "Show what would happen without uploading", false)
  .option("-f, --force", "Overwrite the remote directory if it exists", false)
  .action(async (destDir, options) => {
    process.exit(await runDeploy({ destDir, ...options }));
  });

program
  .command("create")
  .description("Create a new project from a template")
  .argument("[destDir]", "Directory to create the project in")
  .action(async (destDir) => {
    process.exit(await runCreate(destDir));
  });

program
  .command("new", { hidden: true })
  .description("Alias for create")
  .argument("[destDir]", "Directory to create the project in")
  .action(async (destDir) => {
    process.exit(await runCreate(destDir));
  });

program
  .command("release-check")
  .description("Perform pre-release checks (git and FTP)")
  .action(async () => {
    process.exit(await runReleaseCheck());
  });

try {
  // Start Commander
  await program.parseAsync(process.argv);
} catch (err: unknown) {
  // If Commander throws, print our unhandled exception message
  if (err instanceof Error) {
    console.error(`${pc.dim(err.stack)}`);
  } else {
    console.error(`${pc.red(pc.bold("Error:"))} ${pc.red(`‘${String(err)}’`)}`);
  }

  console.error(
    `${pc.red(pc.bold("■ Aunty has encountered an unhandled error."))}
└ This is likely a bug. Please report it at: ${pc.cyan("https://github.com/abcnews/aunty/issues/new")}`,
  );

  process.exit(1);
}
