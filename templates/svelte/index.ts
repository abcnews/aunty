import { select, confirm, cancel, isCancel } from "@clack/prompts";
import type { InitOptions } from "../../src/commands/create/types.ts";
import { init as baseInit } from "./base/init.ts";
import { init as odysseyInit } from "./patch-odyssey/init.ts";
import { init as scrollytellerInit } from "./patch-scrollyteller/init.ts";

export default async function run(options: InitOptions) {
  const projectType = await select({
    message: "What kind of project do you want?",
    options: [
      { value: "scrollyteller", label: "Odyssey with Scrollyteller" },
      { value: "odyssey", label: "Basic Odyssey" },
      { value: "base", label: "Basic iframe/CoreMedia" },
    ],
  });

  if (isCancel(projectType)) {
    cancel("Operation cancelled.");
    return 1;
  }

  const useBuilder = await confirm({
    message: "Would you like to add a Builder?",
    initialValue: false,
  });

  if (isCancel(useBuilder)) {
    cancel("Operation cancelled.");
    return 1;
  }

  const useTypescript = await confirm({
    message: "Do you want to use TypeScript?",
    initialValue: true,
  });

  if (isCancel(useTypescript)) {
    cancel("Operation cancelled.");
    return 1;
  }

  await baseInit(options);

  if (projectType === "odyssey") {
    // patch base to run in odyssey
    await odysseyInit(options);
  } else if (projectType === "scrollyteller") {
    // patch base w scrollyteller in Odyssey
    // scrollyteller already includes the Odyssey patches. Was easier this way.
    await scrollytellerInit(options);
  }

  if (useBuilder) {
    const { init: builderInit } = await import("./patch-builder/init.ts");
    await builderInit(options);
  }

  if (!useTypescript) {
    const { init: jsInit } = await import("./patch-js/init.ts");
    await jsInit(options, useBuilder);
  }

  return 0;
}
