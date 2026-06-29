import {
  Toaster,
  type ToasterTransition,
  type ToastPosition,
  type ToastT,
  type ToastTheme,
  toast,
} from "ezlet";
import { AnimatePresence, motion } from "motion/react";
import { type CSSProperties, type ReactNode, useMemo, useState } from "react";
import { ShikiCodeBlock } from "@/components/docs/shiki-code-block";
import { Button, type ButtonState, StatefulButton } from "@/components/motion/button";
import { RangeSlider } from "@/components/motion/range-slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import "./styles.css";

// ── Icons ────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="12"
      height="12"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="13"
      height="13"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

// ── Spring presets ────────────────────────────────────────────────────────────

const softnessPresets: Record<string, ToasterTransition> = {
  liquid: {
    morph: { type: "spring", bounce: 0.08, duration: 0.75 },
    stack: { type: "spring", bounce: 0.06, duration: 0.68 },
    expand: { type: "spring", bounce: 0.08, duration: 0.72 },
    icon: { type: "spring", bounce: 0.2, duration: 0.55 },
  },
  standard: {
    morph: { type: "spring", bounce: 0.15, duration: 0.65 },
    stack: { type: "spring", bounce: 0.12, duration: 0.58 },
    expand: { type: "spring", bounce: 0.16, duration: 0.62 },
    icon: { type: "spring", bounce: 0.35, duration: 0.5 },
  },
  bouncy: {
    morph: { type: "spring", bounce: 0.38, duration: 0.55 },
    stack: { type: "spring", bounce: 0.28, duration: 0.5 },
    expand: { type: "spring", bounce: 0.35, duration: 0.52 },
    icon: { type: "spring", bounce: 0.55, duration: 0.45 },
  },
  snappy: {
    morph: { type: "spring", bounce: 0.02, duration: 0.35 },
    stack: { type: "spring", bounce: 0.0, duration: 0.3 },
    expand: { type: "spring", bounce: 0.02, duration: 0.32 },
    icon: { type: "spring", bounce: 0.15, duration: 0.3 },
  },
};

type PlaygroundAction = {
  id: string;
  label: string;
  description: string;
  dot: string;
  code: string;
  fn: () => void;
};

// ── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const [position, setPosition] = useState<ToastPosition>("top-center");
  const [theme, setTheme] = useState<ToastTheme>("dark");
  const [expanded, setExpanded] = useState(false);
  const [visibleToasts, setVisibleToasts] = useState(4);
  const [gap, setGap] = useState(14);
  const [offset, setOffset] = useState(16);
  const [softness, setSoftness] = useState<keyof typeof softnessPresets>("standard");
  const [promiseState, setPromiseState] = useState<ButtonState>("idle");
  const [selectedActionId, setSelectedActionId] = useState("success");
  const [codeTab, setCodeTab] = useState("action");

  // ── demos ──────────────────────────────────────────────────────────────────

  function promiseDemo() {
    setPromiseState("loading");
    const p = new Promise<string>((resolve, reject) =>
      setTimeout(
        () => (Math.random() > 0.25 ? resolve("backup_v4.tar.gz") : reject(new Error("Network congestion"))),
        2000,
      ),
    );
    p.then(
      () => {
        setPromiseState("success");
        setTimeout(() => setPromiseState("idle"), 2000);
      },
      () => {
        setPromiseState("error");
        setTimeout(() => setPromiseState("idle"), 2500);
      },
    );
    void toast.promise(p, {
      messages: {
        loading: "Saving database state",
        success: (f: string) => `Saved ${f}`,
        error: (e: unknown) => `Failed: ${e instanceof Error ? e.message : String(e)}`,
      },
      success: { description: "Ready for download." },
      error: { duration: 5000 },
    });
  }

  function uploadDemo() {
    const id = toast.loading("Preparing upload…", { description: "Verifying document.pdf…" });
    let p = 0;
    const iv = setInterval(() => {
      p += 15;
      if (p >= 100) {
        clearInterval(iv);
        toast.update(id, {
          title: "Upload complete!",
          description: "document.pdf saved.",
          variant: "success",
          duration: 4000,
        });
      } else {
        toast.update(id, {
          title: "Uploading document.pdf",
          description: <ProgressBar value={p} speed="12.4 MB/s" color="bg-blue-500" />,
        });
      }
    }, 400);
  }

  function downloadDemo() {
    const id = toast.loading("Requesting server…", { description: "Connecting for database.sql…" });
    let p = 0;
    const iv = setInterval(() => {
      p += 10;
      if (p >= 100) {
        clearInterval(iv);
        toast.update(id, {
          title: "Download complete!",
          description: "database.sql is ready.",
          variant: "success",
          duration: 5000,
          action: {
            label: "Open File",
            onClick: () => {
              toast.dismiss(id);
              toast.success("File opened.");
            },
          },
        });
      } else {
        toast.update(id, {
          title: "Downloading database.sql",
          description: <ProgressBar value={p} speed="4.8 MB/s" color="bg-indigo-500" />,
        });
      }
    }, 300);
  }

  function burst() {
    setTimeout(
      () =>
        toast.info("Flight mode armed", { description: "Stacking shows newest in front.", duration: 15_000 }),
      0,
    );
    setTimeout(
      () =>
        toast.success("Backup complete", { description: "Ezlet morphs without freezing.", duration: 15_000 }),
      120,
    );
    setTimeout(
      () =>
        toast.error("Payment failed", {
          description: "Errors use assertive live regions.",
          duration: 15_000,
        }),
      240,
    );
  }

  function customDemo() {
    toast.custom((item: ToastT & { expanded?: boolean }) => {
      const isExpanded = !!item.expanded;
      const h = isExpanded ? 180 : 64;
      const w = isExpanded ? 380 : 280;

      // Expanding:  compact fades out (0–150ms) → container grows (delay 160ms) → expanded fades in (delay 220ms)
      // Collapsing: expanded fades out (0–150ms) → container shrinks (delay 160ms) → compact fades in (delay 260ms)
      const ease = "cubic-bezier(0.32,0.72,0,1)";

      const compactStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        opacity: isExpanded ? 0 : 1,
        filter: isExpanded ? "blur(5px)" : "blur(0px)",
        transform: isExpanded ? "scale(0.94)" : "scale(1)",
        // fade OUT fast when expanding; fade IN late when collapsing
        transition: isExpanded
          ? "opacity 150ms ease, filter 150ms ease, transform 150ms ease"
          : `opacity 250ms ease 260ms, filter 250ms ease 260ms, transform 250ms ${ease} 260ms`,
        pointerEvents: isExpanded ? "none" : "auto",
      };

      const expandedStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px",
        opacity: isExpanded ? 1 : 0,
        filter: isExpanded ? "blur(0px)" : "blur(5px)",
        transform: isExpanded ? "scale(1)" : "scale(0.94)",
        // fade IN late when expanding; fade OUT fast when collapsing
        transition: isExpanded
          ? `opacity 250ms ease 220ms, filter 250ms ease 220ms, transform 250ms ${ease} 220ms`
          : "opacity 150ms ease, filter 150ms ease, transform 150ms ease",
        pointerEvents: isExpanded ? "auto" : "none",
      };

      return (
        <div
          className="relative select-none overflow-hidden"
          style={{
            width: `${w}px`,
            height: `${h}px`,
            // resize starts AFTER outgoing content has faded (160ms delay both ways)
            transition: `width 380ms ${ease} 160ms, height 380ms ${ease} 160ms`,
          }}
        >
          {/* 1. COMPACT */}
          <div style={compactStyle}>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 shrink-0">
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Foco ATIVO</span>
                <span className="text-[10px] text-neutral-400">Pomodoro: 14:25 restantes</span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-neutral-800 px-2 py-1 rounded-md text-amber-400 font-bold border border-neutral-700/30 ml-3 shrink-0">14:25</span>
          </div>

          {/* 2. EXPANDED */}
          <div style={expandedStyle}>
            {/* Topo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                  <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Sessão de Estudos</span>
                  <span className="text-[10px] text-neutral-400">Objetivo: Desenvolvimento Web</span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono shrink-0 ml-2">Bloco 2/4</span>
            </div>

            {/* Timer + barra */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-3xl font-light tracking-tight text-white font-mono">14:25</span>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden border border-white/5">
                <div className="w-7/12 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => toast.dismiss(item.id)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 h-10 rounded-xl bg-neutral-800 border border-neutral-700/40 text-xs font-medium text-neutral-300 transition-colors hover:bg-red-950/40 hover:text-red-400 active:scale-95"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                </svg>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => toast.success("Sessão pausada!", { duration: 2000 })}
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-neutral-950 transition-colors active:scale-95 shadow-lg shadow-amber-500/10"
              >
                <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75H16.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
                Pausar
              </button>
            </div>
          </div>
        </div>
      );
    });
  }






  const toastActions: PlaygroundAction[] = [
    {
      id: "default",
      label: "Default",
      description: "Simple message with supporting text.",
      dot: "#9ca3af",
      fn: () => toast("Welcome back!", { description: "You have 3 new notifications." }),
      code: `toast("Welcome back!", {
  description: "You have 3 new notifications.",
});`,
    },
    {
      id: "success",
      label: "Success",
      description: "Positive feedback after a completed action.",
      dot: "#34d399",
      fn: () => toast.success("Changes saved", { description: "Your workspace is up to date." }),
      code: `toast.success("Changes saved", {
  description: "Your workspace is up to date.",
});`,
    },
    {
      id: "error",
      label: "Error",
      description: "Assertive feedback for failed flows.",
      dot: "#fb7185",
      fn: () => toast.error("Connection lost", { description: "Retrying in 5 seconds." }),
      code: `toast.error("Connection lost", {
  description: "Retrying in 5 seconds.",
});`,
    },
    {
      id: "info",
      label: "Info",
      description: "Neutral status update.",
      dot: "#60a5fa",
      fn: () => toast.info("Device connected", { description: "Paired with Studio Pro." }),
      code: `toast.info("Device connected", {
  description: "Paired with Studio Pro.",
});`,
    },
    {
      id: "loading",
      label: "Loading",
      description: "Indefinite loading state.",
      dot: "#a78bfa",
      fn: () => toast.loading("Syncing…"),
      code: `toast.loading("Syncing…");`,
    },
    {
      id: "promise",
      label: "Promise",
      description: "Loading, success, and error from one async task.",
      dot: "#8b5cf6",
      fn: promiseDemo,
      code: `toast.promise(saveBackup(), {
  messages: {
    loading: "Saving database state",
    success: (file) => \`Saved \${file}\`,
    error: (error) => \`Failed: \${error.message}\`,
  },
  success: {
    description: "Ready for download.",
  },
  error: {
    duration: 5000,
  },
});`,
    },
    {
      id: "upload",
      label: "Upload",
      description: "Update an existing toast as progress changes.",
      dot: "#3b82f6",
      fn: uploadDemo,
      code: `const id = toast.loading("Preparing upload…", {
  description: "Verifying document.pdf…",
});

toast.update(id, {
  title: "Uploading document.pdf",
  description: <ProgressBar value={45} speed="12.4 MB/s" />,
});

toast.update(id, {
  title: "Upload complete!",
  description: "document.pdf saved.",
  variant: "success",
});`,
    },
    {
      id: "download",
      label: "Download",
      description: "Progress toast with an action after completion.",
      dot: "#6366f1",
      fn: downloadDemo,
      code: `const id = toast.loading("Requesting server…", {
  description: "Connecting for database.sql…",
});

toast.update(id, {
  title: "Download complete!",
  description: "database.sql is ready.",
  variant: "success",
  action: {
    label: "Open File",
    onClick: () => toast.dismiss(id),
  },
});`,
    },
    {
      id: "custom",
      label: "Custom",
      description: "Render a fully custom toast body.",
      dot: "#f59e0b",
      fn: customDemo,
      code: `toast.custom((item) => {
  const expanded = !!item.expanded;
  return (
    <div className={\`relative overflow-hidden \${expanded ? "w-[380px]" : "w-[280px]"}\`}>
      {/* Compact */}
      <div style={{ position: expanded ? "absolute" : "relative" }}
           className={\`flex items-center gap-3 p-3 \${expanded ? "opacity-0" : ""}\`}>
        <div className="size-10 rounded-full bg-amber-500/10 text-amber-500 ...">
          <ClockIcon />
        </div>
        <div>
          <p className="text-xs font-semibold">Foco ATIVO</p>
          <p className="text-[10px] text-neutral-400">Pomodoro: 14:25 restantes</p>
        </div>
        <span className="ml-auto font-mono text-[10px] text-amber-400">14:25</span>
      </div>

      {/* Expanded */}
      <div style={{ position: expanded ? "relative" : "absolute" }}
           className={\`flex flex-col gap-3 p-3 \${expanded ? "opacity-100" : "opacity-0"}\`}>
        {/* header, timer display, progress bar */}
        <span className="text-3xl font-mono text-white">14:25</span>
        <div className="h-1.5 bg-neutral-800 rounded-full">
          <div className="w-7/12 h-full bg-gradient-to-r from-amber-500 to-orange-500" />
        </div>
        {/* actions */}
        <button onClick={() => toast.dismiss(item.id)}>Cancelar</button>
        <button onClick={() => toast.success("Pausado!")}>Pausar</button>
      </div>
    </div>
  );
});`,
    },

    {
      id: "burst",
      label: "Burst ×3",
      description: "Fire multiple toasts to inspect stacking.",
      dot: "conic-gradient(#34d399,#60a5fa,#fb7185,#34d399)",
      fn: burst,
      code: `toast.info("Flight mode armed", {
  description: "Stacking shows newest in front.",
  duration: 15000,
});

toast.success("Backup complete", {
  description: "Ezlet morphs without freezing.",
  duration: 15000,
});

toast.error("Payment failed", {
  description: "Errors use assertive live regions.",
  duration: 15000,
});`,
    },
  ];
  const selectedAction = toastActions.find((action) => action.id === selectedActionId) ?? toastActions[0];
  const toasterElementCode = useMemo(
    () => buildToasterElementCode({ position, theme, visibleToasts, gap, offset, expanded, softness }),
    [position, theme, visibleToasts, gap, offset, expanded, softness],
  );
  const toasterCode = useMemo(
    () => buildToasterCode(toasterElementCode, softness),
    [toasterElementCode, softness],
  );
  const fullCode = useMemo(
    () => buildFullExampleCode(toasterElementCode, selectedAction.code, softness),
    [toasterElementCode, selectedAction.code, softness],
  );

  const positions: ToastPosition[] = [
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];
  const posLabel: Record<ToastPosition, string> = {
    "top-left": "↖ top left",
    "top-center": "↑ top center",
    "top-right": "↗ top right",
    "bottom-left": "↙ bottom left",
    "bottom-center": "↓ bottom center",
    "bottom-right": "↘ bottom right",
  };

  return (
    <>
      <div className="min-h-[calc(100dvh-3.5rem)] px-6 py-12">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8">
          <header className="flex max-w-[680px] flex-col gap-2">
            <h1 className="text-[clamp(36px,8vw,52px)] font-bold tracking-[-0.03em] leading-none text-[var(--color-foreground)]">
              Playground.
            </h1>
            <p className="text-[15px] text-[var(--color-muted-foreground)] leading-relaxed">
              Dynamic Island-style toasts. Morphing pill, spring physics, Sonner stacking.
            </p>
          </header>

          <Divider />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,560px)_minmax(420px,1fr)] lg:items-start">
            <div className="flex min-w-0 flex-col gap-8">
              <section className="flex flex-col gap-3">
                <Label>Toast type</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {toastActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.id === selectedActionId ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => {
                        setSelectedActionId(action.id);
                        setCodeTab("action");
                        action.fn();
                      }}
                      className="justify-start"
                    >
                      <span className="size-[7px] shrink-0 rounded-full" style={{ background: action.dot }} />
                      {action.label}
                    </Button>
                  ))}
                </div>
                <p className="min-h-5 text-[12px] text-[var(--color-muted-foreground)]">
                  {selectedAction.description}
                </p>
              </section>

              <section className="flex flex-col gap-3">
                <Label>Promise demo</Label>
                <div className="flex gap-2">
                  <StatefulButton
                    variant={selectedActionId === "promise" ? "primary" : "secondary"}
                    size="sm"
                    state={promiseState}
                    loadingText="Running…"
                    successText="Success!"
                    errorText="Failed — retry"
                    onClick={() => {
                      setSelectedActionId("promise");
                      setCodeTab("action");
                      promiseDemo();
                    }}
                  >
                    Run promise
                  </StatefulButton>
                </div>
              </section>

              <Divider />

              <section className="flex flex-col gap-3">
                <Label>Position</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {positions.map((pos) => (
                    <Button
                      key={pos}
                      variant={pos === position ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setPosition(pos)}
                      className="text-[12px]"
                    >
                      {posLabel[pos]}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <Label>Options</Label>
                <div className="flex flex-wrap gap-2">
                  {(["dark", "light", "system"] as ToastTheme[]).map((t) => (
                    <Button
                      key={t}
                      variant={theme === t ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setTheme(t)}
                    >
                      {t}
                    </Button>
                  ))}
                  <Button
                    variant={expanded ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    expanded
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast.dismiss()}>
                    dismiss all
                  </Button>
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <Label>Animation feel</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(softnessPresets) as Array<keyof typeof softnessPresets>).map((key) => (
                    <Button
                      key={key}
                      variant={softness === key ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setSoftness(key)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </section>

              <section className="flex flex-col gap-3">
                <Label>Fine-tune</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <SliderCard
                    label="Visible toasts"
                    value={visibleToasts}
                    min={1}
                    max={10}
                    unit=""
                    onChange={setVisibleToasts}
                  />
                  <SliderCard label="Stack gap" value={gap} min={0} max={24} unit="px" onChange={setGap} />
                  <SliderCard label="Offset" value={offset} min={8} max={48} unit="px" onChange={setOffset} />
                </div>
              </section>
            </div>

            <PlaygroundCodePanel
              activeTab={codeTab}
              actionLabel={selectedAction.label}
              actionCode={selectedAction.code}
              toasterCode={toasterCode}
              fullCode={fullCode}
              onTabChange={setCodeTab}
            />
          </div>

          <Divider />

          <footer className="flex items-center justify-between">
            <span className="text-[12px] text-[var(--color-muted-foreground)]/40">MIT License</span>
          </footer>
        </div>
      </div>

      <Toaster
        expand={expanded}
        position={position}
        theme={theme}
        visibleToasts={visibleToasts}
        gap={gap}
        offset={offset}
        transition={softnessPresets[softness]}
      />
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function PlaygroundCodePanel({
  activeTab,
  actionLabel,
  actionCode,
  toasterCode,
  fullCode,
  onTabChange,
}: {
  activeTab: string;
  actionLabel: string;
  actionCode: string;
  toasterCode: string;
  fullCode: string;
  onTabChange: (value: string) => void;
}) {
  const codeByTab: Record<string, string> = {
    action: actionCode,
    toaster: toasterCode,
    full: fullCode,
  };
  const activeCode = codeByTab[activeTab] ?? actionCode;

  async function copyActiveCode() {
    await navigator.clipboard.writeText(activeCode);
    toast.success("Copied code", { description: `${labelByTab(activeTab, actionLabel)} copied.` });
  }

  return (
    <aside className="min-w-0 lg:sticky lg:top-20">
      <div className="overflow-hidden rounded-xl border border-[var(--color-site-border)] bg-[var(--color-card)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-site-border)] px-4">
          <Tabs value={activeTab} onValueChange={onTabChange} variant="underline">
            <TabsList className="border-b-0">
              <TabsTrigger value="action" className="text-[13px]">
                Action
              </TabsTrigger>
              <TabsTrigger value="toaster" className="text-[13px]">
                Toaster
              </TabsTrigger>
              <TabsTrigger value="full" className="text-[13px]">
                Full
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="ghost" size="sm" onClick={copyActiveCode} className="shrink-0">
            <CopyIcon />
            Copy
          </Button>
        </div>

        <div className="border-b border-[var(--color-site-border)] px-4 py-3">
          <p className="text-[12px] text-[var(--color-muted-foreground)]">
            {labelByTab(activeTab, actionLabel)}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsContent value="action" className="max-h-[520px] overflow-auto">
            <ShikiCodeBlock code={actionCode} />
          </TabsContent>
          <TabsContent value="toaster" className="max-h-[520px] overflow-auto">
            <ShikiCodeBlock code={toasterCode} />
          </TabsContent>
          <TabsContent value="full" className="max-h-[520px] overflow-auto">
            <ShikiCodeBlock code={fullCode} />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}

function labelByTab(tab: string, actionLabel: string) {
  if (tab === "toaster") return "Current Toaster configuration";
  if (tab === "full") return "Complete example";
  return `${actionLabel} toast action`;
}

function buildToasterElementCode({
  position,
  theme,
  visibleToasts,
  gap,
  offset,
  expanded,
  softness,
}: {
  position: ToastPosition;
  theme: ToastTheme;
  visibleToasts: number;
  gap: number;
  offset: number;
  expanded: boolean;
  softness: keyof typeof softnessPresets;
}) {
  const transitionLine = softness === "standard" ? "" : "\n  transition={transition}";

  return `<Toaster
  position="${position}"
  theme="${theme}"
  visibleToasts={${visibleToasts}}
  gap={${gap}}
  offset={${offset}}
  expand={${expanded}}${transitionLine}
/>`;
}

function buildToasterCode(toasterElementCode: string, softness: keyof typeof softnessPresets) {
  if (softness === "standard") {
    return toasterElementCode;
  }

  return `const transition = ${formatTransition(softnessPresets[softness])};

${toasterElementCode}`;
}

function buildFullExampleCode(
  toasterCode: string,
  actionCode: string,
  softness: keyof typeof softnessPresets,
) {
  const transitionCode =
    softness === "standard" ? "" : `\nconst transition = ${formatTransition(softnessPresets[softness])};\n`;

  return `import { Toaster, toast } from "ezlet";${transitionCode}
export default function App() {
  function runToast() {
${indent(actionCode, 4)}
  }

  return (
    <>
${indent(toasterCode, 6)}
      <button type="button" onClick={runToast}>
        Show toast
      </button>
    </>
  );
}`;
}

function formatTransition(transition: ToasterTransition) {
  return JSON.stringify(transition, null, 2).replace(/"([^"]+)":/g, "$1:");
}

function indent(value: string, spaces: number) {
  const pad = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => (line.length > 0 ? `${pad}${line}` : line))
    .join("\n");
}

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--color-muted-foreground)]/60">
      {children}
    </span>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--color-site-border)]" />;
}

function SliderCard({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-site-border)] bg-[var(--color-card)] p-4">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-[var(--color-muted-foreground)]">{label}</span>
        <span className="font-mono text-[var(--color-muted-foreground)]/60">
          {value}
          {unit}
        </span>
      </div>
      <RangeSlider value={value} min={min} max={max} step={1} onValueChange={onChange} aria-label={label} />
    </div>
  );
}

function ProgressBar({ value, speed, color }: { value: number; speed: string; color: string }) {
  return (
    <div className="flex flex-col gap-1.5 w-44 mt-1">
      <div className="flex justify-between text-[10px] text-white/35 font-mono">
        <span>{value}%</span>
        <span>{speed}</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
