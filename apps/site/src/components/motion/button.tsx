// Adapted from beui.dev/components/motion/button

import { Check, Loader2, X } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion, useReducedMotion, type Variants } from "motion/react";
import {
  forwardRef,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  ripple?: boolean;
  children?: ReactNode;
}

type Ripple = { id: number; x: number; y: number; size: number };

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-foreground)] text-[var(--color-primary-foreground)] hover:opacity-90",
  secondary:
    "border border-[var(--color-site-border)] bg-[var(--color-foreground)]/[0.05] text-[var(--color-foreground)]/75 hover:bg-[var(--color-foreground)]/[0.09] hover:text-[var(--color-foreground)]",
  ghost:
    "text-[var(--color-foreground)]/45 hover:bg-[var(--color-foreground)]/[0.05] hover:text-[var(--color-foreground)]",
  outline:
    "border border-[var(--color-site-border)] bg-transparent text-[var(--color-foreground)]/75 hover:bg-[var(--color-foreground)]/[0.04] hover:text-[var(--color-foreground)]",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-full",
  md: "h-9 px-4 text-sm gap-2 rounded-full",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-full",
  icon: "h-8 w-8 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    pressScale = 0.94,
    ripple = false,
    className,
    children,
    onPointerDown,
    ...rest
  },
  ref,
) {
  const reduce = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (ripple && !reduce) {
        const rect = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        setRipples((prev) => [
          ...prev,
          { id: nextId.current++, x: event.clientX - rect.left, y: event.clientY - rect.top, size },
        ]);
      }
      onPointerDown?.(event);
    },
    [ripple, reduce, onPointerDown],
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={reduce ? undefined : { scale: pressScale }}
      transition={SPRING_PRESS}
      onPointerDown={handlePointerDown}
      className={cn(
        "inline-flex cursor-pointer select-none items-center justify-center font-medium",
        "transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        ripple && "relative overflow-hidden",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {ripple && !reduce && (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <AnimatePresence>
            {ripples.map((r) => (
              <motion.span
                key={r.id}
                className="absolute rounded-full bg-current"
                style={{ left: r.x, top: r.y, width: r.size, height: r.size, x: "-50%", y: "-50%" }}
                initial={{ scale: 0, opacity: 0.25 }}
                animate={{ scale: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => setRipples((prev) => prev.filter((x) => x.id !== r.id))}
              />
            ))}
          </AnimatePresence>
        </span>
      )}
      {children}
    </motion.button>
  );
});

// ── StatefulButton ─────────────────────────────────────────────────────────────

export type ButtonState = "idle" | "loading" | "success" | "error";

export interface StatefulButtonProps extends Omit<ButtonProps, "children"> {
  state?: ButtonState;
  children: ReactNode;
  loadingText?: ReactNode;
  successText?: ReactNode;
  errorText?: ReactNode;
}

const CASCADE_STAGGER = 0.025;
const ROLL_BLUR = "blur(6px)";

const CASCADE_LETTER_VARIANTS: Variants = {
  initial: { opacity: 0, y: "105%", filter: ROLL_BLUR },
  animate: (delay: number = 0) => ({
    opacity: 1,
    y: "0%",
    filter: "blur(0px)",
    transition: { ...SPRING_SWAP, delay },
  }),
  exit: (delay: number = 0) => ({
    opacity: 0,
    y: "-105%",
    filter: ROLL_BLUR,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1], delay: delay * 0.5 },
  }),
};

const ICON_VARIANTS: Variants = {
  initial: { opacity: 0, width: 0, scale: 0.7, filter: ROLL_BLUR },
  animate: { opacity: 1, width: "1.25rem", scale: 1, filter: "blur(0px)", transition: SPRING_SWAP },
  exit: {
    opacity: 0,
    width: 0,
    scale: 0.7,
    filter: ROLL_BLUR,
    transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
  },
};

function IconSlot({ keyId, children }: { keyId: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      key={keyId}
      variants={ICON_VARIANTS}
      initial={reduce ? { opacity: 0 } : "initial"}
      animate={reduce ? { opacity: 1 } : "animate"}
      exit={reduce ? { opacity: 0 } : "exit"}
      className="inline-grid shrink-0 place-items-center overflow-hidden"
    >
      {children}
    </motion.span>
  );
}

function TextSlot({ value, children }: { value: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();
  const label = typeof children === "string" ? children : null;
  const cascade = label !== null && !reduce;

  useLayoutEffect(() => {
    const w = measureRef.current?.offsetWidth;
    if (!w) return;
    setWidth((cur) => (cur === w ? cur : w));
  });

  return (
    <motion.span
      initial={false}
      animate={{ width }}
      transition={reduce ? { duration: 0 } : SPRING_SWAP}
      className="relative inline-block overflow-hidden whitespace-nowrap align-bottom"
    >
      <span ref={measureRef} aria-hidden className="invisible inline-block whitespace-nowrap">
        {children}
      </span>
      {cascade ? (
        <>
          <span className="sr-only">{label}</span>
          <AnimatePresence initial={false}>
            <motion.span
              key={`cascade-${value}`}
              aria-hidden
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute left-0 top-0 inline-block whitespace-pre"
            >
              {label.split("").map((char, i) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: Letter order is stable and the index drives the stagger.
                  key={i}
                  custom={i * CASCADE_STAGGER}
                  variants={CASCADE_LETTER_VARIANTS}
                  className="inline-block whitespace-pre will-change-[opacity,filter,transform]"
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      ) : (
        <AnimatePresence initial={false}>
          <motion.span
            key={`text-${value}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: ROLL_BLUR }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -14, filter: ROLL_BLUR }}
            transition={reduce ? { duration: 0.15 } : SPRING_SWAP}
            className="absolute left-0 top-0 inline-block will-change-[opacity,filter,transform]"
          >
            {children}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.span>
  );
}

export const StatefulButton = forwardRef<HTMLButtonElement, StatefulButtonProps>(function StatefulButton(
  {
    state = "idle",
    children,
    loadingText = "Loading",
    successText = "Done",
    errorText = "Try again",
    disabled,
    ...rest
  },
  ref,
) {
  const isBusy = state === "loading";
  const stateText =
    state === "loading"
      ? loadingText
      : state === "success"
        ? successText
        : state === "error"
          ? errorText
          : children;
  const textKey = typeof stateText === "string" ? `${state}-${stateText}` : state;

  return (
    <Button ref={ref} disabled={disabled || isBusy} aria-busy={isBusy} {...rest}>
      <span
        aria-live="polite"
        className="relative inline-flex items-center justify-center gap-1.5 overflow-hidden"
      >
        <AnimatePresence initial={false}>
          {state === "loading" && (
            <IconSlot keyId="loading-icon">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </IconSlot>
          )}
          {state === "success" && (
            <IconSlot keyId="success-icon">
              <Check className="h-3.5 w-3.5" />
            </IconSlot>
          )}
          {state === "error" && (
            <IconSlot keyId="error-icon">
              <X className="h-3.5 w-3.5" />
            </IconSlot>
          )}
        </AnimatePresence>
        <TextSlot value={textKey}>{stateText}</TextSlot>
      </span>
    </Button>
  );
});
