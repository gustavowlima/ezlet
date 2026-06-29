import { afterEach, beforeEach, describe, expect, jest, mock, test } from "bun:test";
import { resetToastCounterForTests, toastStore } from "./store";
import { clearToastTimersForTests, toast } from "./toast";

describe("toast api", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearToastTimersForTests();
    toastStore.clear();
    resetToastCounterForTests();
  });

  afterEach(() => {
    clearToastTimersForTests();
    toastStore.clear();
    jest.useRealTimers();
  });

  test("creates variant toasts", () => {
    const id = toast.success("Saved");

    expect(toastStore.getSnapshot()[0]).toMatchObject({
      id,
      title: "Saved",
      variant: "success",
      status: "visible",
    });
  });

  test("creates custom toasts with a render function", () => {
    const id = toast.custom((item) => `Custom ${item.id}`, { duration: 1000 });
    const item = toastStore.getSnapshot()[0];

    expect(item).toMatchObject({
      id,
      variant: "custom",
      duration: 1000,
    });
    expect(item?.render?.({ ...item, expanded: true })).toBe(`Custom ${id}`);
  });

  test("auto dismisses after duration", () => {
    const id = toast("Short", { duration: 500 });

    jest.advanceTimersByTime(499);
    expect(toastStore.getSnapshot()[0]?.status).toBe("visible");

    jest.advanceTimersByTime(1);
    expect(toastStore.getSnapshot()[0]).toMatchObject({ id, status: "dismissed" });

    jest.advanceTimersByTime(220);
    expect(toastStore.getSnapshot()).toEqual([]);
  });

  test("calls onAutoClose when duration elapses", () => {
    const onAutoClose = mock((_: unknown) => {});

    toast("Short", { duration: 500, onAutoClose });
    jest.advanceTimersByTime(500);

    expect(onAutoClose).toHaveBeenCalledTimes(1);
    expect(onAutoClose.mock.calls[0]?.[0]).toMatchObject({ title: "Short" });
  });

  test("calls onDismiss when dismissed manually", () => {
    const onDismiss = mock((_: unknown) => {});
    const id = toast("Manual", { onDismiss });

    toast.dismiss(id);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss.mock.calls[0]?.[0]).toMatchObject({ id, title: "Manual" });

    jest.advanceTimersByTime(220);
    expect(toastStore.getSnapshot()).toEqual([]);
  });

  test("dismisses and removes all toasts in batches", () => {
    toast("One");
    toast("Two");

    expect(toast.dismiss()).toHaveLength(2);
    expect(toastStore.getSnapshot().every((item) => item.status === "dismissed")).toBe(true);

    jest.advanceTimersByTime(220);
    expect(toastStore.getSnapshot()).toEqual([]);
  });

  test("supports pause and resume", () => {
    const id = toast("Paused", { duration: 1000 });

    jest.advanceTimersByTime(400);
    toast.pause(id);
    jest.advanceTimersByTime(1000);
    expect(toastStore.getSnapshot()[0]?.status).toBe("visible");

    toast.resume(id);
    jest.advanceTimersByTime(600);
    expect(toastStore.getSnapshot()[0]?.status).toBe("dismissed");
  });

  test("loading toasts do not auto dismiss by default", () => {
    toast.loading("Loading");

    jest.advanceTimersByTime(60_000);

    expect(toastStore.getSnapshot()[0]?.status).toBe("visible");
  });

  test("promise reuses the same toast id on success", async () => {
    const promise = Promise.resolve("result");
    const tracked = toast.promise(promise, {
      messages: {
        loading: "Saving",
        success: (value: string) => `Saved ${value}`,
        error: "Failed",
      },
    });

    const loadingToast = toastStore.getSnapshot()[0];
    expect(loadingToast).toMatchObject({ title: "Saving", variant: "loading" });

    await tracked;

    expect(toastStore.getSnapshot()).toHaveLength(1);
    expect(toastStore.getSnapshot()[0]).toMatchObject({
      id: loadingToast?.id,
      title: "Saved result",
      variant: "success",
    });
  });

  test("promise reuses the same toast id on error", async () => {
    const failure = new Error("boom");
    const tracked = toast.promise(Promise.reject(failure), {
      messages: {
        loading: "Saving",
        success: "Saved",
        error: (error: unknown) => (error instanceof Error ? error.message : "Failed"),
      },
    });

    const loadingToast = toastStore.getSnapshot()[0];

    await expect(tracked).rejects.toThrow("boom");
    expect(toastStore.getSnapshot()[0]).toMatchObject({
      id: loadingToast?.id,
      title: "boom",
      variant: "error",
    });
  });
});
