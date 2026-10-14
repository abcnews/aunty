import { intro, outro, confirm, log, cancel, isCancel } from "@clack/prompts";
import path from "node:path";
import pc from "picocolors";
import { FtpClient } from "../../lib/ftp.ts";
import { formatSize, findProjectDetails } from "../../lib/util.ts";
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
  skipHeader?: boolean;
  /** Files written to the project folder (beside the version folders), after the build uploads */
  extraFiles?: { name: string; content: string }[];
}

/**
 * The main entry point for the 'aunty deploy' command.
 */
export async function run(options: DeployOptions = {}): Promise<number> {
  if (!options.skipHeader) {
    intro(
      getHeader(
        pc.dim("aunty"),
        `deploy${options.dryRun ? ` ${pc.cyan("[dry]")}` : ""}`,
        { colour: "red" },
      ),
    );
  }

  // 1. Load config
  const details = await findProjectDetails(process.cwd());

  if (!details) return 1;

  const { root: projectRoot, pkg: config } = details;
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

  const files = [
    ...inventory,
    ...(options.extraFiles || []).map(({ name, content }) => ({
      relPath: `../${name}`,
      size: Buffer.byteLength(content),
    })),
  ];
  const list = files
    .map((f) => `  ${pc.dim(f.relPath)} (${formatSize(f.size)})`)
    .join("\n");
  log.step(`Found ${pc.bold(files.length)} files to deploy:\n${list}`);

  if (options.dryRun) {
    outro(pc.green("Dry run complete. No files were uploaded."));
    return 0;
  }

  // 5. Credential Test & Confirmation
  const ftpClient = new FtpClient();
  try {
    await ftpClient.connect();
  } catch (err) {
    log.error(
      `FTP connection failed: ${err instanceof Error ? err.message : String(err)}`,
    );
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

    // Uploaded last so a redirect never points at a version that isn't there yet
    // One at a time: basic-ftp can't run concurrent tasks on a single connection
    for (const { name, content } of extraFiles) {
      await ftpClient.uploadFile(
        content,
        path.join(FTP_PROJECTS_PATH, nameSlug, name),
      );
    }

    uploadSpinner.stop(`Upload finished`);
  } catch (err) {
    uploadSpinner.cancel("Upload failed");
    ftpClient.close();
    throw err;
  }

  ftpClient.close();

  outro(`${pc.bold("Released to:")} ${pc.cyan(publicUrl)}`);
  extraFiles.forEach(({ name }) =>
    log.info(`${PUBLIC_PROJECTS_URL}${nameSlug}/${name}`),
  );
  return 0;
}
