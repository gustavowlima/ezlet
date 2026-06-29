import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { iconSpring } from "../animation/springs";
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
  hovered?: boolean;
}

export function ToastItem({
  item,
  classNames,
  collapsedLayer,
  icons,
  style,
  stacked,
  transition,
  expanded = false,
  hovered = false,
}: ToastItemProps) {
  const reduce = useReducedMotion();
  const role = item.variant === "error" ? "alert" : "status";
  const title = renderMessage(item.title);
  const description = renderMessage(item.description);
  const hasDescription = description !== null;
  const isExpanded = expanded;

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
        <motion.div
          animate={reduce ? undefined : { scale: 1, opacity: 1 }}
          className={cx("ezlet-custom-content", classNames?.content)}
          initial={reduce ? false : { scale: 0.96, opacity: 0 }}
          key={item.id}
          transition={transition?.morph ?? { type: "spring", bounce: 0.15, duration: 0.5 }}
        >
          {customContent}
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={reduce ? undefined : { scale: 1, opacity: 1 }}
            className={cx("ezlet-icon", classNames?.icon)}
            initial={reduce ? false : { scale: 0.7, opacity: 0 }}
            // Re-pop the icon whenever the variant changes (loading → success…).
            key={item.variant}
            transition={iconTransition}
          >
            {getDefaultIcon(item, icons)}
          </motion.div>
          <motion.div
            animate={reduce ? undefined : { scale: 1, opacity: 1 }}
            className={cx("ezlet-content", classNames?.content)}
            initial={reduce ? false : { scale: 0.96, opacity: 0 }}
            key={item.id}
            transition={transition?.morph ?? { type: "spring", bounce: 0.15, duration: 0.5 }}
          >
            {title !== null ? <div className={cx("ezlet-title", classNames?.title)}>{title}</div> : null}
            <AnimatePresence>
              {hasDescription && isExpanded ? (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 2 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{
                    opacity: { duration: 0.2 },
                    height: { type: "spring", bounce: 0, duration: 0.4 },
                    marginTop: { duration: 0.2 },
                  }}
                  className={cx("ezlet-description", classNames?.description)}
                >
                  {description}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </>
      )}
      <AnimatePresence>
        {!hasCustomContent && isExpanded && (item.action || (item.dismissible && hovered)) ? (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, width: 0, scale: 0.9, marginLeft: 0 }}
            animate={reduce ? undefined : { opacity: 1, width: "auto", scale: 1, marginLeft: 8 }}
            exit={reduce ? undefined : { opacity: 0, width: 0, scale: 0.9, marginLeft: 0 }}
            transition={transition?.morph ?? { type: "spring", bounce: 0.1, duration: 0.4 }}
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
            <AnimatePresence>
              {item.dismissible && hovered ? (
                <motion.button
                  initial={reduce ? undefined : { opacity: 0, scale: 0.8, width: 0 }}
                  animate={reduce ? undefined : { opacity: 1, scale: 1, width: 24 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.8, width: 0 }}
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                  aria-label="Dismiss toast"
                  className={cx("ezlet-dismiss", classNames?.dismissButton)}
                  onClick={() => toast.dismiss(item.id)}
                  type="button"
                >
                  <CloseIcon />
                </motion.button>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
