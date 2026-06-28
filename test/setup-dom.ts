import { Window } from "happy-dom";

type RafCallback = (time: number) => void;

const window = new Window({
  url: "http://localhost",
});

Object.assign(globalThis, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  HTMLButtonElement: window.HTMLButtonElement,
  HTMLDivElement: window.HTMLDivElement,
  Node: window.Node,
  Text: window.Text,
  Event: window.Event,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  CustomEvent: window.CustomEvent,
  getComputedStyle: window.getComputedStyle.bind(window),
  requestAnimationFrame: (callback: RafCallback) => setTimeout(() => callback(Date.now()), 16),
  cancelAnimationFrame: (id: number) => clearTimeout(id),
});

if (!window.matchMedia) {
  Object.assign(window, {
    matchMedia: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
