import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getStackTransform } from "../animation/geometry";
import { reducedMotionTransition, stackSpring } from "../animation/springs";
import { toast } from "../core/toast";
import type { IslandToasterProps, ToastId, ToastT } from "../core/types";
import { useDocumentVisibilityPause, useToasts } from "./hooks";
import { Island } from "./Island";

/** Visible offset of each collapsed card sitting behind the front one. */
const PEEK = 14;
/** Fallback height before a toast has been measured. */
const DEFAULT_HEIGHT = 56;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getVerticalSide(position: NonNullable<IslandToasterProps["position"]>) {
  return position.startsWith("bottom") ? "bottom" : "top";
}

function getVisibleToasts(toasts: readonly ToastT[], limit: number) {
  return toasts.filter((item) => item.status === "visible").slice(0, limit);
}

export function IslandToaster({
  position = "top-center",
  theme = "system",
  visibleToasts = 3,
  expand,
  gap = 14,
  offset = 16,
  className,
  classNames,
  icons,
  renderToast,
}: IslandToasterProps) {
  const toasts = useToasts();
  const [hovered, setHovered] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const shouldReduceMotion = useReducedMotion();
  const verticalSide = getVerticalSide(position);
  // `expand` forces the list open; otherwise hovering expands it.
  const expanded = expand || hovered;
  const stackTransition = shouldReduceMotion ? reducedMotionTransition : stackSpring;
  const visible = useMemo(() => getVisibleToasts(toasts, visibleToasts), [toasts, visibleToasts]);

  const reportHeight = useCallback((id: ToastId, height: number) => {
    setHeights((prev) => {
      const key = String(id);
      if (prev[key] === height) {
        return prev;
      }
      return { ...prev, [key]: height };
    });
  }, []);

  // Drop heights for toasts that are no longer rendered so the map can't grow forever.
  useEffect(() => {
    setHeights((prev) => {
      const live = new Set(toasts.map((item) => String(item.id)));
      let changed = false;
      const next: Record<string, number> = {};
      for (const key of Object.keys(prev)) {
        if (live.has(key)) {
          next[key] = prev[key];
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [toasts]);

  const heightOf = useCallback((id: ToastId) => heights[String(id)] ?? DEFAULT_HEIGHT, [heights]);

  const pauseAll = useCallback(() => {
    for (const item of visible) {
      toast.pause(item.id);
    }
  }, [visible]);
  const resumeAll = useCallback(() => {
    for (const item of visible) {
      toast.resume(item.id);
    }
  }, [visible]);

  useDocumentVisibilityPause(pauseAll, resumeAll);

  const frontHeight = visible.length > 0 ? heightOf(visible[0].id) : DEFAULT_HEIGHT;
  const totalHeight =
    visible.reduce((sum, item) => sum + heightOf(item.id), 0) + gap * Math.max(visible.length - 1, 0);
  const viewportHeight = expanded ? totalHeight : frontHeight;

  if (typeof document === "undefined" || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <section
      className={cx("it-toaster", `it-${position}`, `it-theme-${theme}`, className, classNames?.toaster)}
      data-expanded={expanded ? "true" : "false"}
      data-position={position}
      onMouseEnter={() => {
        setHovered(true);
        pauseAll();
      }}
      onMouseLeave={() => {
        setHovered(false);
        resumeAll();
      }}
      aria-label="Notifications"
      style={{ "--it-offset": `${offset}px` } as React.CSSProperties}
    >
      <motion.div
        className={cx("it-viewport", classNames?.viewport)}
        animate={{ height: viewportHeight }}
        transition={stackTransition}
      >
        <AnimatePresence>
          {visible.map((item, index) => {
            // Cumulative measured height of every toast in front of this one.
            let heightBefore = 0;
            for (let i = 0; i < index; i += 1) {
              heightBefore += heightOf(visible[i].id);
            }

            const transform = getStackTransform({
              index,
              expanded,
              position: verticalSide,
              heightBefore,
              gap,
              peek: PEEK,
            });

            // Subtle Sileo-style entry/exit: small nudge from the anchored edge
            // + scale 0.95 + fade. The pushing-back of older toasts does the
            // rest of the motion.
            const enterY = transform.y + (verticalSide === "top" ? -6 : 6);

            return (
              <motion.div
                key={item.id}
                className="it-stack-item"
                initial={{ y: enterY, opacity: 0, scale: 0.95 }}
                animate={{
                  y: transform.y,
                  opacity: transform.opacity,
                  scale: transform.scale,
                }}
                exit={{ y: enterY, opacity: 0, scale: 0.95 }}
                style={{ zIndex: transform.zIndex }}
                transition={stackTransition}
              >
                <Island
                  classNames={classNames}
                  collapsedLayer={!expanded && index > 0}
                  icons={icons}
                  item={item}
                  onHeight={reportHeight}
                  renderToast={renderToast}
                  stacked={index > 0}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>,
    document.body,
  );
}
