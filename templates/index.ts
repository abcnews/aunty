import svelteRun from "./svelte/index.ts";
import vanillaRun from "./vanilla/index.ts";

const index = {
  projects: [
    { name: "Svelte", run: svelteRun },
    { name: "Plain JS", run: vanillaRun },
  ],
};

export default index;
