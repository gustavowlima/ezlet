import type { Transition } from "motion/react";

/**
 * Duration-based springs (Sileo / Dynamic Island feel). `bounce` + `duration`
 * read more naturally than stiffness/damping and stay smooth + interruptible.
 */

/** Size morph of the pill when its content changes (loading → success, etc.). */
export const morphSpring: Transition = {
  type: "spring",
  bounce: 0.28,
  duration: 0.6,
};

/** Stack/list repositioning when toasts are added, removed, or expanded. */
export const stackSpring: Transition = {
  type: "spring",
  bounce: 0.18,
  duration: 0.5,
};

/** Entry/exit "expand" of the pill growing out of (and collapsing back to) the edge. */
export const expandSpring: Transition = {
  type: "spring",
  bounce: 0.3,
  duration: 0.55,
};

/** Crossfade/blur swap of the inner content. */
export const contentSpring: Transition = {
  type: "spring",
  bounce: 0.15,
  duration: 0.45,
};

/** Bouncy "pop" of the icon when a toast appears or changes state. */
export const iconSpring: Transition = {
  type: "spring",
  bounce: 0.5,
  duration: 0.5,
};

export const reducedMotionTransition: Transition = {
  duration: 0.01,
};
