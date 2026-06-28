export interface StackTransform {
  y: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

export interface StackOptions {
  /** 0 = front (newest). Increasing values move toward the back of the stack. */
  index: number;
  /** Whether the stack is expanded into a list (hover / `expand`). */
  expanded: boolean;
  /** Vertical anchor of the toaster. */
  position: "top" | "bottom";
  /** Sum of the measured heights of every toast in front of this one. */
  heightBefore: number;
  /** Spacing between toasts when the stack is expanded. */
  gap: number;
  /** Visible offset of each collapsed card behind the front one. */
  peek: number;
}

/**
 * Pure transform math for a single toast, mirroring Sonner's stacking model:
 * absolutely positioned cards driven entirely by `transform`, so a spring can
 * interpolate every change smoothly (no layout/FLIP, no flicker).
 */
export function getStackTransform({
  index,
  expanded,
  position,
  heightBefore,
  gap,
  peek,
}: StackOptions): StackTransform {
  // top → stack grows downward (+y); bottom → grows upward (−y).
  const direction = position === "top" ? 1 : -1;
  const zIndex = 1000 - index;

  if (expanded) {
    return {
      y: direction * (heightBefore + gap * index),
      scale: 1,
      opacity: 1,
      zIndex,
    };
  }

  return {
    y: direction * index * peek,
    scale: Math.max(1 - index * 0.06, 0.82),
    opacity: 1,
    zIndex,
  };
}
