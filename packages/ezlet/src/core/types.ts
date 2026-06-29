import type { Transition } from "motion/react";
import type { ReactNode } from "react";

export type ToastId = string | number;

export type ToastVariant = "default" | "success" | "error" | "info" | "loading" | "custom";

export type ToastStatus = "visible" | "dismissed";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type ToastTheme = "light" | "dark" | "system";

export type ToastMessage = ReactNode;

export type ToastRenderer = (toast: ToastT & { expanded: boolean }) => ReactNode;

export type ToastIconRenderer = ReactNode | ((toast: ToastT) => ReactNode);

export interface ToastAction {
  label: string;
  onClick: (toastId: ToastId) => void;
}

export interface ToastOptions {
  id?: ToastId;
  title?: ToastMessage;
  description?: ToastMessage;
  variant?: ToastVariant;
  duration?: number;
  dismissible?: boolean;
  action?: ToastAction;
  icon?: ToastMessage;
  render?: ToastRenderer;
  data?: unknown;
  onDismiss?: (toast: ToastT) => void;
  onAutoClose?: (toast: ToastT) => void;
  createdAt?: number;
}

export interface ToastT {
  id: ToastId;
  title?: ToastMessage;
  description?: ToastMessage;
  variant: ToastVariant;
  duration: number;
  dismissible: boolean;
  action?: ToastAction;
  icon?: ToastMessage;
  render?: ToastRenderer;
  data?: unknown;
  onDismiss?: (toast: ToastT) => void;
  onAutoClose?: (toast: ToastT) => void;
  status: ToastStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ToastUpdateOptions extends Omit<Partial<ToastOptions>, "id" | "createdAt"> {
  id: ToastId;
}

export interface ToastPromiseMessages<T> {
  loading: ToastMessage;
  success: ToastMessage | ((value: T) => ToastMessage);
  error: ToastMessage | ((error: unknown) => ToastMessage);
}

export interface ToastPromiseOptions<T> extends Omit<ToastOptions, "title" | "variant"> {
  loading?: Partial<ToastOptions>;
  success?: Partial<ToastOptions> | ((value: T) => Partial<ToastOptions>);
  error?: Partial<ToastOptions> | ((error: unknown) => Partial<ToastOptions>);
  messages: ToastPromiseMessages<T>;
}

export type ToastListener = () => void;

export interface ToastClassNames {
  toaster?: string;
  viewport?: string;
  toast?: string;
  content?: string;
  title?: string;
  description?: string;
  icon?: string;
  actionButton?: string;
  dismissButton?: string;
}

export interface ToasterTransition {
  morph?: Transition;
  stack?: Transition;
  expand?: Transition;
  icon?: Transition;
}

export interface ToasterProps {
  position?: ToastPosition;
  theme?: ToastTheme;
  visibleToasts?: number;
  expand?: boolean;
  gap?: number;
  offset?: number;
  duration?: number;
  className?: string;
  classNames?: ToastClassNames;
  icons?: Partial<Record<ToastVariant, ToastIconRenderer>>;
  renderToast?: ToastRenderer;
  transition?: ToasterTransition;
}
