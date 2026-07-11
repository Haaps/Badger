import type { ButtonProps } from "./Button.types";
import styles from "./Button.module.css";

function CheckCircleIcon() {
  return (
    <svg
      className={styles.icon18}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM13.5036 6.70953C13.8362 6.29366 13.7688 5.68686 13.3529 5.35416C12.9371 5.02147 12.3303 5.0889 11.9976 5.50476L7.43859 11.2035L5.61486 9.83571C5.18881 9.51618 4.58439 9.60252 4.26486 10.0286C3.94533 10.4546 4.03167 11.059 4.45771 11.3786L7.02914 13.3071C7.44582 13.6197 8.03534 13.5447 8.3607 13.1381L13.5036 6.70953Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PlusIcon({ size }: { size: 18 | 24 }) {
  const className = size === 24 ? styles.icon24 : styles.icon18;

  return (
    <svg
      className={className}
      viewBox={size === 24 ? "0 0 24 24" : "0 0 18 18"}
      fill="none"
      aria-hidden="true"
    >
      <path
        d={
          size === 24
            ? "M12 4.5V19.5M4.5 12H19.5"
            : "M9 3.375V14.625M3.375 9H14.625"
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function resolveLeadingIcon(icon: ButtonProps["icon"]) {
  if (icon === true) {
    return <PlusIcon size={18} />;
  }

  if (typeof icon === "boolean") {
    return null;
  }

  if (icon) {
    return icon;
  }

  return null;
}

export function Button({
  variant = "primary",
  icon,
  loading = false,
  previewState,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const isIconOnly = variant === "icon";
  const isApproval = variant === "approval";
  const supportsLoading = variant === "primary" || variant === "secondary";
  const isLoading = loading && supportsLoading;
  const isDisabled = disabled || isLoading;

  const leadingIcon = isApproval ? (
    <CheckCircleIcon />
  ) : !isIconOnly ? (
    resolveLeadingIcon(icon)
  ) : null;
  const iconOnlyContent =
    icon === true || icon == null ? (
      <PlusIcon size={24} />
    ) : typeof icon === "boolean" ? (
      <PlusIcon size={24} />
    ) : (
      icon
    );

  const classNames = [
    styles.button,
    styles[variant === "icon" ? "iconOnly" : variant],
    isLoading && variant === "primary" && styles.primaryLoading,
    isLoading && variant === "secondary" && styles.secondaryLoading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      data-preview-state={previewState}
      data-loading={isLoading ? "true" : undefined}
      className={classNames}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {!isLoading && isIconOnly && <span className={styles.icon}>{iconOnlyContent}</span>}
      {!isLoading && leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
      {!isIconOnly && !isLoading && children && (
        <span className={styles.label}>{children}</span>
      )}
    </button>
  );
}

export type { ButtonProps, ButtonVariant } from "./Button.types";
