import { type ReactNode, useEffect, useRef, useState } from "react";

/** How long the exiting layer lingers while it blurs out. Keep in sync with CSS. */
const EXIT_MS = 380;

interface Layer {
  key: string;
  node: ReactNode;
}

interface MorphContentProps {
  /** Changes whenever the rendered content changes (variant/title/description). */
  contentKey: string;
  children: ReactNode;
  reduceMotion?: boolean;
}

/**
 * Sileo-style dual-layer content swap. Instead of AnimatePresence (whose
 * popLayout reflow causes a one-frame flash), we keep the outgoing content as an
 * absolutely-positioned `prev` layer that blurs out via CSS while the new
 * `current` layer blurs in. The pill's size morph is handled separately by the
 * parent's Motion `layout`, so the two never fight.
 */
export function MorphContent({ contentKey, children, reduceMotion }: MorphContentProps) {
  const [currentKey, setCurrentKey] = useState(contentKey);
  const [prev, setPrev] = useState<Layer | null>(null);
  // Snapshot of the previously rendered children, used as the exiting layer.
  const lastChildren = useRef<ReactNode>(children);
  const firstMount = useRef(true);

  // Render-phase swap: when the key changes, push the old content to `prev`.
  if (contentKey !== currentKey) {
    setPrev(reduceMotion ? null : { key: currentKey, node: lastChildren.current });
    setCurrentKey(contentKey);
  }

  useEffect(() => {
    lastChildren.current = children;
  });

  useEffect(() => {
    firstMount.current = false;
  }, []);

  useEffect(() => {
    if (!prev) {
      return;
    }
    const timer = window.setTimeout(() => setPrev(null), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [prev]);

  // Don't blur-in on the very first mount — the stack handles the entry.
  const animateCurrent = !firstMount.current && !reduceMotion;

  return (
    <div className="ezlet-morph">
      <div
        className={animateCurrent ? "ezlet-morph-layer ezlet-morph-enter" : "ezlet-morph-layer"}
        key={currentKey}
      >
        {children}
      </div>
      {prev ? (
        <div aria-hidden="true" className="ezlet-morph-layer ezlet-morph-exit" key={prev.key}>
          {prev.node}
        </div>
      ) : null}
    </div>
  );
}
