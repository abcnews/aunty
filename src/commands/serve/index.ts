import { createServer } from "vite";
import { intro, log } from "@clack/prompts";
import pc from "picocolors";
import { getHeader } from "../../lib/terminal.ts";
import { resolveProjectConfig, handleViteError } from "../../lib/vite/cliVite.ts";

/**
 * The main entry point for the 'aunty serve' command.
 */
export async function run(): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "serve"));

  const config = await resolveProjectConfig();
  if (!config) return 1;

  const { root, configFile } = config;

  log.info("Starting dev server\n");

  const server = await createServer({
    root,
    configFile,
  }).catch((error: Error) => error);

  if (server instanceof Error) {
    return handleViteError(server);
  }

  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });
  console.log(""); //print one extra line so errors are clearer.

  return 0;
}
