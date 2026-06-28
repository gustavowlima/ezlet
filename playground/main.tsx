import { useEffect, useState } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { IslandToaster, type ToastPosition, type ToastTheme, toast } from "../src";
import "./playground.css";

declare global {
  interface Window {
    __islandToastRoot?: Root;
  }
}

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
    >
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.867 8.17 6.839 9.49.5.092.682-.217.682-.48 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="14"
      height="14"
    >
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────

const positions: { value: ToastPosition; label: string }[] = [
  { value: "top-left", label: "Top Left" },
  { value: "top-center", label: "Top Center" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right", label: "Bottom Right" },
];

const themes: { value: ToastTheme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon /> },
  { value: "dark", label: "Dark", icon: <MoonIcon /> },
  { value: "system", label: "System", icon: <SystemIcon /> },
];

// ─── Main Component ─────────────────────────────────────────────────────────

function App() {
  const [position, setPosition] = useState<ToastPosition>("top-center");
  const [theme, setTheme] = useState<ToastTheme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("island-toast-theme");
      return (saved as ToastTheme) || "system";
    }
    return "system";
  });
  const [expanded, setExpanded] = useState(false);
  const [visibleToasts, setVisibleToasts] = useState(4);
  const [gap, setGap] = useState(14);
  const [offset, setOffset] = useState(16);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  // Synchronize document theme with the theme state
  useEffect(() => {
    localStorage.setItem("island-toast-theme", theme);
    const root = document.documentElement;

    const applyTheme = (t: ToastTheme) => {
      let resolved: "light" | "dark" = "dark";
      if (t === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        resolved = isDark ? "dark" : "light";
      } else {
        resolved = t;
      }

      root.classList.remove("dark", "light");
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };

    applyTheme(theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme("system");
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  // Demo Promise execution
  function promiseDemo() {
    const job = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.25) {
          resolve("backup_v4.tar.gz");
        } else {
          reject(new Error("Network congestion"));
        }
      }, 2000);
    });

    void toast.promise(job, {
      messages: {
        loading: "Saving database state",
        success: (file: string) => `Saved ${file}`,
        error: (err: unknown) => `Failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      success: {
        description: "Ready for download.",
      },
      error: {
        duration: 5000,
      },
    });
  }

  // Stress test stacking and morph animations
  function burst() {
    setTimeout(() => {
      toast.info("Flight mode armed", {
        description: "Stacking shows the newest toast in front.",
        duration: 15_000,
      });
    }, 0);
    setTimeout(() => {
      toast.success("Backup complete", {
        description: "The island should morph without freezing content.",
        duration: 15_000,
      });
    }, 120);
    setTimeout(() => {
      toast.error("Payment failed", {
        description: "Errors use assertive live regions.",
        duration: 15_000,
      });
    }, 240);
  }

  // Toast actions configuration
  const actions = [
    {
      label: "Default",
      color: "bg-neutral-400 dark:bg-neutral-500",
      description: "Quick status note",
      onClick: () => toast("Welcome back!", { description: "You have 3 new notifications." }),
    },
    {
      label: "Success",
      color: "bg-brand-success",
      description: "Everything is synced",
      onClick: () => toast.success("Changes saved", { description: "Your workspace is up to date." }),
    },
    {
      label: "Error",
      color: "bg-brand-error",
      description: "Assertive alert toast",
      onClick: () => toast.error("Connection lost", { description: "Retrying in 5 seconds." }),
    },
    {
      label: "Info",
      color: "bg-brand-info",
      description: "Informative status",
      onClick: () => toast.info("Device connected", { description: "Successfully paired with Studio Pro." }),
    },
    {
      label: "Loading",
      color: "bg-purple-500 animate-pulse",
      description: "Infinite loader element",
      onClick: () => toast.loading("Syncing configuration"),
    },
    {
      label: "Action",
      color: "bg-indigo-500",
      description: "Toast with actionable CTA",
      onClick: () =>
        toast.success("File deleted", {
          description: "Moved to trash.",
          action: {
            label: "Undo",
            onClick: (id) => {
              toast.success("Restored!", { id });
            },
          },
        }),
    },
    {
      label: "Promise",
      color: "bg-amber-500",
      description: "Async state transition",
      onClick: promiseDemo,
    },
    {
      label: "Custom",
      color: "bg-pink-500",
      description: "Fully custom render tree",
      onClick: () =>
        toast.custom((item) => (
          <div className="flex flex-col gap-0.5 min-w-0">
            <strong className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-white">
              Custom Render
            </strong>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              Through toast.custom() #{item.id}
            </span>
          </div>
        )),
    },
    {
      label: "Burst",
      color: "bg-gradient-to-tr from-green-400 via-blue-500 to-rose-400",
      description: "Stack stress-test burst",
      onClick: burst,
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto px-6">
      {/* ─── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between py-6 border-b border-neutral-100 dark:border-neutral-900">
        <a className="flex items-center gap-2 hover:opacity-85 transition-opacity" href="/">
          <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-neutral-950 to-neutral-700 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            island-toast
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-success"></span>
          </span>
        </a>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <GithubIcon />
            <span>GitHub</span>
            <ExternalLinkIcon className="opacity-60" />
          </a>

          {/* Segmented Theme Selector */}
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-full border border-neutral-200/40 dark:border-neutral-800">
            {themes.map((t) => {
              const isActive = theme === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-neutral-900 dark:text-neutral-100 shadow-sm border border-neutral-200/10 dark:border-neutral-700/30"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                  }`}
                  aria-label={`Set theme to ${t.label}`}
                >
                  {t.icon}
                  <span className="hidden md:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 text-center">
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tighter text-neutral-900 dark:text-white mb-4">
          Playground<span className="text-blue-500">.</span>
        </h1>
        <p className="max-w-md text-sm sm:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
          Pick a position and click any interaction card below to fire dynamic toasts live.
        </p>
      </main>

      {/* ─── Config Dashboard Card ───────────────────────────────────────── */}
      <section className="w-full max-w-2xl mx-auto bg-white/60 dark:bg-zinc-900/40 border border-neutral-200/50 dark:border-neutral-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-200/30 dark:shadow-none mb-12">
        {/* Step 1: Position Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold font-display tracking-tight text-neutral-900 dark:text-white mb-2 text-center">
            Toaster Settings
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-6 text-center">
            Representing the layout of your screen viewport
          </p>

          <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
            {positions.map((pos) => {
              const isActive = position === pos.value;
              return (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => setPosition(pos.value)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.96] ${
                    isActive
                      ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900 shadow-md"
                      : "bg-neutral-50/50 dark:bg-zinc-800/20 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-zinc-800/40"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-blue-500 animate-pulse" : "bg-neutral-300 dark:bg-neutral-700"}`}
                  ></span>
                  <span>{pos.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="w-full border-t border-dashed border-neutral-200 dark:border-neutral-800 my-6"></div>

        {/* Step 2: Sliders & Switch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/40 dark:bg-zinc-800/10 border border-neutral-200/30 dark:border-neutral-800/50">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Expanded Stack</span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                Show stacked toasts in full view
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className={`w-11 h-6 rounded-full relative p-0.5 cursor-pointer transition-colors duration-300 ${
                expanded ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-700"
              }`}
              aria-label="Toggle expanded stack"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                  expanded ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-50/40 dark:bg-zinc-800/10 border border-neutral-200/30 dark:border-neutral-800/50">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-800 dark:text-neutral-200">Visible Toasts</span>
              <span className="text-blue-500 font-mono">{visibleToasts} toasts</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={visibleToasts}
              onChange={(e) => setVisibleToasts(Number(e.target.value))}
              className="w-full accent-blue-500 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-50/40 dark:bg-zinc-800/10 border border-neutral-200/30 dark:border-neutral-800/50">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-800 dark:text-neutral-200">Stacking Gap</span>
              <span className="text-blue-500 font-mono">{gap}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={24}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-blue-500 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-50/40 dark:bg-zinc-800/10 border border-neutral-200/30 dark:border-neutral-800/50">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-800 dark:text-neutral-200">Viewport Offset</span>
              <span className="text-blue-500 font-mono">{offset}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={48}
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
              className="w-full accent-blue-500 bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Separator */}
        <div className="w-full border-t border-dashed border-neutral-200 dark:border-neutral-800 my-6"></div>

        {/* Step 3: Interactive Trigger Cards */}
        <div>
          <h3 className="text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-200 mb-4 text-center">
            Toast Triggers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {actions.map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={act.onClick}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-neutral-200/40 dark:border-neutral-800 bg-white/40 dark:bg-zinc-900/30 hover:bg-neutral-50/70 dark:hover:bg-zinc-800/40 active:scale-[0.97] text-left cursor-pointer transition-all duration-150"
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${act.color}`}></span>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-neutral-900 dark:text-white leading-none mb-0.5">
                    {act.label}
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate leading-none">
                    {act.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="py-6 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-900 text-xs text-neutral-400 dark:text-neutral-500">
        <span>island-toast — MIT License</span>
        <a
          href="/docs"
          className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors flex items-center gap-0.5"
        >
          <span>Documentation</span>
          <ExternalLinkIcon className="scale-75 opacity-60" />
        </a>
      </footer>

      {/* Toaster Component Portal */}
      <IslandToaster
        expand={expanded}
        position={position}
        theme={theme}
        visibleToasts={visibleToasts}
        gap={gap}
        offset={offset}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

window.__islandToastRoot ??= createRoot(rootElement);
window.__islandToastRoot.render(<App />);
