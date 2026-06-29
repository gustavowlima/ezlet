import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useInsertionEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getStackTransform } from "../animation/geometry";
import { expandSpring, reducedMotionTransition, stackSpring } from "../animation/springs";
import { toast } from "../core/toast";
import type { ToasterProps, ToastId, ToastT } from "../core/types";
import { ensureEzletStyles } from "../styles/inject-styles";
import { Ezlet } from "./ezlet";
import { useDocumentVisibilityPause, useToasts } from "./hooks";

/** Visible offset of each collapsed card sitting behind the front one. */
const PEEK = 14;
/** Fallback height before a toast has been measured. */
const DEFAULT_HEIGHT = 56;

import { cx } from "../styles/utils";

function getVerticalSide(position: NonNullable<ToasterProps["position"]>) {
  return position.startsWith("bottom") ? "bottom" : "top";
}

function getVisibleToasts(toasts: readonly ToastT[], limit: number) {
  return toasts.filter((item) => item.status === "visible").slice(0, limit);
}

export function Toaster({
  position = "top-center",
  theme = "system",
  visibleToasts = 3,
  expand,
  gap = 14,
  offset = 16,
  injectStyles = true,
  unstyled,
  className,
  classNames,
  icons,
  renderToast,
  transition,
}: ToasterProps) {
  const toasts = useToasts();
  const [hovered, setHovered] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const shouldReduceMotion = useReducedMotion();
  const verticalSide = getVerticalSide(position);
  // `expand` forces the list open; otherwise hovering expands it.
  const expanded = expand || hovered;
  const stackTransition = shouldReduceMotion ? reducedMotionTransition : (transition?.stack ?? stackSpring);
  const itemTransition = shouldReduceMotion ? reducedMotionTransition : (transition?.expand ?? expandSpring);
  const visible = useMemo(() => getVisibleToasts(toasts, visibleToasts), [toasts, visibleToasts]);

  useInsertionEffect(() => {
    if (injectStyles && !unstyled) {
      ensureEzletStyles();
    }
  }, [injectStyles, unstyled]);

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
      const liveIds = new Set(toasts.map((item) => String(item.id)));
      const prevIds = Object.keys(prev);

      if (prevIds.every((id) => liveIds.has(id)) && prevIds.length === liveIds.size) {
        return prev;
      }

      const next: Record<string, number> = {};
      for (const id of liveIds) {
        const val = prev[id];
        if (typeof val === "number") {
          next[id] = val;
        }
      }
      return next;
    });
  }, [toasts]);

  const heightOf = useCallback((id: ToastId) => heights[String(id)] ?? DEFAULT_HEIGHT, [heights]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: heightOf is a stable callback here that depends on heights
  const totalHeight = useMemo(() => {
    return visible.reduce((sum, item) => sum + heightOf(item.id), 0) + gap * Math.max(visible.length - 1, 0);
  }, [visible, heightOf, gap]);

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

  const firstVisible = visible[0];
  const frontHeight = firstVisible ? heightOf(firstVisible.id) : DEFAULT_HEIGHT;
  const viewportHeight = expanded ? totalHeight : frontHeight;

  if (typeof document === "undefined" || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <section
      className={cx(
        "ezlet-toaster",
        `ezlet-${position}`,
        `ezlet-theme-${theme}`,
        className,
        classNames?.toaster,
      )}
      data-expanded={expanded ? "true" : "false"}
      data-ezlet-toaster=""
      data-position={position}
      data-unstyled={unstyled ? "true" : "false"}
      onMouseEnter={() => {
        setHovered(true);
        pauseAll();
      }}
      onMouseLeave={() => {
        setHovered(false);
        resumeAll();
      }}
      aria-label="Notifications"
      style={{ "--ezlet-offset": `${offset}px` } as React.CSSProperties}
    >
      <motion.div
        className={cx("ezlet-viewport", classNames?.viewport)}
        data-ezlet-viewport=""
        animate={{ height: viewportHeight }}
        transition={stackTransition}
      >
        <AnimatePresence>
          {visible.map((item, index) => {
            // Cumulative measured height of every toast in front of this one.
            let heightBefore = 0;
            for (let i = 0; i < index; i += 1) {
              const prevItem = visible[i];
              if (prevItem) {
                heightBefore += heightOf(prevItem.id);
              }
            }

            const transform = getStackTransform({
              index,
              expanded,
              position: verticalSide,
              heightBefore,
              gap,
              peek: PEEK,
            });

            // Dynamic Island-style expand: the pill grows out of the anchored edge
            // (transform-origin top/bottom) from scale 0.6, with a small nudge +
            // fade, and collapses back the same way on exit.
            const enterY = transform.y + (verticalSide === "top" ? -8 : 8);

            return (
              <motion.div
                key={item.id}
                className={cx(
                  "ezlet-stack-item",
                  !expanded && index > 0 ? "ezlet-stack-item-collapsed" : "ezlet-stack-item-active",
                )}
                initial={{ y: enterY, opacity: 0, scale: 0.6 }}
                animate={{
                  y: transform.y,
                  opacity: transform.opacity,
                  scale: transform.scale,
                }}
                exit={{ y: enterY, opacity: 0, scale: 0.6 }}
                data-front={index === 0 ? "true" : "false"}
                data-stack-index={index}
                style={{ zIndex: transform.zIndex }}
                transition={itemTransition}
              >
                <Ezlet
                  classNames={classNames}
                  collapsedLayer={!expanded && index > 0}
                  icons={icons}
                  item={item}
                  onHeight={reportHeight}
                  renderToast={renderToast}
                  stacked={index > 0}
                  transition={transition}
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
