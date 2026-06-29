import path from "node:path";
import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMdxFrontmatter],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeShiki,
            {
              themes: { dark: "github-dark-dimmed", light: "github-light" },
              defaultColor: false,
            },
          ],
        ],
      }),
    },
    react({ include: /\.(tsx|ts|jsx|js|mdx)$/ }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "ezlet/styles.css": path.resolve(rootDir, "../../packages/ezlet/src/styles/ezlet.css"),
      "ezlet": path.resolve(rootDir, "../../packages/ezlet/src/index.ts"),
      "@": path.resolve(rootDir, "src"),
    },
  },
  optimizeDeps: {
    exclude: ["ezlet"],
  },
  server: {
    fs: { allow: [path.resolve(rootDir, "../..")] },
  },
  build: {
    outDir: "dist",
  },
});
