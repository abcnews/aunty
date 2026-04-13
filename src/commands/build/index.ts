import { build } from "vite";
import { intro, log } from "@clack/prompts";
import pc from "picocolors";
import { getHeader } from "../../lib/terminal.ts";
import { resolveProjectConfig, handleViteError } from "../../lib/vite.ts";

/**
 * The main entry point for the 'aunty build' command.
 */
export async function run(): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "build"));

  const config = await resolveProjectConfig();
  if (!config) return 1;

  const { root, configFile } = config;

  // 3. Execute the build
  log.info("Deferring to Vite\n");

  const buildError = await build({
    root,
    configFile,
  }).catch((error) => error);

  if (buildError instanceof Error) {
    return handleViteError(buildError);
  }

  return 0;
}
