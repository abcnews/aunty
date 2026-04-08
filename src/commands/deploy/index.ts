import { intro, outro, confirm, log, cancel, isCancel } from "@clack/prompts";
import path from "node:path";
import pc from "picocolors";
import { FtpClient } from "../../lib/ftp.ts";
import { loadJson, formatSize } from "../../lib/util.ts";
import { getHeader, spin } from "../../lib/terminal.ts";
import {
  BUILD_DIRECTORY_NAME,
  FTP_PROJECTS_PATH,
  PUBLIC_PROJECTS_URL,
} from "../../lib/constants.ts";
import { getFileInventory } from "./fs.ts";
import slugify from "slugify";

interface DeployOptions {
  destDir?: string;
  buildDir?: string;
  dryRun?: boolean;
  force?: boolean;
}

/**
 * The main entry point for the 'aunty deploy' command.
 */
export async function run(options: DeployOptions = {}): Promise<number> {
  const projectRoot = process.cwd();

  intro(
    getHeader(
      pc.dim("aunty"),
      `deploy${options.dryRun ? ` ${pc.cyan("[dry]")}` : ""}`,
    ),
  );

  // 1. Load config
  const config = (await loadJson(path.join(projectRoot, "package.json"))) as {
    name: string;
    version: string;
  } | null;

  if (!config) {
    log.error(`package.json not found in ${projectRoot}`);
    return 1;
  }

  const { name, version } = config;
  if (!name || !version) {
    cancel("Missing name or version in package.json");
    return 1;
  }

  // 3. Construct target path
  const localDir = path.resolve(
    projectRoot,
    options.buildDir || BUILD_DIRECTORY_NAME,
  );
  const nameSlug = (slugify as unknown as (s: string, o: object) => string)(
    name,
    { strict: true },
  );
  const targetFolder = options.destDir || version;
  const remoteDir = path.join(FTP_PROJECTS_PATH, nameSlug, targetFolder, "/");
  const publicUrl = `${PUBLIC_PROJECTS_URL}${nameSlug}/${targetFolder}/`;
  log.info(`${pc.bold("Remote dir:")} ${pc.dim(remoteDir)}`);

  // 4. File Inventory & Size Check
  let inventory;
  try {
    inventory = await getFileInventory(localDir);
  } catch {
    cancel(
      `Build directory not found at ${pc.cyan(localDir)}. Have you run the build command?`,
    );
    return 1;
  }

  if (inventory.length === 0) {
    cancel(`Build directory is empty! Nothing to deploy.`);
    return 1;
  }

  const list = inventory
    .map(
      (f: { relPath: string; size: number }) =>
        `  ${pc.dim(f.relPath)} (${formatSize(f.size)})`,
    )
    .join("\n");
  log.step(`Found ${pc.bold(inventory.length)} files to deploy:\n${list}`);

  if (options.dryRun) {
    outro(pc.green("Dry run complete. No files were uploaded."));
    return 0;
  }

  // 5. Credential Test & Confirmation
  const ftpClient = new FtpClient();
  try {
    await ftpClient.testConnection();
  } catch {
    // FtpClient.testConnection() already handles UI feedback via its own spinner
    return 1;
  }

  const exists = await ftpClient.exists(remoteDir);

  if (exists && !options.force) {
    // Close the connection before waiting on user input to avoid a socket timeout
    ftpClient.close();

    const shouldOverwrite = await confirm({
      message: `${pc.red(`Directory ${pc.bold(remoteDir)} already exists.`)} Overwrite?`,
      initialValue: false,
    });

    if (!shouldOverwrite || isCancel(shouldOverwrite)) {
      cancel("Deploy cancelled.");
      return 0;
    }

    // Reconnect after the prompt
    await ftpClient.connect();
  } else if (!exists) {
    await ftpClient.ensureDir(remoteDir);
  } else if (options.force) {
    log.info(pc.yellow("Force flag used. Overwriting remote directory."));
  }

  const uploadSpinner = spin("Uploading files...");

  let uploadedCount = 0;
  let currentFile = "";
  const totalFilesStr = inventory.length.toString();

  try {
    await ftpClient.uploadDir(localDir, remoteDir, (info) => {
      if (info.name !== currentFile) {
        uploadedCount++;
        currentFile = info.name;
        const countStr = uploadedCount
          .toString()
          .padStart(totalFilesStr.length, " ");
        uploadSpinner.message(`${countStr}/${totalFilesStr} ${info.name}`);
      }
    });
    uploadSpinner.stop("Upload complete");
  } catch (err) {
    uploadSpinner.cancel("Upload failed");
    ftpClient.close();
    throw err;
  }

  ftpClient.close();

  log.info(`${pc.bold("Public URL:")} ${pc.cyan(publicUrl)}`);
  outro(pc.green("Deploy complete!"));
  return 0;
}
