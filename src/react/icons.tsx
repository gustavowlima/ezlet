import type { ReactNode, SVGProps } from "react";

/**
 * Lucide-style line icons matching Sileo: 24px grid, round caps, 2px stroke.
 * Color is inherited from the variant (`currentColor`).
 */
function Icon({
  title,
  children,
  ...props
}: SVGProps<SVGSVGElement> & { title: string; children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      className="it-icon-svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function SuccessIcon() {
  return (
    <Icon title="Success">
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function ErrorIcon() {
  return (
    <Icon title="Error">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </Icon>
  );
}

export function InfoIcon() {
  return (
    <Icon title="Info">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </Icon>
  );
}

export function LoadingIcon() {
  return (
    <Icon className="it-icon-svg it-icon-spin" title="Loading">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </Icon>
  );
}

export function DefaultIcon() {
  return (
    <Icon title="Notification">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon title="Dismiss">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}
