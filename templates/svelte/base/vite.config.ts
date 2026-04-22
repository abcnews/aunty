/**
 * @file
 * This config does two things:
 * 1. resolve your Aunty certificates and serve via HTTPS on your ABC hostname
 * 2. create a non-ESM entrypoint called es5entry.js, to bootstrap our ESM app
 *
 * The idea is that eventually these will be imported from @abcnews/aunty, but
 * for now they're inline so we can test and modify.
 */
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";

// TODO: We need to export these on @abcnews/aunty so we can eject our
// config if need be.
import { getServer } from "../../../src/lib/vite/getServer.ts";
import { es5EntryPlugin } from "../../../src/lib/vite/es5EntryPlugin.ts";
import { abcSomeCorsPlugin } from "../../../src/lib/vite/abcSomeCorsPlugin.ts";

const isTS = existsSync(join(process.cwd(), "src/index.ts"));
const entryPoint = isTS ? "src/index.ts" : "src/index.js";

/**
 * Application entry points.
 */
const rollupInput: Record<string, string> = {
  "index.html": "index.html",
  index: entryPoint,
};

// Add the builder entry point if it exists.
if (existsSync(join(process.cwd(), "builder/index.html"))) {
  rollupInput["builder/index.html"] = "builder/index.html";
}

export default defineConfig({
  base: "",
  plugins: [svelte(), es5EntryPlugin(entryPoint), abcSomeCorsPlugin()],
  server: getServer(),
  build: {
    rollupOptions: {
      input: rollupInput,
      output: {
        // entry points currently get hashed. In the future we will likely
        // want to spit these out into /[name].js so we have a stable /index.js
        // entry point.
        entryFileNames: "modules/[name]-[hash].js",

        // the remainder of assets get hashed to avoid name collisions.
        chunkFileNames: "modules/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
