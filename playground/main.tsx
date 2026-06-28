import { useState } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { IslandToaster, type ToastPosition, type ToastTheme, toast } from "../src";
import "./playground.css";

declare global {
  interface Window {
    __islandToastRoot?: Root;
  }
}

const positions: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function App() {
  const [position, setPosition] = useState<ToastPosition>("top-center");
  const [theme, setTheme] = useState<ToastTheme>("system");
  const [expanded, setExpanded] = useState(false);

  function burst() {
    setTimeout(() => {
      toast.info("Flight mode armed", {
        description: "Stacking shows the newest toast in front.",
        duration: 15_000,
      });
    }, 0);
    setTimeout(() => {
      toast.success("Backup complete", {
        description: "The island should morph without freezing content.",
        duration: 15_000,
      });
    }, 120);
    setTimeout(() => {
      toast.error("Payment failed", {
        description: "Errors use assertive live regions.",
        duration: 15_000,
      });
    }, 240);
  }

  function promiseDemo() {
    const job = new Promise<string>((resolve) => {
      setTimeout(() => resolve("image"), 1800);
    });

    void toast.promise(job, {
      messages: {
        loading: "Uploading image",
        success: (value: string) => `Uploaded ${value}`,
        error: "Upload failed",
      },
      success: {
        description: "Same toast id, new content.",
      },
      error: {
        duration: 6000,
      },
    });
  }

  return (
    <main className="pg-shell">
      <section className="pg-panel" aria-labelledby="playground-title">
        <div>
          <p className="pg-kicker">island-toast</p>
          <h1 id="playground-title">Dynamic Island toast playground</h1>
        </div>

        <section className="pg-controls" aria-label="Toast controls">
          <button type="button" onClick={() => toast("Quick note", { description: "Default styled toast." })}>
            Default
          </button>
          <button
            type="button"
            onClick={() => toast.success("Saved", { description: "Everything is synced." })}
          >
            Success
          </button>
          <button
            type="button"
            onClick={() => toast.error("Failed", { description: "Try again in a moment." })}
          >
            Error
          </button>
          <button type="button" onClick={() => toast.loading("Listening")}>
            Loading
          </button>
          <button
            type="button"
            onClick={() =>
              toast.custom((item) => (
                <div className="pg-custom-toast">
                  <strong>Custom #{item.id}</strong>
                  <span>Rendered through toast.custom.</span>
                </div>
              ))
            }
          >
            Custom
          </button>
          <button type="button" onClick={promiseDemo}>
            Promise
          </button>
          <button type="button" onClick={burst}>
            Burst
          </button>
        </section>

        <div className="pg-grid">
          <label>
            <span>Position</span>
            <select value={position} onChange={(event) => setPosition(event.target.value as ToastPosition)}>
              {positions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Theme</span>
            <select value={theme} onChange={(event) => setTheme(event.target.value as ToastTheme)}>
              <option value="system">system</option>
              <option value="dark">dark</option>
              <option value="light">light</option>
            </select>
          </label>

          <label className="pg-check">
            <input
              checked={expanded}
              onChange={(event) => setExpanded(event.target.checked)}
              type="checkbox"
            />
            <span>Expanded stack</span>
          </label>
        </div>
      </section>

      <IslandToaster expand={expanded} position={position} theme={theme} visibleToasts={4} />
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

window.__islandToastRoot ??= createRoot(rootElement);
window.__islandToastRoot.render(<App />);
