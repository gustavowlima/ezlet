import type { Transition } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const SPRING_PRESS: Transition = {
  type: "spring",
  stiffness: 800,
  damping: 50,
  mass: 1,
};

export const SPRING_SWAP: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const SPRING_GLIDE: Transition = {
  type: "spring",
  stiffness: 700,
  damping: 50,
};

export const SPRING_BOUNCY: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 28,
  mass: 0.8,
};
