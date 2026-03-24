import { init as baseInit } from "./base/init.ts";
import { init as odysseyInit } from "./patch-odyssey/init.ts";

const index = {
  name: "Svelte",
  baseInit: baseInit,
  patches: [{ name: "patch-odyssey", init: odysseyInit }],
  questions: [
    {
      question: "Will this project render components inside an Odyssey?",
      action: "patch-odyssey",
    },
  ],
};

export default index;
