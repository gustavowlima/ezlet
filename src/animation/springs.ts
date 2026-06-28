import type { Transition } from "motion/react";

/**
 * Duration-based springs (Sileo / Dynamic Island feel). `bounce` + `duration`
 * read more naturally than stiffness/damping and stay smooth + interruptible.
 */

/** Size morph of the pill when its content changes (loading → success, etc.). */
export const morphSpring: Transition = {
  type: "spring",
  bounce: 0.15,
  duration: 0.65,
};

/** Stack/list repositioning when toasts are added, removed, or expanded. */
export const stackSpring: Transition = {
  type: "spring",
  bounce: 0.12,
  duration: 0.58,
};

/** Entry/exit "expand" of the pill growing out of (and collapsing back to) the edge. */
export const expandSpring: Transition = {
  type: "spring",
  bounce: 0.16,
  duration: 0.62,
};

/** Crossfade/blur swap of the inner content. */
export const contentSpring: Transition = {
  type: "spring",
  bounce: 0.1,
  duration: 0.5,
};

/** Bouncy "pop" of the icon when a toast appears or changes state. */
export const iconSpring: Transition = {
  type: "spring",
  bounce: 0.35,
  duration: 0.5,
};

export const reducedMotionTransition: Transition = {
  duration: 0.01,
};
