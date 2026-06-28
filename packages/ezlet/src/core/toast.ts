import { toastStore } from "./store";
import { PausableTimer } from "./timers";
import type {
  ToastId,
  ToastOptions,
  ToastPromiseOptions,
  ToastT,
  ToastUpdateOptions,
  ToastVariant,
} from "./types";

const timers = new Map<ToastId, PausableTimer>();
const removeTimers = new Map<ToastId, ReturnType<typeof setTimeout>>();
const REMOVE_DELAY = 220;

function clearRemoveTimer(id: ToastId) {
  const timer = removeTimers.get(id);
  if (!timer) {
    return;
  }

  clearTimeout(timer);
  removeTimers.delete(id);
}

function scheduleRemove(id: ToastId) {
  clearRemoveTimer(id);
  removeTimers.set(
    id,
    setTimeout(() => {
      toastStore.remove(id);
      removeTimers.delete(id);
    }, REMOVE_DELAY),
  );
}

function resolveMessage<T>(message: ToastPromiseOptions<T>["messages"]["success"], value: T) {
  return typeof message === "function" ? message(value) : message;
}

function resolveErrorMessage<T>(message: ToastPromiseOptions<T>["messages"]["error"], error: unknown) {
  return typeof message === "function" ? message(error) : message;
}

function resolveOptions<T>(
  options: Partial<ToastOptions> | ((value: T) => Partial<ToastOptions>) | undefined,
  value: T,
) {
  return typeof options === "function" ? options(value) : (options ?? {});
}

function scheduleToast(toast: ToastT) {
  timers.get(toast.id)?.clear();
  timers.delete(toast.id);
  clearRemoveTimer(toast.id);

  if (toast.duration === Number.POSITIVE_INFINITY || toast.duration <= 0) {
    return;
  }

  timers.set(
    toast.id,
    new PausableTimer(() => {
      toastStore.dismiss(toast.id);
      toast.onAutoClose?.(toast);
      timers.delete(toast.id);
      scheduleRemove(toast.id);
    }, toast.duration),
  );
}

function createToast(title: ToastOptions["title"], options: ToastOptions = {}) {
  const toast = toastStore.add({ ...options, title });
  scheduleToast(toast);
  return toast.id;
}

function variant(variantName: ToastVariant) {
  return (title: ToastOptions["title"], options: ToastOptions = {}) =>
    createToast(title, { ...options, variant: variantName });
}

export interface ToastApi {
  (title: ToastOptions["title"], options?: ToastOptions): ToastId;
  success: (title: ToastOptions["title"], options?: ToastOptions) => ToastId;
  error: (title: ToastOptions["title"], options?: ToastOptions) => ToastId;
  info: (title: ToastOptions["title"], options?: ToastOptions) => ToastId;
  loading: (title: ToastOptions["title"], options?: ToastOptions) => ToastId;
  custom: (render: NonNullable<ToastOptions["render"]>, options?: ToastOptions) => ToastId;
  update: (id: ToastId, options: Omit<ToastUpdateOptions, "id">) => ToastT | undefined;
  dismiss: (id?: ToastId) => ToastT[];
  remove: (id?: ToastId) => ToastT[];
  promise: <T>(promise: Promise<T>, options: ToastPromiseOptions<T>) => Promise<T>;
  pause: (id: ToastId) => void;
  resume: (id: ToastId) => void;
}

export const toast: ToastApi = Object.assign(createToast, {
  success: variant("success"),
  error: variant("error"),
  info: variant("info"),
  loading(title: ToastOptions["title"], options: ToastOptions = {}) {
    return createToast(title, { ...options, variant: "loading", duration: Number.POSITIVE_INFINITY });
  },
  custom(render: NonNullable<ToastOptions["render"]>, options: ToastOptions = {}) {
    return createToast(options.title, { ...options, render, variant: "custom" });
  },
  update(id: ToastId, options: Omit<ToastUpdateOptions, "id">) {
    const updated = toastStore.update({ ...options, id });
    if (updated) {
      scheduleToast(updated);
    }
    return updated;
  },
  dismiss(id?: ToastId) {
    const dismissed = toastStore.dismiss(id);
    for (const toast of dismissed) {
      timers.get(toast.id)?.clear();
      timers.delete(toast.id);
      toast.onDismiss?.(toast);
      scheduleRemove(toast.id);
    }
    return dismissed;
  },
  remove(id?: ToastId) {
    const removed = toastStore.remove(id);
    for (const toast of removed) {
      timers.get(toast.id)?.clear();
      timers.delete(toast.id);
      clearRemoveTimer(toast.id);
    }
    return removed;
  },
  async promise<T>(promise: Promise<T>, options: ToastPromiseOptions<T>) {
    const id = createToast(options.messages.loading, {
      ...options,
      ...options.loading,
      variant: "loading",
      duration: Number.POSITIVE_INFINITY,
    });

    try {
      const value = await promise;
      const successOptions = resolveOptions(options.success, value);
      toast.update(id, {
        ...successOptions,
        title: resolveMessage(options.messages.success, value),
        variant: "success",
      });
      return value;
    } catch (error) {
      const errorOptions = resolveOptions(options.error, error);
      toast.update(id, {
        ...errorOptions,
        title: resolveErrorMessage(options.messages.error, error),
        variant: "error",
      });
      throw error;
    }
  },
  pause(id: ToastId) {
    timers.get(id)?.pause();
  },
  resume(id: ToastId) {
    timers.get(id)?.resume();
  },
});

export function clearToastTimersForTests() {
  for (const timer of timers.values()) {
    timer.clear();
  }
  timers.clear();
  for (const timer of removeTimers.values()) {
    clearTimeout(timer);
  }
  removeTimers.clear();
}
