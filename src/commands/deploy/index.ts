import { intro, outro, confirm, log } from "@clack/prompts";
import path from "node:path";
import pc from "picocolors";
import { FtpClient } from "./ftp.ts";
import { loadJson } from "../../lib/util.ts";
import { getHeader, spin } from "../../lib/terminal.ts";
import { getFileInventory } from "./fs.ts";
import { BUILD_DIRECTORY_NAME } from "../../lib/constants.ts";
import slugify from "slugify";

interface DeployOptions {
  destDir?: string;
  buildDir?: string;
  dryRun?: boolean;
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
    log.error("Missing name or version in package.json");
    return 1;
  }

  // 3. Construct target path
  const localDir = path.resolve(
    projectRoot,
    options.buildDir || BUILD_DIRECTORY_NAME,
  );
  const nameSlug = (slugify as any)(name, { strict: true });
  const targetFolder = options.destDir || version;
  const remoteDir = `/www/res/sites/news-projects/${nameSlug}/${targetFolder}/`;
  const publicUrl = `https://www.abc.net.au/res/sites/news-projects/${nameSlug}/${targetFolder}/`;
  log.info(`${pc.bold("TargetDir:")} ${pc.dim(remoteDir)}`);

  // 4. File Inventory & Size Check
  let inventory;
  try {
    inventory = await getFileInventory(localDir);
  } catch (err) {
    log.error(
      `Build directory not found at ${localDir}. Have you run the build command?`,
    );
    return 1;
  }

  if (inventory.length === 0) {
    log.error(`Build directory is empty! Nothing to deploy.`);
    return 1;
  }

  log.step(`Found ${pc.bold(inventory.length)} files to deploy`);

  if (options.dryRun) {
    outro(pc.green("Dry run complete. No files were uploaded."));
    return 0;
  }

  // 5. Credential Test & Confirmation
  const ftpClient = new FtpClient();
  try {
    await ftpClient.testConnection();
  } catch (err) {
    return 1;
  }

  const exists = await ftpClient.exists(remoteDir);

  if (exists) {
    // Close the connection before waiting on user input to avoid a socket timeout
    ftpClient.close();

    const shouldOverwrite = await confirm({
      message: `${pc.red(`Directory ${pc.bold(remoteDir)} already exists.`)} Overwrite?`,
      initialValue: false,
    });

    if (!shouldOverwrite || typeof shouldOverwrite === "symbol") {
      log.warn("Deploy cancelled.");
      return 0;
    }

    // Reconnect after the prompt
    await ftpClient.connect();
  } else {
    await ftpClient.ensureDir(remoteDir);
  }

  const uploadSpinner = spin("Uploading files...");

  let uploadedCount = 0;
  let currentFile = "";
  const totalFilesStr = inventory.length.toString();

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
  ftpClient.close();

  log.info(`${pc.bold("Public URL:")} ${pc.cyan(publicUrl)}`);
  outro(pc.green("Deploy complete!"));
  return 0;
}
