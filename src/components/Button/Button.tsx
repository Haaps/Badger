import type { ButtonProps } from "./Button.types";
import styles from "./Button.module.css";

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
  const supportsLoading = variant === "primary" || variant === "secondary";
  const isLoading = loading && supportsLoading;
  const isDisabled = disabled || isLoading;

  const leadingIcon = !isIconOnly ? resolveLeadingIcon(icon) : null;
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
