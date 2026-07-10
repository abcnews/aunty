/**
 * @file
 * Core CLI logic using Commander.js.
 */

import path from "node:path";
import { Command, Help } from "commander";
import { run as runDeploy } from "../commands/deploy/index.ts";
import { run as runReleaseCheck } from "../commands/release-check/index.ts";
import { run as runRelease } from "../commands/release/index.ts";
import { run as runCreate } from "../commands/create/index.ts";
import { run as runBuild } from "../commands/build/index.ts";
import { run as runServe } from "../commands/serve/index.ts";
import { run as runMigrate } from "../commands/migrate/index.ts";
import { getHeader, printDevColours } from "../lib/terminal.ts";
import { loadJson } from "../lib/util.ts";
import pc from "picocolors";
import rawColours from "../lib/colours.json" with { type: "json" };

interface Colours {
  schemes: Record<string, {
    chars?: [number, number, number][];
    startFg?: [number, number, number];
    endFg?: [number, number, number];
  }>;
  commands: Record<string, string>;
}

const colours = rawColours as unknown as Colours;
const pcColors = pc as unknown as Record<string, (str: string) => string>;

const pkgPath = path.join(import.meta.dirname, "../../package.json");
const pkg = (await loadJson(pkgPath)) as {
  version: string;
  name: string;
  description: string;
};
const version = pkg?.version || "0.0.0";

const program = new Command();

program
  .name("aunty")
  .description(
    getHeader(
      `${pkg.name}${pc.dim("@" + pkg.version)}`,
      `${pc.dim(pkg.description.slice(0, 73))}`,
      { prepend: "" },
    ) +
      "\n" +
      pc.dim("─".repeat(80)),
  )
  .version(version);

/**
 * Configures the CLI help output to colorise subcommand terms (e.g. 'deploy', 'create')
 * in their designated project palette colors defined in colours.json.
 */
program.configureHelp({
  subcommandTerm: (cmd) => {
    const name = cmd.name();
    const colourName = colours.commands[name];
    const colourFn =
      colourName && typeof pcColors[colourName] === "function"
        ? pcColors[colourName]
        : (str: string) => str;
    const term = new Help().subcommandTerm(cmd);
    return term.replace(name, colourFn(name));
  },
  formatHelp: (cmd, helper) => {
    const baseHelp = new Help().formatHelp(cmd, helper);
    if (cmd.parent) {
      const name = cmd.name();
      const colourName = colours.commands[name] || "rainbow";
      const logoHeader = getHeader("aunty", name, {
        prepend: "",
        colour: colourName as keyof typeof rawColours.schemes,
      });
      return `${logoHeader}\n\n${baseHelp}`;
    }
    return baseHelp;
  },
});

program
  .command("deploy")
  .description(
    "Deploy the project to FTP. This deploys the current dist/ folder to the specified remote folder, falling back to the current version number. Use this to retry a failed release.",
  )
  .argument(
    "[destDir]",
    "Override the target folder name (defaults to package.json version)",
  )
  .option("-d, --dry-run", "Show what would happen without uploading", false)
  .option("-f, --force", "Overwrite the remote directory if it exists", false)
  .action(async (destDir, options) => {
    process.exit(await runDeploy({ destDir, ...options }));
  });

program
  .command("create")
  .description("Create a new project from a template")
  .argument("[destDir]", "Directory to create the project in")
  .action(async (destDir) => {
    process.exit(await runCreate(destDir));
  });

program
  .command("new", { hidden: true })
  .description("Alias for create")
  .argument("[destDir]", "Directory to create the project in")
  .action(async (destDir) => {
    process.exit(await runCreate(destDir));
  });

program
  .command("release-check")
  .description("Perform pre-release checks")
  .action(async () => {
    process.exit(await runReleaseCheck());
  });

program
  .command("release")
  .description("Version and release your project to FTP")
  .option("--version <version>", "Override the release version directly")
  .action(async (options) => {
    process.exit(await runRelease(options));
  });

program
  .command("serve")
  .description("Start a local development server")
  .action(async () => {
    await runServe();
  });

program
  .command("build")
  .description("Build the project for production")
  .action(async () => {
    process.exit(await runBuild());
  });

program
  .command("migrate")
  .description("Migrate a legacy project to use Vite and the latest version of aunty")
  .option("-y, --yes", "Skip confirmation prompt", false)
  .option("--skip-git", "Skip Git safety checks", false)
  .action(async (options) => {
    process.exit(await runMigrate(options));
  });

program
  .command("dev-colours", { hidden: true })
  .description("Test all available gradient colours")
  .action(() => {
    printDevColours();
    process.exit(0);
  });

try {
  // Start Commander
  await program.parseAsync(process.argv);
} catch (err: unknown) {
  // If Commander throws, print our unhandled exception message
  if (err instanceof Error) {
    console.error(`${pc.dim(err.stack)}`);
  } else {
    console.error(`${pc.red(pc.bold("Error:"))} ${pc.red(`‘${String(err)}’`)}`);
  }

  console.error(
    `${pc.red(pc.bold("■ Aunty has encountered an unhandled error."))}
└ This is likely a bug. Please report it at: ${pc.cyan("https://github.com/abcnews/aunty/issues/new")}`,
  );

  process.exit(1);
}
