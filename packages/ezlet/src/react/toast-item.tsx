import { AnimatePresence, motion } from "motion/react";

import { contentSpring, iconSpring } from "../animation/springs";
import { toast } from "../core/toast";
import type {
  ToastClassNames,
  ToasterTransition,
  ToastIconRenderer,
  ToastMessage,
  ToastT,
} from "../core/types";
import { cx } from "../styles/utils";
import { CloseIcon, DefaultIcon, ErrorIcon, InfoIcon, LoadingIcon, SuccessIcon } from "./icons";

function renderMessage(message: ToastMessage) {
  if (typeof message === "string" || typeof message === "number") {
    return message;
  }

  if (message && typeof message === "object") {
    return message;
  }

  return null;
}

function renderIconOverride(icon: ToastIconRenderer | undefined, item: ToastT) {
  if (typeof icon === "function") {
    return icon(item);
  }

  return icon;
}

function getDefaultIcon(item: ToastT, icons?: Partial<Record<ToastT["variant"], ToastIconRenderer>>) {
  if (item.icon) {
    return renderMessage(item.icon);
  }

  const override = renderIconOverride(icons?.[item.variant], item);
  if (override) {
    return override;
  }

  switch (item.variant) {
    case "success":
      return <SuccessIcon />;
    case "error":
      return <ErrorIcon />;
    case "info":
      return <InfoIcon />;
    case "loading":
      return <LoadingIcon />;
    default:
      return <DefaultIcon />;
  }
}

interface ToastItemProps {
  item: ToastT;
  classNames?: ToastClassNames;
  collapsedLayer?: boolean;
  icons?: Partial<Record<ToastT["variant"], ToastIconRenderer>>;
  style?: React.CSSProperties;
  stacked?: boolean;
  transition?: ToasterTransition;
  expanded?: boolean;
}

// Expanded content stays in flow so the shell measures its final size once and morphs to it.
// It fades in while the shell grows and fades out (faster) before the shell shrinks.
const revealTransition = { duration: 0.24, delay: 0.1, ease: "easeOut" } as const;
const hideTransition = { duration: 0.12, ease: "easeIn" } as const;

export function ToastItem({
  item,
  classNames,
  collapsedLayer,
  icons,
  style,
  stacked,
  transition,
  expanded = false,
}: ToastItemProps) {
  const role = item.variant === "error" ? "alert" : "status";
  const title = renderMessage(item.title);
  const description = renderMessage(item.description);
  const hasDescription = description !== null;
  const isExpanded = expanded;
  const contentTransition = transition?.morph ?? contentSpring;

  const customContent = item.render?.({
    ...item,
    expanded: isExpanded,
  });
  const hasCustomContent = customContent !== null && customContent !== undefined && customContent !== false;

  const iconTransition = transition?.icon ?? iconSpring;

  if (collapsedLayer) {
    return (
      <div
        aria-hidden="true"
        className={cx("ezlet-toast", "ezlet-toast-layer", `ezlet-toast-${item.variant}`, classNames?.toast)}
        data-ezlet-toast=""
        data-status={item.status}
        data-variant={item.variant}
        style={style}
      />
    );
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Toast regions are focusable so keyboard users can dismiss them.
    <div
      aria-live={item.variant === "error" ? "assertive" : "polite"}
      className={cx(
        "ezlet-toast",
        `ezlet-toast-${item.variant}`,
        stacked && "ezlet-toast-stacked",
        classNames?.toast,
      )}
      data-ezlet-toast=""
      data-status={item.status}
      data-variant={item.variant}
      data-expanded={isExpanded ? "true" : "false"}
      onKeyDown={(event) => {
        if (!item.dismissible) {
          return;
        }

        if (event.key === "Escape" || event.key === "Delete" || event.key === "Backspace") {
          event.preventDefault();
          toast.dismiss(item.id);
        }
      }}
      role={role}
      style={style}
      tabIndex={item.dismissible ? 0 : undefined}
    >
      {hasCustomContent ? (
        <div className={cx("ezlet-custom-content", classNames?.content)}>{customContent}</div>
      ) : (
        <>
          <motion.div
            layout="position"
            animate={{ scale: 1, opacity: 1 }}
            className={cx("ezlet-icon", classNames?.icon)}
            initial={{ scale: 0.7, opacity: 0 }}
            // Re-pop the icon whenever the variant changes (loading → success…).
            key={item.variant}
            // Pop with the icon spring; re-center with the same spring as the copy so both move together.
            transition={{ ...iconTransition, layout: contentTransition }}
          >
            {getDefaultIcon(item, icons)}
          </motion.div>
          {/* Position-only layout: slides the copy when the row re-centers, never scales text. */}
          <motion.div
            layout="position"
            className={cx("ezlet-content", classNames?.content)}
            transition={contentTransition}
          >
            <div className="ezlet-copy">
              {title !== null ? <div className={cx("ezlet-title", classNames?.title)}>{title}</div> : null}
            </div>
            {/* popLayout: the exiting description leaves the flow right away, so the title
                re-centers in the same render Motion measures and slides instead of snapping. */}
            <AnimatePresence initial={false} mode="popLayout">
              {hasDescription && isExpanded ? (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(6px)", y: -4 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0, transition: revealTransition }}
                  exit={{ opacity: 0, filter: "blur(4px)", y: -4, transition: hideTransition }}
                  className={cx("ezlet-description", classNames?.description)}
                >
                  {description}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </>
      )}
      <AnimatePresence initial={false}>
        {!hasCustomContent && isExpanded && (item.action || item.dismissible) ? (
          <motion.div
            initial={{ opacity: 0, filter: "blur(4px)", scale: 0.96 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1, transition: revealTransition }}
            exit={{ opacity: 0, filter: "blur(4px)", scale: 0.96, transition: hideTransition }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
            className="ezlet-buttons-group"
          >
            {item.action && (
              <button
                className={cx("ezlet-action", classNames?.actionButton)}
                onClick={() => item.action?.onClick(item.id)}
                type="button"
              >
                {item.action.label}
              </button>
            )}
            {item.dismissible ? (
              <button
                aria-label="Dismiss toast"
                className={cx("ezlet-dismiss", classNames?.dismissButton)}
                onClick={() => toast.dismiss(item.id)}
                type="button"
              >
                <CloseIcon />
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
