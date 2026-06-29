import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { morphSpring, reducedMotionTransition } from "../animation/springs";
import { toast } from "../core/toast";
import type { ToastClassNames, ToasterProps, ToasterTransition, ToastId, ToastT } from "../core/types";
import { MorphContent } from "./MorphContent";
import { ToastItem } from "./ToastItem";

interface EzletProps {
  item: ToastT;
  classNames?: ToastClassNames;
  collapsedLayer?: boolean;
  icons?: ToasterProps["icons"];
  renderToast?: ToasterProps["renderToast"];
  stacked?: boolean;
  onHeight?: (id: ToastId, height: number) => void;
  transition?: ToasterTransition;
}

function useMeasuredSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const next = {
      width: el.offsetWidth,
      height: el.offsetHeight,
    };

    setSize((prev) => {
      if (prev?.width === next.width && prev.height === next.height) {
        return prev;
      }
      return next;
    });
  }, []);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return [ref, size] as const;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Ezlet({
  item,
  classNames,
  collapsedLayer,
  icons,
  renderToast,
  stacked,
  onHeight,
  transition,
}: EzletProps) {
  const shouldReduceMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);
  const [sizerRef, size] = useMeasuredSize();

  const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";
  const [autoExpanded, setAutoExpanded] = useState(isTest);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (isTest || collapsedLayer) {
      return;
    }

    let collapseTimer: ReturnType<typeof setTimeout> | undefined;

    const expandTimer = setTimeout(() => {
      setAutoExpanded(true);

      collapseTimer = setTimeout(() => {
        setAutoExpanded(false);
      }, 2500);
    }, 350);

    return () => {
      clearTimeout(expandTimer);
      if (collapseTimer) {
        clearTimeout(collapseTimer);
      }
    };
  }, [collapsedLayer, isTest]);

  const expanded = !collapsedLayer && (autoExpanded || hovered);

  // Report the pill's real height so the toaster can lay out the expanded list.
  useEffect(() => {
    const el = shellRef.current;
    if (!el || !onHeight) {
      return;
    }
    const report = () => onHeight(item.id, size?.height ?? el.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, onHeight, size?.height]);

  const isFirstSize = useRef(true);
  useEffect(() => {
    if (size) {
      isFirstSize.current = false;
    }
  }, [size]);

  const baseTransition = shouldReduceMotion ? reducedMotionTransition : (transition?.morph ?? morphSpring);
  const activeTransition = isFirstSize.current
    ? ({ type: "tween", duration: 0 } as const)
    : expanded
      ? {
          width: baseTransition,
          height: { ...baseTransition, delay: 0.15 },
        }
      : {
          height: baseTransition,
          width: { ...baseTransition, delay: 0.15 },
        };
  const contentKey = `${item.variant}:${collapsedLayer ? "layer" : "full"}`;

  return (
    <motion.div
      ref={shellRef}
      className={cx(
        "ezlet-shell",
        `ezlet-toast-${item.variant}`,
        stacked && "ezlet-toast-stacked",
        classNames?.toast,
      )}
      data-status={item.status}
      data-variant={item.variant}
      data-expanded={expanded ? "true" : "false"}
      drag={item.dismissible && !stacked ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      animate={size ? { width: size.width, height: size.height } : undefined}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 600) {
          toast.dismiss(item.id);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      transition={activeTransition}
    >
      <div ref={sizerRef} className="ezlet-sizer">
        <MorphContent contentKey={contentKey} reduceMotion={shouldReduceMotion ?? false}>
          {renderToast && !collapsedLayer ? (
            renderToast(item)
          ) : (
            <ToastItem
              classNames={classNames}
              collapsedLayer={collapsedLayer}
              expanded={expanded}
              hovered={hovered}
              icons={icons}
              item={item}
              stacked={stacked}
              transition={transition}
            />
          )}
        </MorphContent>
      </div>
    </motion.div>
  );
}
