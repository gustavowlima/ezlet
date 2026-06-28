import { motion, useReducedMotion } from "motion/react";
import { iconSpring } from "../animation/springs";
import { toast } from "../core/toast";
import type { ToastClassNames, ToastIconRenderer, ToastMessage, ToastT } from "../core/types";
import { CloseIcon, DefaultIcon, ErrorIcon, InfoIcon, LoadingIcon, SuccessIcon } from "./icons";

interface ToastItemProps {
  item: ToastT;
  classNames?: ToastClassNames;
  collapsedLayer?: boolean;
  icons?: Partial<Record<ToastT["variant"], ToastIconRenderer>>;
  style?: React.CSSProperties;
  stacked?: boolean;
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

export function ToastItem({ item, classNames, collapsedLayer, icons, style, stacked }: ToastItemProps) {
  const reduce = useReducedMotion();
  const role = item.variant === "error" ? "alert" : "status";
  const title = renderMessage(item.title);
  const description = renderMessage(item.description);
  const hasDescription = description !== null;
  const customContent = item.render?.(item);
  const hasCustomContent = customContent !== null && customContent !== undefined && customContent !== false;

  if (collapsedLayer) {
    return (
      <div
        aria-hidden="true"
        className={cx("it-toast", "it-toast-layer", `it-toast-${item.variant}`, classNames?.toast)}
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
      className={cx("it-toast", `it-toast-${item.variant}`, stacked && "it-toast-stacked", classNames?.toast)}
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
    >
      {hasCustomContent ? (
        <motion.div
          animate={reduce ? undefined : { scale: 1, opacity: 1, filter: "blur(0px)" }}
          className={cx("it-custom-content", classNames?.content)}
          initial={reduce ? false : { scale: 0.94, opacity: 0, filter: "blur(5px)" }}
          key={`${item.id}_${item.variant}`}
          transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
        >
          {customContent}
        </motion.div>
      ) : (
        <>
          <motion.div
            animate={reduce ? undefined : { scale: 1, opacity: 1, filter: "blur(0px)" }}
            className={cx("it-icon", classNames?.icon)}
            initial={reduce ? false : { scale: 0.5, opacity: 0, filter: "blur(6px)" }}
            // Re-pop the icon whenever the variant changes (loading → success…).
            key={item.variant}
            transition={iconSpring}
          >
            {getDefaultIcon(item, icons)}
          </motion.div>
          <motion.div
            animate={reduce ? undefined : { scale: 1, opacity: 1, filter: "blur(0px)" }}
            className={cx("it-content", classNames?.content)}
            initial={reduce ? false : { scale: 0.94, opacity: 0, filter: "blur(5px)" }}
            key={`${item.id}_${item.variant}_${title ? String(title) : ""}`}
            transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
          >
            {title !== null ? <div className={cx("it-title", classNames?.title)}>{title}</div> : null}
            {hasDescription ? (
              <div className={cx("it-description", classNames?.description)}>{description}</div>
            ) : null}
          </motion.div>
        </>
      )}
      {item.action ? (
        <button
          className={cx("it-action", classNames?.actionButton)}
          onClick={() => item.action?.onClick(item.id)}
          type="button"
        >
          {item.action.label}
        </button>
      ) : null}
      {item.dismissible ? (
        <button
          aria-label="Dismiss toast"
          className={cx("it-dismiss", classNames?.dismissButton)}
          onClick={() => toast.dismiss(item.id)}
          type="button"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
