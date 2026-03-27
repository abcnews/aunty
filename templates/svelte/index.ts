import type { ProjectTemplate } from "../../src/commands/create/types.ts";
import { init as baseInit } from "./base/init.ts";
import { init as odysseyInit } from "./patch-odyssey/init.ts";
import { init as scrollytellerInit } from "./patch-scrollyteller/init.ts";

const index: ProjectTemplate = {
  name: "Svelte",
  baseInit: baseInit,
  patches: [
    { name: "patch-odyssey", init: odysseyInit },
    { name: "patch-scrollyteller", init: scrollytellerInit },
  ],
  questions: [
    {
      question: "Will this project render components inside an Odyssey?",
      action: "patch-odyssey",
    },
    {
      question: "Will you use svelte-scrollyteller?",
      action: "patch-scrollyteller",
    },
  ],
};

export default index;
