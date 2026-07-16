/**
 * @file
 * A command to migrate an old Aunty Webpack project to Aunty Vite.
 *
 */

import { intro, outro, confirm, log, cancel, isCancel } from "@clack/prompts";
import path from "node:path";
import fs from "node:fs/promises";
import pc from "picocolors";
import { $, glob } from "zx";
import { getHeader, spin } from "../../lib/terminal.ts";
import { findProjectDetails, loadJson } from "../../lib/util.ts";
import * as git from "../../lib/git.ts";
import { installAunty } from "../../lib/initHelpers.ts";

interface MigrateOptions {
  yes?: boolean;
  skipGit?: boolean;
}

/**
 * Migrates a legacy HTML file by removing legacy scripts and comments,
 * injecting the new Vite entry script, writing it to the destination, and deleting the source.
 */
async function migrateHtmlFile(
  srcPath: string,
  destPath: string,
  entryFile: string,
): Promise<void> {
  let content = await fs.readFile(srcPath, "utf-8");

  // Remove legacy script tags (e.g. referencing index.js, index_modern.js, etc.)
  content = content.replace(
    /<script\s+src=["'](?:index\.js|index_modern\.js)["']\s*><\/script>/gi,
    "",
  );
  // Remove all HTML comments
  content = content.replace(/<!--[\s\S]*?-->/g, "");

  // Update inline script tags that dispatch 'odyssey:api' to be modules so they run after deferred module entry points.
  content = content.replace(/<script([\s\S]*?)>([\s\S]*?)<\/script>/gi, (match, attributes, innerContent) => {
    const hasOdysseyApi = innerContent.includes("odyssey:api");
    const isClassicScript = !attributes.trim() || attributes.includes('type="text/javascript"') || attributes.includes("type='text/javascript'");

    if (hasOdysseyApi && isClassicScript) {
      return `<script type="module">${innerContent}</script>`;
    }
    return match;
  });

  // Inject the new Vite entry point
  const scriptTag = `<script type="module" src="/${entryFile}"></script>`;
  if (content.includes("</head>")) {
    content = content.replace("</head>", `  ${scriptTag}\n  </head>`);
  } else {
    content = scriptTag + "\n" + content;
  }

  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, content);
  await fs.unlink(srcPath);
}

/**
 * The main entry point for the 'aunty migrate' command.
 */
export async function run(options: MigrateOptions = {}): Promise<number> {
  intro(getHeader(pc.dim("aunty"), "migrate", { colour: "rainbow" }));

  // 1. Load Project Details & Sanity Check on package.json presence
  const details = await findProjectDetails(process.cwd());
  if (!details) {
    cancel(
      "Could not find package.json. Please run this command inside an aunty project.",
    );
    return 1;
  }
  const baseDir = details.root;

  // Check for aunty.config.js in the root of the repo
  const configPath = path.join(baseDir, "aunty.config.js");
  const hasConfig = await fs.access(configPath).then(() => true).catch(() => false);
  if (hasConfig) {
    log.error(
      `Found legacy ${pc.cyan("aunty.config.js")} at the root of the project. We cannot migrate this project automatically. Please delete or rename the file before continuing, and configure Vite manually after migration.`
    );
    return 1;
  }

  // 2. Git Safety Checks (bypassed if options.skipGit is true)
  if (!options.skipGit) {
    const gitAccessible = await git.isAccessible();
    const insideRepo = gitAccessible ? await git.isInsideRepo() : false;

    if (!gitAccessible) {
      log.error(
        "Git is not accessible (please ensure git is installed and Xcode/licenses are accepted).",
      );
      return 1;
    }

    if (!insideRepo) {
      log.error("The current directory is not a git repository.");
      return 1;
    }

    // Check for uncommitted changes
    if (!(await git.isClean())) {
      log.error(
        "You have uncommitted changes. Please commit or stash them before migrating.",
      );
      return 1;
    }

    // Check remote sync
    if (await git.hasRemote()) {
      if (await git.isBehindRemote()) {
        log.error(
          "Your local branch is behind the remote. Please pull the latest changes before migrating.",
        );
        return 1;
      }
    }
  }

  // 3. Sanity Checks for index.html and index entrypoint
  const publicHtmlPath = path.join(baseDir, "public/index.html");
  try {
    await fs.access(publicHtmlPath);
  } catch {
    log.error(
      `Could not find public/index.html. This project does not seem to match the expected legacy structure.`,
    );
    return 1;
  }

  const hasTS = await fs
    .access(path.join(baseDir, "src/index.ts"))
    .then(() => true)
    .catch(() => false);
  const hasJS = await fs
    .access(path.join(baseDir, "src/index.js"))
    .then(() => true)
    .catch(() => false);

  if (!hasTS && !hasJS) {
    log.error("Could not find src/index.ts or src/index.js entry point.");
    return 1;
  }

  const entryFile = hasTS ? "src/index.ts" : "src/index.js";

  log.message("Attempt to migrate an Aunty Webpack project to Aunty Vite.");
  log.message(
    "This is a fairly naive and destructive process, and may not work for your specific configuration.",
  );
  log.message(
    "Please make take a backup or ensure Git is pushed before proceeding.",
  );

  // 4. Initial Confirmation Prompt (bypassed if options.yes is true)
  if (!options.yes) {
    const shouldContinue = await confirm({
      message: "Are you sure you want to migrate this project to Vite?",
      initialValue: true,
    });

    if (!shouldContinue || isCancel(shouldContinue)) {
      cancel("Migration cancelled.");
      return 0;
    }
  }

  // 5. Migration Execution
  const migrationSpinner = spin("Migrating configuration files...");
  try {
    const templateDir = path.resolve(
      import.meta.dirname,
      "../../../templates/svelte/base/contents",
    );

    // Copy Vite config files
    const filesToCopy = [
      "vite.config.ts",
      "svelte.config.js",
      "tsconfig.json",
      "tsconfig.app.json",
      "tsconfig.node.json",
    ];

    for (const file of filesToCopy) {
      const srcPath = path.join(templateDir, file);
      const destPath = path.join(baseDir, file);
      await fs.copyFile(srcPath, destPath);
    }

    // Merge .gitignore
    const templateGitignorePath = path.join(templateDir, "_gitignore");
    const targetGitignorePath = path.join(baseDir, ".gitignore");
    let existingGitignore = "";
    try {
      existingGitignore = await fs.readFile(targetGitignorePath, "utf-8");
    } catch {}
    const templateGitignore = await fs.readFile(templateGitignorePath, "utf-8");

    const uniqueRules = Array.from(
      new Set(
        [
          ...existingGitignore.split(/\r?\n/),
          ...templateGitignore.split(/\r?\n/),
        ]
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#")),
      ),
    );
    await fs.writeFile(targetGitignorePath, uniqueRules.join("\n") + "\n");

    // Move index.html
    const destHtmlPath = path.join(baseDir, "index.html");
    await migrateHtmlFile(publicHtmlPath, destHtmlPath, entryFile);

    // Check for legacy builder in public/builder/index.html
    const publicBuilderHtmlPath = path.join(baseDir, "public/builder/index.html");
    const hasLegacyBuilder = await fs
      .access(publicBuilderHtmlPath)
      .then(() => true)
      .catch(() => false);

    if (hasLegacyBuilder) {
      const destBuilderHtmlPath = path.join(baseDir, "builder/index.html");
      await migrateHtmlFile(publicBuilderHtmlPath, destBuilderHtmlPath, entryFile);

      // Clean up legacy builder directory inside public if it exists and is empty
      try {
        await fs.rmdir(path.join(baseDir, "public/builder"));
      } catch {}
    }

    migrationSpinner.stop(
      "Configuration files updated and index.html migrated successfully" +
        (hasLegacyBuilder ? " (including builder)" : ""),
    );
  } catch (err: any) {
    migrationSpinner.cancel("Failed during file migration step");
    log.error(err.message || String(err));
    return 1;
  }

  // 6. Update package.json
  const pkgSpinner = spin("Updating package.json dependencies and scripts...");
  try {
    const templateDir = path.resolve(
      import.meta.dirname,
      "../../../templates/svelte/base/contents",
    );
    const pkgPath = path.join(baseDir, "package.json");
    const pkg = await loadJson<any>(pkgPath);
    const templatePkg = await loadJson<any>(
      path.join(templateDir, "package.json"),
    );

    pkg.type = "module";

    // Update scripts
    if (!pkg.scripts) pkg.scripts = {};
    pkg.scripts.dev = "vite serve";
    pkg.scripts.build = "vite build";
    pkg.scripts.check =
      "svelte-check --tsconfig ./tsconfig.app.json && tsc -p tsconfig.node.json";
    pkg.scripts.format = "prettier --write .";
    if (pkg.scripts.start === "aunty serve") {
      delete pkg.scripts.start;
    }

    // Merge dependencies & devDependencies
    if (!pkg.dependencies) pkg.dependencies = {};
    if (!pkg.devDependencies) pkg.devDependencies = {};

    const oldDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const hasSassDep = "sass" in oldDeps || "node-sass" in oldDeps;
    const scssFiles = await glob("src/**/*.s[ac]ss", { cwd: baseDir });
    const hasSass = hasSassDep || scssFiles.length > 0;

    Object.assign(pkg.dependencies, templatePkg.dependencies || {});
    Object.assign(pkg.devDependencies, templatePkg.devDependencies || {});

    if (hasSass) {
      pkg.devDependencies["sass-embedded"] = "^1.83.0";
    }

    // Save package.json
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    // Set @abcnews/aunty to latest or local file
    await installAunty(baseDir);

    pkgSpinner.stop("package.json updated");
  } catch (err: any) {
    pkgSpinner.cancel("Failed to update package.json");
    log.error(err.message || String(err));
    return 1;
  }

  // 7. NPM Install
  const installSpinner = spin("Installing dependencies via npm...");
  try {
    await $({ cwd: baseDir })`npm install`.quiet();
    installSpinner.stop("Dependencies installed");
  } catch (err: any) {
    installSpinner.cancel("Failed to install dependencies.");
    log.error(`npm install failed: ${err.message || String(err)}`);
    return 1;
  }

  outro(
    "Migration completed successfully! You can now run 'npm run dev' to start development.",
  );
  return 0;
}
