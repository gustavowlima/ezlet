import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { SiteRouter } from "./router";

declare global {
  interface Window {
    __ezletRoot?: Root;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");

window.__ezletRoot ??= createRoot(rootElement);
window.__ezletRoot.render(<SiteRouter />);
