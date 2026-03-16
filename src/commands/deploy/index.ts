import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import pc from "picocolors";
import { FtpClient } from "./ftp.ts";
import { loadJson } from "../../lib/util.ts";
import { spin } from "../../lib/terminal.ts";
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
export async function run(options: DeployOptions = {}) {
  const projectRoot = process.cwd();

  console.log(`${pc.bold("Aunty Deploy")}`);

  // 1. Load config
  const config = await loadJson(path.join(projectRoot, "package.json"));

  if (!config) {
    throw new Error(`package.json not found in ${projectRoot}`);
  }

  const { name, version } = config;
  if (!name || !version) {
    throw new Error("Missing name or version in package.json");
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
  console.log(`${pc.bold("Target:")} ${remoteDir}`);

  // 4. File Inventory & Size Check
  let inventory;
  try {
    inventory = await getFileInventory(localDir);
  } catch (err) {
    throw new Error(
      `Build directory not found at ${localDir}. Have you run the build command?`,
    );
  }

  if (inventory.length === 0) {
    throw new Error(`Build directory is empty! Nothing to deploy.`);
  }

  inventory.forEach((file) => {
    console.log(` - ${file.relPath} (${file.size} bytes)`);
  });

  if (options.dryRun) {
    console.log(`${pc.green("Dry run complete. No files were uploaded.")}`);
    return;
  }

  // 5. Credential Test & Confirmation
  let ftpClient = new FtpClient();
  try {
    await ftpClient.testConnection();
  } catch (err) {
    return;
  }

  const exists = await ftpClient.exists(remoteDir);

  if (exists) {
    // Close the connection before waiting on user input to avoid a socket timeout
    ftpClient.close();

    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      `${pc.bgRed(pc.bold(" WARNING "))} ${pc.bold(pc.red(`Directory ${remoteDir} already exists. Overwrite? (y/N): `))}`,
    );
    rl.close();

    if (answer.toLowerCase() !== "y") {
      console.log(`${pc.yellow("Deploy cancelled.")}`);
      return;
    }

    // Reconnect after the prompt
    await ftpClient.connect();
  } else {
    await ftpClient.ensureDir(remoteDir);
  }

  console.log(); // Blank line before upload starts
  const uploadSpinner = spin("Uploading...");

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
      uploadSpinner.text = `${countStr}/${totalFilesStr} ${info.name}`;
    }
  });

  uploadSpinner.stop();
  ftpClient.close();

  console.log();
  console.log(`${pc.bold(pc.green("Deploy complete!"))}`);
  console.log(`${pc.bold("Public URL:")} ${publicUrl}`);
}
