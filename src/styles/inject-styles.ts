import { EZLET_CSS } from "./generated-css";

const STYLE_ID = "ezlet-styles";

export function ensureEzletStyles() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = EZLET_CSS;
  document.head.appendChild(style);
}
