import { multiselect, cancel, isCancel } from "@clack/prompts";
import type { InitOptions } from "../../src/commands/create/types.ts";
import { init as baseInit } from "./base/init.ts";
import { init as odysseyInit } from "./patch-odyssey/init.ts";
import { init as scrollytellerInit } from "./patch-scrollyteller/init.ts";

export default async function run(options: InitOptions) {
  const features = await multiselect({
    message: "Select features to enable:",
    options: [
      { value: "odyssey", label: "Odyssey" },
      { value: "scrollyteller", label: "Scrollyteller" },
      { value: "builder", label: "Builder" },
      { value: "typescript", label: "TypeScript" },
    ],
    initialValues: ["typescript"],
    required: false,
  });

  if (isCancel(features)) {
    cancel("Operation cancelled.");
    return 1;
  }

  const useTypescript = features.includes("typescript");
  const useBuilder = features.includes("builder");
  const useScrollyteller = features.includes("scrollyteller");
  const useOdyssey = features.includes("odyssey");

  await baseInit(options);

  if (useScrollyteller) {
    // patch base w scrollyteller in Odyssey
    // scrollyteller already includes the Odyssey patches. Was easier this way.
    await scrollytellerInit(options);
  } else if (useOdyssey) {
    // patch base to run in odyssey
    await odysseyInit(options);
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
