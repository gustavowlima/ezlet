import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { resetToastCounterForTests, toastStore } from "../core/store";
import { clearToastTimersForTests, toast } from "../core/toast";
import { Toaster } from "./Toaster";

describe("Toaster", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    clearToastTimersForTests();
    toastStore.clear();
    resetToastCounterForTests();
    document.body.innerHTML = "";
    document.head.querySelector("#ezlet-styles")?.remove();
  });

  afterEach(() => {
    cleanup();
    clearToastTimersForTests();
    toastStore.clear();
    jest.useRealTimers();
  });

  test("renders visible toasts through a document.body portal", () => {
    render(<Toaster />);

    act(() => {
      toast.success("Saved", { description: "Everything is synced" });
    });

    expect(screen.getByText("Saved")).toBeTruthy();
    expect(screen.getByText("Everything is synced")).toBeTruthy();
    expect(screen.getByRole("status")).toBeTruthy();
    expect(document.body.querySelector(".ezlet-toaster")).toBeTruthy();
    expect(document.body.querySelector("[data-ezlet-toaster]")).toBeTruthy();
    expect(document.body.querySelector("[data-ezlet-viewport]")).toBeTruthy();
    expect(document.body.querySelector("[data-ezlet-toast]")).toBeTruthy();
  });

  test("injects base styles once by default", () => {
    const { rerender } = render(<Toaster />);

    act(() => {
      toast("Styled");
    });

    expect(document.head.querySelectorAll("#ezlet-styles")).toHaveLength(1);

    rerender(<Toaster position="bottom-right" />);

    expect(document.head.querySelectorAll("#ezlet-styles")).toHaveLength(1);
  });

  test("can skip automatic style injection", () => {
    render(<Toaster injectStyles={false} />);

    act(() => {
      toast("Manual styles");
    });

    expect(document.head.querySelector("#ezlet-styles")).toBeNull();
  });

  test("unstyled mode skips automatic style injection", () => {
    render(<Toaster unstyled />);

    act(() => {
      toast("Tailwind only");
    });

    expect(document.head.querySelector("#ezlet-styles")).toBeNull();
    expect(document.body.querySelector("[data-unstyled='true']")).toBeTruthy();
  });

  test("uses alert role for errors", () => {
    render(<Toaster />);

    act(() => {
      toast.error("Failed");
    });

    expect(screen.getByRole("alert").textContent).toContain("Failed");
  });

  test("dismisses a toast from the dismiss button", () => {
    render(<Toaster />);

    act(() => {
      toast("Dismiss me");
    });

    const shell = screen.getByText("Dismiss me").closest(".ezlet-shell")!;
    fireEvent.mouseEnter(shell);

    fireEvent.click(screen.getByLabelText("Dismiss toast"));

    expect(toastStore.getSnapshot()[0]?.status).toBe("dismissed");

    act(() => {
      jest.advanceTimersByTime(220);
    });

    expect(toastStore.getSnapshot()).toEqual([]);
    expect(screen.queryByText("Dismiss me")).toBeNull();
  });

  test("limits visible toasts and collapses stacked content", () => {
    render(<Toaster visibleToasts={2} />);

    act(() => {
      toast("One");
      toast("Two");
      toast("Three");
    });

    expect(screen.getByText("Three")).toBeTruthy();
    expect(screen.queryByText("Two")).toBeNull();
    expect(screen.queryByText("One")).toBeNull();
    expect(document.body.querySelectorAll(".ezlet-stack-item")).toHaveLength(2);
    expect(document.body.querySelector("[data-stack-index='0'][data-front='true']")).toBeTruthy();
  });

  test("shows stacked content when expanded", () => {
    render(<Toaster expand visibleToasts={2} />);

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
    render(<Toaster />);

    act(() => {
      toast("Hover", { duration: 1000 });
    });

    const toaster = document.body.querySelector(".ezlet-toaster");
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
    render(<Toaster />);

    act(() => {
      toast.custom((item) => <strong>Custom {item.id}</strong>);
    });

    expect(screen.getByText(/Custom/)).toBeTruthy();
  });

  test("supports renderToast override", () => {
    render(<Toaster renderToast={(item) => <div role="status">Override {item.title}</div>} />);

    act(() => {
      toast.success("Saved");
    });

    expect(screen.getByText("Override Saved")).toBeTruthy();
  });

  test("supports icon overrides", () => {
    render(<Toaster icons={{ success: <span data-testid="success-icon">ok</span> }} />);

    act(() => {
      toast.success("Saved");
    });

    expect(screen.getByTestId("success-icon")).toBeTruthy();
  });

  test("dismisses focused toast with Escape", () => {
    render(<Toaster />);

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
