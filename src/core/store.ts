import type { ToastId, ToastListener, ToastOptions, ToastT, ToastUpdateOptions } from "./types";

export interface ToastStore {
  subscribe: (listener: ToastListener) => () => void;
  getSnapshot: () => readonly ToastT[];
  add: (options: ToastOptions) => ToastT;
  update: (options: ToastUpdateOptions) => ToastT | undefined;
  dismiss: (id?: ToastId) => ToastT[];
  remove: (id?: ToastId) => ToastT[];
  clear: () => void;
}

let counter = 0;

const DEFAULT_DURATION = 4000;

function createId(): ToastId {
  counter += 1;
  return counter;
}

function toToast(options: ToastOptions): ToastT {
  const now = options.createdAt ?? Date.now();

  return {
    id: options.id ?? createId(),
    title: options.title,
    description: options.description,
    variant: options.variant ?? "default",
    duration: options.duration ?? DEFAULT_DURATION,
    dismissible: options.dismissible ?? true,
    action: options.action,
    icon: options.icon,
    render: options.render,
    data: options.data,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    status: "visible",
    createdAt: now,
    updatedAt: now,
  };
}

export function createToastStore(): ToastStore {
  let toasts: ToastT[] = [];
  const listeners = new Set<ToastListener>();

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function replace(nextToasts: ToastT[]) {
    toasts = nextToasts;
    emit();
  }

  return {
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },

    getSnapshot() {
      return toasts;
    },

    add(options) {
      const toast = toToast(options);
      replace([toast, ...toasts.filter((item) => item.id !== toast.id)]);
      return toast;
    },

    update(options) {
      let updated: ToastT | undefined;
      const now = Date.now();
      const nextToasts = toasts.map((toast) => {
        if (toast.id !== options.id) {
          return toast;
        }

        updated = {
          ...toast,
          ...options,
          id: toast.id,
          createdAt: toast.createdAt,
          updatedAt: now,
          status: "visible",
        };

        return updated;
      });

      if (!updated) {
        return undefined;
      }

      replace(nextToasts);
      return updated;
    },

    dismiss(id) {
      const dismissed: ToastT[] = [];
      const now = Date.now();
      const nextToasts = toasts.map((toast) => {
        if (id !== undefined && toast.id !== id) {
          return toast;
        }

        const nextToast = { ...toast, status: "dismissed" as const, updatedAt: now };
        dismissed.push(nextToast);
        return nextToast;
      });

      if (dismissed.length > 0) {
        replace(nextToasts);
      }

      return dismissed;
    },

    remove(id) {
      const removed: ToastT[] = [];
      const nextToasts = toasts.filter((toast) => {
        const shouldRemove = id === undefined || toast.id === id;
        if (shouldRemove) {
          removed.push(toast);
        }
        return !shouldRemove;
      });

      if (removed.length > 0) {
        replace(nextToasts);
      }

      return removed;
    },

    clear() {
      if (toasts.length === 0) {
        return;
      }

      replace([]);
    },
  };
}

export const toastStore = createToastStore();

export function resetToastCounterForTests() {
  counter = 0;
}
