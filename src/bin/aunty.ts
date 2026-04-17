#!/usr/bin/env tsx

/**
 * Aunty - ABC News Digital developer toolkit
 */

import path from "node:path";
import { Command } from "commander";
import { run as runDeploy } from "../commands/deploy/index.ts";
import { run as runReleaseCheck } from "../commands/release-check/index.ts";
import { getLogo } from "../lib/terminal.ts";
import { loadJson } from "../lib/util.ts";

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
  .action(async (destDir, options) => {
    try {
      process.exit(await runDeploy({ destDir, ...options }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\n❌ ${message}`);
      process.exit(1);
    }
  });

program
  .command("release-check")
  .description("Perform pre-release checks (git and FTP)")
  .action(async () => {
    try {
      process.exit(await runReleaseCheck());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\n❌ ${message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
