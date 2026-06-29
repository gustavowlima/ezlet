import { type ReactNode, useEffect, useRef, useState } from "react";
import { cx } from "../styles/utils";

/** How long the exiting layer lingers while it blurs out. Keep in sync with CSS. */
const EXIT_MS = 380;

interface Layer {
  key: string;
  node: ReactNode;
}

interface MorphContentProps {
  /** Changes when the layout mode changes and should crossfade. */
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
  const [layers, setLayers] = useState<Layer[]>([{ key: contentKey, node: children }]);
  const lastKey = useRef(contentKey);
  const lastChildren = useRef(children);
  const firstMount = useRef(true);

  // Render-phase state update for performance (avoid extra paint)
  if (contentKey !== lastKey.current) {
    const nextLayers = reduceMotion
      ? [{ key: contentKey, node: children }]
      : [
          { key: lastKey.current, node: lastChildren.current },
          { key: contentKey, node: children },
        ].slice(-2);

    setLayers(nextLayers);
    lastKey.current = contentKey;
  }

  useEffect(() => {
    lastChildren.current = children;
  });

  useEffect(() => {
    firstMount.current = false;
  }, []);

  useEffect(() => {
    if (layers.length <= 1 || reduceMotion) {
      return;
    }

    const timer = setTimeout(() => {
      setLayers((prev) => {
        if (prev.length <= 1) {
          return prev;
        }

        const last = prev[prev.length - 1];
        return last ? [last] : prev;
      });
    }, EXIT_MS);

    return () => clearTimeout(timer);
  }, [layers, reduceMotion]);

  return (
    <div className="ezlet-morph">
      {layers.map((layer, index) => {
        const isLast = index === layers.length - 1;
        const isFirstLayerEver = firstMount.current && isLast;
        const animate = !isFirstLayerEver && !reduceMotion;
        const node = isLast ? children : layer.node;

        return (
          <div
            key={layer.key}
            aria-hidden={!isLast}
            className={cx(
              "ezlet-morph-layer",
              animate && (isLast ? "ezlet-morph-enter" : "ezlet-morph-exit"),
            )}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}
