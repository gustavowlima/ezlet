import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import { PausableTimer } from "./timers";

describe("PausableTimer", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("runs after the configured delay", () => {
    jest.useFakeTimers();
    const callback = mock(() => {});

    new PausableTimer(callback, 1000);

    jest.advanceTimersByTime(999);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("pauses and resumes with remaining time", () => {
    jest.useFakeTimers();
    const callback = mock(() => {});
    const timer = new PausableTimer(callback, 1000);

    jest.advanceTimersByTime(400);
    timer.pause();
    jest.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
    expect(timer.getRemaining()).toBe(600);

    timer.resume();
    jest.advanceTimersByTime(599);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("can be cleared", () => {
    jest.useFakeTimers();
    const callback = mock(() => {});
    const timer = new PausableTimer(callback, 1000);

    timer.clear();
    jest.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
    expect(timer.getRemaining()).toBe(0);
  });
});
