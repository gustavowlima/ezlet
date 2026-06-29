import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "neutral",
  clean: true,
  css: {
    fileName: "styles.css",
    inject: true,
  },
  dts: true,
  sourcemap: true,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
});
