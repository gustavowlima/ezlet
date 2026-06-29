// Adapted from beui.dev/components/motion/range-slider

import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SPRING_BOUNCY, SPRING_GLIDE } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface RangeSliderProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showTicks?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function snap(v: number, step: number) {
  return Math.round(v / step) * step;
}

export function RangeSlider({
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  showTicks = false,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: RangeSliderProps) {
  const reduce = useReducedMotion();
  const controlled = controlledValue !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const value = controlled ? (controlledValue ?? defaultValue) : internal;
  const pct = ((value - min) / (max - min)) * 100;

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const setValue = useCallback(
    (v: number) => {
      const next = clamp(snap(v, step), min, max);
      if (!controlled) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, min, max, step, onValueChange],
  );

  const getValueFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return value;
      const { left, width } = track.getBoundingClientRect();
      const ratio = clamp((clientX - left) / width, 0, 1);
      return min + ratio * (max - min);
    },
    [min, max, value],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(true);
      setValue(getValueFromPointer(e.clientX));
    },
    [disabled, setValue, getValueFromPointer],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setValue(getValueFromPointer(e.clientX));
    },
    [dragging, setValue, getValueFromPointer],
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      const actions: Record<string, () => void> = {
        ArrowRight: () => setValue(value + step),
        ArrowUp: () => setValue(value + step),
        ArrowLeft: () => setValue(value - step),
        ArrowDown: () => setValue(value - step),
        Home: () => setValue(min),
        End: () => setValue(max),
      };
      actions[e.key]?.();
      if (e.key in actions) e.preventDefault();
    },
    [disabled, value, step, min, max, setValue],
  );

  const tickCount = showTicks ? Math.floor((max - min) / step) + 1 : 0;
  const ticks = Array.from({ length: tickCount }, (_, i) => min + i * step);

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex h-6 w-full cursor-pointer touch-none items-center select-none",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {/* Track */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--color-foreground)]/10">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-foreground)]"
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : SPRING_GLIDE}
        />
      </div>

      {/* Tick dots */}
      {showTicks && (
        <div className="pointer-events-none absolute inset-x-0 flex justify-between px-[2px]">
          {ticks.map((t) => {
            const tp = ((t - min) / (max - min)) * 100;
            return (
              <span
                key={t}
                className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-foreground)]/20"
                style={{ left: `${tp}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Thumb */}
      <motion.div
        className="pointer-events-none absolute h-4 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-foreground)] shadow-sm"
        animate={{ left: `${pct}%`, scaleY: dragging ? 1.25 : 1 }}
        transition={reduce ? { duration: 0 } : dragging ? SPRING_BOUNCY : SPRING_GLIDE}
      />
    </div>
  );
}
