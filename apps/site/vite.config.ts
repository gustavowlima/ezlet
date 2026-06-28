import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      ezlet: path.resolve(rootDir, "../../packages/ezlet/src/index.ts"),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(rootDir, "../..")],
    },
  },
  build: {
    outDir: "../../site-dist",
  },
});
