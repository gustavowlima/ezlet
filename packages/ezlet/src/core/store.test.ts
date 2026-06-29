import { beforeEach, describe, expect, mock, test } from "bun:test";
import { createToastStore, resetToastCounterForTests } from "./store";

describe("toast store", () => {
  beforeEach(() => {
    resetToastCounterForTests();
  });

  test("adds toasts to the front and emits", () => {
    const store = createToastStore();
    const listener = mock(() => {});
    store.subscribe(listener);

    const first = store.add({ title: "First" });
    const second = store.add({ title: "Second", variant: "success" });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().map((toast) => toast.id)).toEqual([second.id, first.id]);
    expect(second.variant).toBe("success");
  });

  test("replaces an existing id instead of duplicating it", () => {
    const store = createToastStore();

    store.add({ id: "same", title: "First" });
    store.add({ id: "same", title: "Second" });

    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0]?.title).toBe("Second");
  });

  test("updates a toast without changing creation metadata", () => {
    const store = createToastStore();
    const created = store.add({ title: "Loading", createdAt: 100 });

    const updated = store.update({ id: created.id, title: "Done", variant: "success" });

    expect(updated?.title).toBe("Done");
    expect(updated?.variant).toBe("success");
    expect(updated?.createdAt).toBe(100);
    expect(updated?.updatedAt).toBeGreaterThan(created.updatedAt);
    expect(updated?.status).toBe("visible");
  });

  test("dismisses and removes toasts", () => {
    const store = createToastStore();
    const toast = store.add({ title: "Toast" });

    expect(store.dismiss(toast.id)[0]?.status).toBe("dismissed");
    expect(store.getSnapshot()[0]?.status).toBe("dismissed");

    expect(store.remove(toast.id)).toHaveLength(1);
    expect(store.getSnapshot()).toHaveLength(0);
  });

  test("can clear all toasts", () => {
    const store = createToastStore();
    store.add({ title: "One" });
    store.add({ title: "Two" });

    store.clear();

    expect(store.getSnapshot()).toEqual([]);
  });
});
