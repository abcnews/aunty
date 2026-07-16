import { select, confirm, cancel, isCancel } from "@clack/prompts";
import type { InitOptions } from "../../src/commands/create/types.ts";
import { init as baseInit } from "./base/init.ts";

export default async function run(options: InitOptions) {
  const projectType = await select({
    message: "What kind of project do you want?",
    options: [{ value: "base", label: "Basic iframe/CoreMedia" }],
  });

  if (isCancel(projectType)) {
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

  if (!useTypescript) {
    const { init: jsInit } = await import("./patch-js/init.ts");
    await jsInit(options);
  }

  return 0;
}
