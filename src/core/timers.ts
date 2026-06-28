export type TimerCallback = () => void;

export class PausableTimer {
  private callback: TimerCallback;
  private remaining: number;
  private startedAt = 0;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(callback: TimerCallback, delay: number) {
    this.callback = callback;
    this.remaining = delay;

    if (Number.isFinite(delay) && delay > 0) {
      this.resume();
    }
  }

  pause() {
    if (!this.timeout) {
      return;
    }

    clearTimeout(this.timeout);
    this.timeout = undefined;
    this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
  }

  resume() {
    if (this.timeout || this.remaining <= 0) {
      return;
    }

    this.startedAt = Date.now();
    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      this.remaining = 0;
      this.callback();
    }, this.remaining);
  }

  clear() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }

    this.remaining = 0;
  }

  getRemaining() {
    return this.remaining;
  }
}
