import { intro, outro, log } from "@clack/prompts";
import pc from "picocolors";
import { $ } from "zx";
import { getHeader } from "../../lib/terminal.ts";
import { findProjectDetails } from "../../lib/util.ts";

/**
 * The main entry point for the 'aunty serve' command.
 */
export async function run(): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "serve", { colour: "cyan" }));
  outro("Starting development server...");

  // 1. Load config
  const details = await findProjectDetails(process.cwd());

  if (!details) return 1;

  const { pkg } = details;
  const hasDevScript = !!pkg.scripts?.dev;

  if (!hasDevScript) {
    log.error(
      `Could not find a ${pc.cyan("dev")} script in package.json.`,
    );
    return 1;
  }

  try {
    const isVite = pkg.scripts?.dev?.includes("vite");
    if (isVite) {
      await $({ stdio: "inherit" })`npm run dev -- --clearScreen false`;
    } else {
      await $({ stdio: "inherit" })`npm run dev`;
    }
    return 0;
  } catch (err: any) {
    if (err.exitCode !== undefined) {
      return err.exitCode;
    }
    log.error(`Failed to start npm command: ${err.message}`);
    return 1;
  }
}
