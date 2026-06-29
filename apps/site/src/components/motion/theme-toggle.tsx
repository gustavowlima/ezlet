// Simplified theme toggle (no next-themes dependency)

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type MouseEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("ezlet-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "dark" | "light") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("ezlet-theme", theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = (event?: MouseEvent<HTMLButtonElement>) => {
    const next = theme === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startViewTransition = document.startViewTransition?.bind(document);

    if (!reduceMotion && startViewTransition) {
      const transition = startViewTransition(() => {
        setTheme(next);
        applyTheme(next);
      });

      const target = event?.currentTarget;
      const rect = target?.getBoundingClientRect();
      const x = event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
      const y = event?.clientY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
      const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      void transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 480,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });

      return;
    }

    setTheme(next);
    applyTheme(next);
  };

  return { theme, toggle, isDark: theme === "dark" };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-foreground)]/40 transition-colors hover:text-[var(--color-foreground)]/70",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, rotate: -30 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, rotate: 30 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
