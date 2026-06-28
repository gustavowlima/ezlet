import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { morphSpring, reducedMotionTransition } from "../animation/springs";
import { toast } from "../core/toast";
import type { IslandToasterProps, ToastClassNames, ToastId, ToastT } from "../core/types";
import { MorphContent } from "./MorphContent";
import { ToastItem } from "./ToastItem";

interface IslandProps {
  item: ToastT;
  classNames?: ToastClassNames;
  collapsedLayer?: boolean;
  icons?: IslandToasterProps["icons"];
  renderToast?: IslandToasterProps["renderToast"];
  stacked?: boolean;
  onHeight?: (id: ToastId, height: number) => void;
}

export function Island({ item, classNames, collapsedLayer, icons, renderToast, stacked, onHeight }: IslandProps) {
  const shouldReduceMotion = useReducedMotion();
  const shellRef = useRef<HTMLDivElement>(null);

  // Report the pill's real height so the toaster can lay out the expanded list.
  useEffect(() => {
    const el = shellRef.current;
    if (!el || !onHeight) {
      return;
    }
    // offsetHeight is the layout border-box height, unaffected by the `layout`
    // morph's transform — so the stack math stays stable during a size morph.
    const report = () => onHeight(item.id, el.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, onHeight]);

  const layoutTransition = shouldReduceMotion ? reducedMotionTransition : morphSpring;
  const contentKey = `${item.variant}:${collapsedLayer ? "layer" : "full"}:${String(item.title)}:${String(item.description)}`;

  return (
    <motion.div
      ref={shellRef}
      className="it-island-shell"
      drag={item.dismissible && !stacked ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.18}
      layout
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 600) {
          toast.dismiss(item.id);
        }
      }}
      transition={layoutTransition}
    >
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
          />
        )}
      </MorphContent>
    </motion.div>
  );
}
