import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

// Wrapper around Shiki-highlighted <pre> blocks.
// Shiki injects --shiki-dark / --shiki-light CSS vars on each <span>.
// We strip Shiki's inline background and apply our own via CSS vars.
export function CodeBlock({
  children,
  className,
}: ComponentPropsWithoutRef<"pre">) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-site-border)] bg-[var(--color-card)]">
      <pre
        className={cn(
          "overflow-x-auto px-4 py-2.5 text-[13px] leading-[1.25]",
          "[&_.line]:block [&_.line]:min-h-[1em]",
          className,
        )}
      >
        {children}
      </pre>
    </div>
  );
}
