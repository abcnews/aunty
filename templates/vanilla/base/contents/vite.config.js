import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    basicSsl({
      certDir: '/Users/byrd.joshua/.devServer/cert'
    }),
  ],
  server: {
    origin: "https://localhost:5173",
    cors: true,
  },
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
