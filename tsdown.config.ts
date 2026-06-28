import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "neutral",
  clean: true,
  dts: true,
  sourcemap: true,
  deps: {
    neverBundle: ["react", "react-dom"],
  },
});
