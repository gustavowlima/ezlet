import { useEffect, useSyncExternalStore } from "react";
import { toastStore } from "../core/store";
import type { ToastT } from "../core/types";

const EMPTY_TOASTS: readonly ToastT[] = [];

export function useToasts() {
  return useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, () => EMPTY_TOASTS);
}

export function useDocumentVisibilityPause(pauseAll: () => void, resumeAll: () => void) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pauseAll();
      } else {
        resumeAll();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [pauseAll, resumeAll]);
}
