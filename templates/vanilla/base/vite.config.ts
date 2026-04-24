import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { getServer } from "../../../src/lib/vite/getServer.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [basicSsl()],
  server: getServer(),
  build: {
    rolldownOptions: {
      output: {
        format: "iife",
        entryFileNames: "[name].js",
      },
    },
  },
  base: "./",
});
