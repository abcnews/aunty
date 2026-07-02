import { intro, log } from "@clack/prompts";
import pc from "picocolors";
import { getHeader } from "../../lib/terminal.ts";
import { runBuild } from "../../lib/util.ts";

/**
 * The main entry point for the 'aunty build' command.
 */
export async function run(): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "build"));

  try {
    await runBuild({ stdio: "inherit" });
    return 0;
  } catch (err: any) {
    if (err.exitCode !== undefined) {
      return err.exitCode;
    }
    log.error(err.message || `Failed to start npm command: ${err.message}`);
    return 1;
  }
}
