/**
 * @file
 * CoreMedia entrypoint. Creates a non-module coremedia.js in your build.
 */
import { whenOdysseyLoaded } from "@abcnews/env-utils";
import { getMountValue, selectMounts } from "@abcnews/mount-utils";
import { mount } from "svelte";
import App from "./App.svelte";
import { loadScrollyteller } from "@abcnews/svelte-scrollyteller";

const MARKER_NAME = "__PROJECT_NAME_ACTO__";

import { type PanelData } from "./types.ts";

await whenOdysseyLoaded;

// Multiple scrollytellers are allowed in a page, providing they have a unique id.
const mounts = selectMounts("scrollytellerNAME" + MARKER_NAME, {
  markAsUsed: false,
});
mounts.forEach((mountEl) => {
  const scrollyName = getMountValue(mountEl, "scrollytellerNAME");
  const scrollyConfig = loadScrollyteller<PanelData>(
    scrollyName,
    "u-full",
    "mark",
  );
  mount(App, {
    target: scrollyConfig.mountNode,
    props: {
      panels: scrollyConfig.panels,
    },
  });
});
