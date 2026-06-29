declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { DocMeta } from "@/docs/types";

  export const frontmatter: DocMeta;
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
