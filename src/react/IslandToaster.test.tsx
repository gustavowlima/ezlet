import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { resetToastCounterForTests, toastStore } from "../core/store";
import { clearToastTimersForTests, toast } from "../core/toast";
import { IslandToaster } from "./IslandToaster";

describe("IslandToaster", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearToastTimersForTests();
    toastStore.clear();
    resetToastCounterForTests();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    clearToastTimersForTests();
    toastStore.clear();
    jest.useRealTimers();
  });

  test("renders visible toasts through a document.body portal", () => {
    render(<IslandToaster />);

    act(() => {
      toast.success("Saved", { description: "Everything is synced" });
    });

    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("Everything is synced")).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(document.body.querySelector(".it-toaster")).toBeTruthy();
  });

  test("uses alert role for errors", () => {
    render(<IslandToaster />);

    act(() => {
      toast.error("Failed");
    });

    expect(screen.getByRole("alert").textContent).toContain("Failed");
  });

  test("dismisses a toast from the dismiss button", () => {
    render(<IslandToaster />);

    act(() => {
      toast("Dismiss me");
    });

    fireEvent.click(screen.getByLabelText("Dismiss toast"));

    expect(toastStore.getSnapshot()[0]?.status).toBe("dismissed");

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(toastStore.getSnapshot()).toEqual([]);
    expect(screen.queryByText("Dismiss me")).toBeNull();
  });

  test("limits visible toasts and collapses stacked content", () => {
    render(<IslandToaster visibleToasts={2} />);

    act(() => {
      toast("One");
      toast("Two");
      toast("Three");
    });

    expect(screen.getByText("Three")).toBeTruthy();
    expect(screen.queryByText("Two")).toBeNull();
    expect(screen.queryByText("One")).toBeNull();
    expect(document.body.querySelectorAll(".it-stack-item")).toHaveLength(2);
  });

  test("shows stacked content when expanded", () => {
    render(<IslandToaster expand visibleToasts={2} />);

    act(() => {
      toast("One");
      toast("Two");
      toast("Three");
    });

    expect(screen.getByText("Three")).toBeTruthy();
    expect(screen.getByText("Two")).toBeTruthy();
    expect(screen.queryByText("One")).toBeNull();
  });

  test("pauses timers on hover and resumes on leave", () => {
    render(<IslandToaster />);

    act(() => {
      toast("Hover", { duration: 1000 });
    });

    const toaster = document.body.querySelector(".it-toaster");
    expect(toaster).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(400);
      fireEvent.mouseEnter(toaster as Element);
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Hover")).toBeTruthy();

    act(() => {
      fireEvent.mouseLeave(toaster as Element);
      jest.advanceTimersByTime(600);
    });

    expect(toastStore.getSnapshot()[0]?.status).toBe("dismissed");

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(screen.queryByText("Hover")).toBeNull();
  });

  test("renders custom toast content", () => {
    render(<IslandToaster />);

    act(() => {
      toast.custom((item) => <strong>Custom {item.id}</strong>);
    });

    expect(screen.getByText(/Custom/)).toBeTruthy();
  });

  test("supports renderToast override", () => {
    render(<IslandToaster renderToast={(item) => <div role="status">Override {item.title}</div>} />);

    act(() => {
      toast.success("Saved");
    });

    expect(screen.getByText("Override Saved")).toBeTruthy();
  });

  test("supports icon overrides", () => {
    render(<IslandToaster icons={{ success: <span data-testid="success-icon">ok</span> }} />);

    act(() => {
      toast.success("Saved");
    });

    expect(screen.getByTestId("success-icon")).toBeTruthy();
  });

  test("dismisses focused toast with Escape", () => {
    render(<IslandToaster />);

    act(() => {
      toast("Keyboard");
    });

    const toastElement = screen.getByRole("status");
    toastElement.focus();
    fireEvent.keyDown(toastElement, { key: "Escape" });

    expect(toastStore.getSnapshot()[0]?.status).toBe("dismissed");

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(screen.queryByText("Keyboard")).toBeNull();
  });
});
