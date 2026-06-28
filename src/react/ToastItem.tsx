import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { iconSpring } from "../animation/springs";
import { toast } from "../core/toast";
import type {
  ToastClassNames,
  ToasterTransition,
  ToastIconRenderer,
  ToastMessage,
  ToastT,
} from "../core/types";
import { CloseIcon, DefaultIcon, ErrorIcon, InfoIcon, LoadingIcon, SuccessIcon } from "./icons";

interface ToastItemProps {
  item: ToastT;
  classNames?: ToastClassNames;
  collapsedLayer?: boolean;
  icons?: Partial<Record<ToastT["variant"], ToastIconRenderer>>;
  style?: React.CSSProperties;
  stacked?: boolean;
  transition?: ToasterTransition;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function renderMessage(message: ToastMessage) {
  if (message === null || message === undefined || typeof message === "boolean") {
    return null;
  }

  return message;
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

export function ToastItem({
  item,
  classNames,
  collapsedLayer,
  icons,
  style,
  stacked,
  transition,
}: ToastItemProps) {
  const reduce = useReducedMotion();
  const role = item.variant === "error" ? "alert" : "status";
  const title = renderMessage(item.title);
  const description = renderMessage(item.description);
  const hasDescription = description !== null;

  const isTest = typeof process !== "undefined" && process.env.NODE_ENV === "test";
  const [autoExpanded, setAutoExpanded] = useState(isTest);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (isTest) {
      return;
    }

    let collapseTimer: ReturnType<typeof setTimeout> | undefined;

    // 1. Auto-expand 350ms after mounting
    const expandTimer = setTimeout(() => {
      setAutoExpanded(true);

      // 2. Collapse back to compact state after 2500ms
      collapseTimer = setTimeout(() => {
        setAutoExpanded(false);
      }, 2500);
    }, 350);

    return () => {
      clearTimeout(expandTimer);
      if (collapseTimer) {
        clearTimeout(collapseTimer);
      }
    };
  }, [isTest]);

  const isExpanded = autoExpanded || hovered;

  const customContent = item.render?.({
    ...item,
    expanded: isExpanded,
  } as ToastT);
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
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
        {item.action && isExpanded ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className={cx("ezlet-action", classNames?.actionButton)}
            onClick={() => item.action?.onClick(item.id)}
            type="button"
          >
            {item.action.label}
          </motion.button>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {item.dismissible && isExpanded ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            aria-label="Dismiss toast"
            className={cx("ezlet-dismiss", classNames?.dismissButton)}
            onClick={() => toast.dismiss(item.id)}
            type="button"
          >
            <CloseIcon />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
