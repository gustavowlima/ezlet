import { IconAccessible, IconBolt, IconHexagon, IconPalette } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Toaster, toast } from "ezlet";

// ── Mini demo toasts ──────────────────────────────────────────────────────────

function fireDemo() {
  toast.promise(new Promise((resolve) => setTimeout(() => resolve("backup.db"), 1800)), {
    messages: {
      loading: "Saving database state",
      success: (f) => `Saved ${f}`,
      error: "Failed to save",
    },
    success: { description: "Ready for download." },
  });
}

// ── Copy-to-clipboard snippet ─────────────────────────────────────────────────

const INSTALL = "bun add ezlet";

// ── Feature list ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: IconHexagon,
    title: "Inspired by Dynamic Island",
    desc: "Compact pill that expands to a card on hover — same organic motion you know from iOS.",
  },
  {
    icon: IconBolt,
    title: "Zero config",
    desc: "Drop in <Toaster /> and call toast(). Styles included.",
  },
  {
    icon: IconPalette,
    title: "Fully themeable",
    desc: "CSS variables for every colour, radius, and shadow.",
  },
  {
    icon: IconAccessible,
    title: "Accessible",
    desc: "ARIA live regions, keyboard dismiss, and reduced-motion support.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function Home() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)]">
      {/* Live toaster for the demo button */}
      <Toaster position="bottom-center" />

      {/* ── Hero ── */}
      <section className="mx-auto flex max-w-[680px] flex-col items-center px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16">
        <h1 className="mb-4 text-[34px] font-bold leading-[1.08] tracking-tight text-[var(--color-foreground)] sm:text-[40px] sm:leading-[1.12]">
          Toast that morphs
          <br />
          <span className="opacity-40">like a Dynamic Island</span>
        </h1>

        <p className="mb-8 max-w-[44ch] text-[14px] leading-[1.6] text-[var(--color-muted-foreground)] sm:text-[15px]">
          Ezlet is a headless-friendly React toast library. Compact pill by default, expands to a card on
          hover — smooth spring animations included.
        </p>

        {/* CTAs */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            to="/docs"
            viewTransition
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-foreground)] px-4 text-[13.5px] font-semibold text-[var(--color-primary-foreground)] transition-opacity hover:opacity-80 sm:w-auto"
          >
            Get started
          </Link>
          <button
            type="button"
            onClick={fireDemo}
            className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-transparent px-4 text-[13.5px] font-medium text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-foreground)]/20 hover:text-[var(--color-foreground)] sm:w-auto"
          >
            See it live
          </button>
        </div>

        {/* Install command */}
        <div className="mt-10 flex w-full max-w-full items-center gap-2 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2.5 sm:w-auto sm:max-w-fit">
          <span className="select-none text-[12px] text-[var(--color-muted-foreground)]/50">$</span>
          <code className="min-w-0 whitespace-nowrap text-[12.5px] font-mono text-[var(--color-muted-foreground)]">
            {INSTALL}
          </code>
          <button
            type="button"
            aria-label="Copy install command"
            onClick={() => {
              navigator.clipboard.writeText(INSTALL);
              toast.success("Copied!", { duration: 1500 });
            }}
            className="ml-1 cursor-pointer rounded p-0.5 text-[var(--color-muted-foreground)]/40 transition-colors hover:text-[var(--color-muted-foreground)]"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-[680px] border-t border-[var(--color-border)] px-4 sm:px-6" />

      {/* ── Features ── */}
      <section className="mx-auto grid max-w-[680px] grid-cols-1 gap-px px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-16">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col gap-2 rounded-xl p-4 sm:p-5">
            <Icon aria-hidden="true" size={22} stroke={1.8} className="text-[var(--color-foreground)]" />
            <p className="text-[13.5px] font-semibold text-[var(--color-foreground)]">{title}</p>
            <p className="text-[13px] leading-[1.55] text-[var(--color-muted-foreground)]">{desc}</p>
          </div>
        ))}
      </section>

      {/* ── Footer CTA ── */}
      <div className="mx-auto max-w-[680px] border-t border-[var(--color-border)] px-4 sm:px-6" />
      <section className="mx-auto flex max-w-[680px] flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[13px] text-[var(--color-muted-foreground)]">Open source — MIT licence</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/gustavowlima/ezlet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            GitHub
          </a>
          <Link
            to="/docs"
            viewTransition
            className="text-[13px] text-[var(--color-muted-foreground)] transition-colors hover:text-[var(--color-foreground)]"
          >
            Docs →
          </Link>
        </div>
      </section>
    </div>
  );
}
