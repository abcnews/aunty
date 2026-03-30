import { select, cancel, isCancel } from "@clack/prompts";
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

  await baseInit(options);

  if (projectType === "odyssey") {
    await odysseyInit(options);
  }

  if (projectType === "scrollyteller") {
    await scrollytellerInit(options);
  }

  return 0;
}
