import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { morphSpring, reducedMotionTransition } from "../animation/springs";
import { toast } from "../core/toast";
import type { ToastClassNames, ToasterProps, ToasterTransition, ToastId, ToastT } from "../core/types";
import { cx } from "../styles/utils";
import { MorphContent } from "./morph-content";
import { ToastItem } from "./toast-item";

interface EzletProps {
  item: ToastT;
  classNames?: ToastClassNames;
  collapsedLayer?: boolean;
  icons?: ToasterProps["icons"];
  renderToast?: ToasterProps["renderToast"];
  stacked?: boolean;
  onHeight?: (id: ToastId, height: number) => void;
  transition?: ToasterTransition;
  expanded?: boolean;
}

const EXPANDED_CONTENT_REVEAL_MS = 260;

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

export function Ezlet({
  item,
  classNames,
  collapsedLayer,
  icons,
  renderToast,
  stacked,
  onHeight,
  transition,
  expanded: expandedProp,
}: EzletProps) {
  const shouldReduceMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);
  const [sizerRef, size] = useMeasuredSize();

  const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";
  const [hovered, setHovered] = useState(false);
  const [autoExpanded, setAutoExpanded] = useState(isTest);
  const [expandedContentVisible, setExpandedContentVisible] = useState(isTest);

  useEffect(() => {
    if (isTest) {
      return;
    }

    if (collapsedLayer) {
      return;
    }

    const expandTimer = setTimeout(() => {
      setAutoExpanded(true);
    }, 350);

    const collapseTimer = setTimeout(() => {
      setAutoExpanded(false);
    }, 2850);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(collapseTimer);
    };
  }, [collapsedLayer, isTest]);

  const expanded = !collapsedLayer && (expandedProp || autoExpanded || hovered);

  useEffect(() => {
    if (!expanded) {
      setExpandedContentVisible(false);
      return;
    }

    if (shouldReduceMotion || isTest) {
      setExpandedContentVisible(true);
      return;
    }

    setExpandedContentVisible(false);
    const revealTimer = setTimeout(() => {
      setExpandedContentVisible(true);
    }, EXPANDED_CONTENT_REVEAL_MS);

    return () => clearTimeout(revealTimer);
  }, [expanded, isTest, shouldReduceMotion]);

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
    : shouldReduceMotion
      ? reducedMotionTransition
      : {
          ...baseTransition,
          width: {
            ...baseTransition,
            delay: expanded ? 0 : 0.12,
          },
          height: {
            ...baseTransition,
            delay: expanded ? 0.12 : 0,
          },
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
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setHovered(false);
        }
      }}
      onFocusCapture={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      transition={activeTransition}
    >
      <div ref={sizerRef} className="ezlet-sizer">
        <MorphContent contentKey={contentKey} reduceMotion={shouldReduceMotion ?? false}>
          {renderToast && !collapsedLayer ? (
            renderToast({ ...item, expanded })
          ) : (
            <ToastItem
              classNames={classNames}
              collapsedLayer={collapsedLayer}
              expanded={expanded}
              expandedContentVisible={expandedContentVisible}
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
