import {
  Toaster,
  type ToasterTransition,
  type ToastPosition,
  type ToastT,
  type ToastTheme,
  toast,
} from "ezlet";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button, StatefulButton, type ButtonState } from "@/components/motion/button";
import { RangeSlider } from "@/components/motion/range-slider";
import "./styles.css";

// ── Icons ────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

// ── Spring presets ────────────────────────────────────────────────────────────

const softnessPresets: Record<string, ToasterTransition> = {
  liquid: {
    morph:  { type: "spring", bounce: 0.08, duration: 0.75 },
    stack:  { type: "spring", bounce: 0.06, duration: 0.68 },
    expand: { type: "spring", bounce: 0.08, duration: 0.72 },
    icon:   { type: "spring", bounce: 0.20, duration: 0.55 },
  },
  standard: {
    morph:  { type: "spring", bounce: 0.15, duration: 0.65 },
    stack:  { type: "spring", bounce: 0.12, duration: 0.58 },
    expand: { type: "spring", bounce: 0.16, duration: 0.62 },
    icon:   { type: "spring", bounce: 0.35, duration: 0.50 },
  },
  bouncy: {
    morph:  { type: "spring", bounce: 0.38, duration: 0.55 },
    stack:  { type: "spring", bounce: 0.28, duration: 0.50 },
    expand: { type: "spring", bounce: 0.35, duration: 0.52 },
    icon:   { type: "spring", bounce: 0.55, duration: 0.45 },
  },
  snappy: {
    morph:  { type: "spring", bounce: 0.02, duration: 0.35 },
    stack:  { type: "spring", bounce: 0.00, duration: 0.30 },
    expand: { type: "spring", bounce: 0.02, duration: 0.32 },
    icon:   { type: "spring", bounce: 0.15, duration: 0.30 },
  },
};

// ── App ──────────────────────────────────────────────────────────────────────

export function App() {
  const [position,     setPosition]     = useState<ToastPosition>("top-center");
  const [theme,        setTheme]        = useState<ToastTheme>("dark");
  const [expanded,     setExpanded]     = useState(false);
  const [visibleToasts,setVisibleToasts]= useState(4);
  const [gap,          setGap]          = useState(14);
  const [offset,       setOffset]       = useState(16);
  const [softness,     setSoftness]     = useState<keyof typeof softnessPresets>("standard");
  const [promiseState, setPromiseState] = useState<ButtonState>("idle");

  // ── demos ──────────────────────────────────────────────────────────────────

  function promiseDemo() {
    setPromiseState("loading");
    const p = new Promise<string>((resolve, reject) =>
      setTimeout(
        () => Math.random() > 0.25
          ? resolve("backup_v4.tar.gz")
          : reject(new Error("Network congestion")),
        2000,
      ),
    );
    p.then(
      () => { setPromiseState("success"); setTimeout(() => setPromiseState("idle"), 2000); },
      () => { setPromiseState("error");   setTimeout(() => setPromiseState("idle"), 2500); },
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
        toast.update(id, { title: "Upload complete!", description: "document.pdf saved.", variant: "success", duration: 4000 });
      } else {
        toast.update(id, { title: "Uploading document.pdf", description: <ProgressBar value={p} speed="12.4 MB/s" color="bg-blue-500" /> });
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
          action: { label: "Open File", onClick: () => { toast.dismiss(id); toast.success("File opened."); } },
        });
      } else {
        toast.update(id, { title: "Downloading database.sql", description: <ProgressBar value={p} speed="4.8 MB/s" color="bg-indigo-500" /> });
      }
    }, 300);
  }

  function burst() {
    setTimeout(() => toast.info("Flight mode armed",  { description: "Stacking shows newest in front.", duration: 15_000 }), 0);
    setTimeout(() => toast.success("Backup complete", { description: "Ezlet morphs without freezing.",  duration: 15_000 }), 120);
    setTimeout(() => toast.error("Payment failed",   { description: "Errors use assertive live regions.", duration: 15_000 }), 240);
  }

  function customDemo() {
    toast.custom((item: ToastT & { expanded?: boolean }) => {
      const isExpanded = item.expanded;
      return (
        <div className="flex flex-col gap-3 min-w-[260px] p-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <SparklesIcon />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">
                {isExpanded ? "AI Artwork Generated" : "AI Artwork Ready"}
              </span>
              <span className="text-[10px] text-white/40 leading-none mt-0.5">
                {isExpanded ? "Model: Neo-v4-Liquid" : "Hover to expand"}
              </span>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                className="flex flex-col gap-3 overflow-hidden"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
                    alt="AI Artwork"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    seed_9872.png
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { navigator.clipboard.writeText("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe"); toast.success("Link copied!", { duration: 2000 }); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white cursor-pointer active:scale-95 transition-all"
                  >
                    <CopyIcon /> <span>Copy Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.share?.({ title: "AI Artwork", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe" }).catch(() => {})}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-semibold text-white cursor-pointer active:scale-95 transition-all"
                  >
                    <ShareIcon /> <span>Share</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    });
  }

  const toastActions = [
    { label: "Default",  dot: "#9ca3af", fn: () => toast("Welcome back!", { description: "You have 3 new notifications." }) },
    { label: "Success",  dot: "#34d399", fn: () => toast.success("Changes saved", { description: "Your workspace is up to date." }) },
    { label: "Error",    dot: "#fb7185", fn: () => toast.error("Connection lost", { description: "Retrying in 5 seconds." }) },
    { label: "Info",     dot: "#60a5fa", fn: () => toast.info("Device connected", { description: "Paired with Studio Pro." }) },
    { label: "Loading",  dot: "#a78bfa", fn: () => toast.loading("Syncing…") },
    { label: "Upload",   dot: "#3b82f6", fn: uploadDemo },
    { label: "Download", dot: "#6366f1", fn: downloadDemo },
    { label: "Custom",   dot: "#e879f9", fn: customDemo },
    { label: "Burst ×3", dot: "conic-gradient(#34d399,#60a5fa,#fb7185,#34d399)", fn: burst },
  ];

  const positions: ToastPosition[] = [
    "top-left", "top-center", "top-right",
    "bottom-left", "bottom-center", "bottom-right",
  ];
  const posLabel: Record<ToastPosition, string> = {
    "top-left":     "↖ top left",
    "top-center":   "↑ top center",
    "top-right":    "↗ top right",
    "bottom-left":  "↙ bottom left",
    "bottom-center":"↓ bottom center",
    "bottom-right": "↘ bottom right",
  };

  return (
    <>
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[560px] flex flex-col gap-10">

          <header className="flex flex-col gap-2">
            <h1 className="text-[clamp(36px,8vw,52px)] font-bold tracking-[-0.03em] leading-none text-[var(--color-foreground)]">
              Playground.
            </h1>
            <p className="text-[15px] text-[var(--color-muted-foreground)] leading-relaxed">
              Dynamic Island-style toasts. Morphing pill, spring physics, Sonner stacking.
            </p>
          </header>

          <Divider />

          <section className="flex flex-col gap-3">
            <Label>Toast type</Label>
            <div className="flex flex-wrap gap-2">
              {toastActions.map(({ label, dot, fn }) => (
                <Button key={label} variant="secondary" size="sm" onClick={fn}>
                  <span className="size-[7px] rounded-full shrink-0" style={{ background: dot }} />
                  {label}
                </Button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <Label>Promise demo</Label>
            <div className="flex gap-2">
              <StatefulButton
                variant="secondary"
                size="sm"
                state={promiseState}
                loadingText="Running…"
                successText="Success!"
                errorText="Failed — retry"
                onClick={promiseDemo}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SliderCard
                label="Visible toasts"
                value={visibleToasts}
                min={1}
                max={10}
                unit=""
                onChange={setVisibleToasts}
              />
              <SliderCard
                label="Stack gap"
                value={gap}
                min={0}
                max={24}
                unit="px"
                onChange={setGap}
              />
              <SliderCard
                label="Offset"
                value={offset}
                min={8}
                max={48}
                unit="px"
                onChange={setOffset}
              />
            </div>
          </section>

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

function Label({ children }: { children: React.ReactNode }) {
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
  label, value, min, max, unit, onChange,
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
          {value}{unit}
        </span>
      </div>
      <RangeSlider
        value={value}
        min={min}
        max={max}
        step={1}
        onValueChange={onChange}
        aria-label={label}
      />
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
        <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
