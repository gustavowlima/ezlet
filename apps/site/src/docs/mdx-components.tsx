import type { MDXComponents } from "mdx/types";
import { InlineCode } from "@/components/docs/inline-code";
import { PreviewBtn } from "@/components/docs/preview-btn";
import { TabPanel } from "@/components/docs/tab-panel";
import { cn } from "@/lib/utils";

// Custom components available in every MDX file without importing.
// HTML element overrides apply automatically to markdown output.
// Named exports (TabPanel, PreviewBtn) can be used as JSX in MDX.
export const mdxComponents: MDXComponents = {
  // ── HTML elements ──────────────────────────────────────────────────────────

  h2: ({ children, id }) => (
    <h2
      id={id}
      className="scroll-mt-20 mb-1.5 text-[18px] font-semibold tracking-tight text-[var(--color-foreground)] sm:text-[19px]"
    >
      {children}
    </h2>
  ),

  h3: ({ children, id }) => (
    <h3
      id={id}
      className="scroll-mt-20 mb-1 text-[15px] font-semibold tracking-tight text-[var(--color-foreground)] sm:text-[16px]"
    >
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="text-[14px] leading-[1.65] text-[var(--color-muted-foreground)]">{children}</p>
  ),

  // Block code — preserve the Shiki class (e.g. "shiki github-dark-dimmed") so that
  // the CSS rule `.shiki span { color: var(--shiki-dark) }` can match the token spans.
  // We intentionally don't spread ...rest to avoid Shiki's inline background-color.
  pre: ({ children, className }) => (
    <div className="overflow-hidden rounded-xl border border-[var(--color-site-border)] bg-[var(--color-card)]">
      <pre
        className={cn(
          "overflow-x-auto px-4 py-2.5 text-[13px] leading-[1.2]",
          "[&_.line]:block [&_.line]:min-h-[1em]",
          className,
        )}
      >
        {children}
      </pre>
    </div>
  ),

  // After Shiki transforms a fenced code block, the inner <code> element has no
  // language-* class — its children are React span elements, not a plain string.
  // Only apply InlineCode styling for true inline code (string children).
  code: ({ className, children, ...rest }) => {
    if (className?.startsWith("language-") || typeof children !== "string") {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    return <InlineCode>{children}</InlineCode>;
  },

  ul: ({ children }) => (
    <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-7 text-[var(--color-muted-foreground)]">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="list-decimal space-y-1.5 pl-5 text-[14px] leading-7 text-[var(--color-muted-foreground)]">
      {children}
    </ol>
  ),

  li: ({ children }) => <li>{children}</li>,

  hr: () => <hr className="border-[var(--color-site-border)]" />,

  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[var(--color-foreground)] underline underline-offset-2 opacity-70 transition-opacity hover:opacity-100"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Tables — used for prop references in markdown.
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-site-border)] text-[12.5px] sm:text-[13px]">
      <table className="min-w-full">{children}</table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="border-b border-[var(--color-site-border)] bg-[var(--color-foreground)]/[0.02]">
      {children}
    </thead>
  ),

  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-medium text-[var(--color-muted-foreground)]">{children}</th>
  ),

  tbody: ({ children }) => <tbody>{children}</tbody>,

  tr: ({ children }) => (
    <tr className="border-b border-[var(--color-site-border)]/60 last:border-0">{children}</tr>
  ),

  td: ({ children }) => <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{children}</td>,

  // ── Custom components (no import needed in MDX files) ──────────────────────

  TabPanel,
  PreviewBtn,
};

// Re-export for use in MDXProvider
export { mdxComponents as components };
