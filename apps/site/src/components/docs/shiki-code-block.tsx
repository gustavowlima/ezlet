import { useEffect, useMemo, useState } from "react";
import { type BundledLanguage, codeToHtml } from "shiki";

const SHIKI_THEMES = {
  dark: "github-dark-dimmed",
  light: "github-light",
} as const;

const htmlCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

export function ShikiCodeBlock({ code, lang = "tsx" }: { code: string; lang?: BundledLanguage }) {
  const cacheKey = useMemo(() => `${lang}\n${code}`, [code, lang]);
  const [html, setHtml] = useState(() => htmlCache.get(cacheKey) ?? "");

  useEffect(() => {
    let alive = true;

    async function run() {
      const cached = htmlCache.get(cacheKey);
      if (cached !== undefined) {
        setHtml(cached);
        return;
      }

      const promise =
        pending.get(cacheKey) ??
        codeToHtml(code, {
          lang,
          themes: SHIKI_THEMES,
          defaultColor: false,
        });
      pending.set(cacheKey, promise);

      const nextHtml = await promise;
      pending.delete(cacheKey);
      htmlCache.set(cacheKey, nextHtml);

      if (alive) {
        setHtml(nextHtml);
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [cacheKey, code, lang]);

  return (
    <div className="overflow-hidden rounded-xl bg-[var(--color-card)]">
      <div
        suppressHydrationWarning
        dangerouslySetInnerHTML={
          html
            ? { __html: html }
            : {
                __html: `<pre class="shiki" style="background-color:var(--color-card);margin:0"><code></code></pre>`,
              }
        }
      />
    </div>
  );
}
