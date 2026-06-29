import type { ReactNode } from "react";

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded border border-[var(--color-site-border)] bg-[var(--color-card)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--color-foreground)]/85">
      {children}
    </code>
  );
}
