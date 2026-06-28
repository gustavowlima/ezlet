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

  const layoutTransition = shouldReduceMotion ? reducedMotionTransition : (transition?.morph ?? morphSpring);
  const contentKey = `${item.variant}:${collapsedLayer ? "layer" : "full"}:${String(item.title)}:${String(item.description)}`;

  return (
    <motion.div
      ref={shellRef}
      className="ezlet-shell"
      drag={item.dismissible && !stacked ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      layout
      animate={size ? { width: size.width, height: size.height } : undefined}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 600) {
          toast.dismiss(item.id);
        }
      }}
      transition={layoutTransition}
    >
      <div ref={sizerRef} className="ezlet-sizer">
        <MorphContent contentKey={contentKey} reduceMotion={shouldReduceMotion ?? false}>
          {renderToast && !collapsedLayer ? (
            renderToast(item)
          ) : (
            <ToastItem
              classNames={classNames}
              collapsedLayer={collapsedLayer}
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
