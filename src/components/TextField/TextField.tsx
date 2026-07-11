import { useId, useState } from "react";
import type { TextFieldProps } from "./TextField.types";
import styles from "./TextField.module.css";

function ErrorCircleIcon() {
  return (
    <svg
      className={styles.errorIcon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12ZM13.2 6.6C13.2 6.28174 13.0736 5.97652 12.8485 5.75147C12.6235 5.52643 12.3183 5.4 12 5.4C11.6817 5.4 11.3765 5.52643 11.1515 5.75147C10.9264 5.97652 10.8 6.28174 10.8 6.6V11.4C10.8 11.7183 10.9264 12.0235 11.1515 12.2485C11.3765 12.4736 11.6817 12.6 12 12.6C12.3183 12.6 12.6235 12.4736 12.8485 12.2485C13.0736 12.0235 13.2 11.7183 13.2 11.4V6.6ZM12 14.9904C12.4774 14.9904 12.9352 15.18 13.2728 15.5176C13.6104 15.8552 13.8 16.313 13.8 16.7904C13.8 17.2678 13.6104 17.7256 13.2728 18.0632C12.9352 18.4008 12.4774 18.5904 12 18.5904C11.5226 18.5904 11.0648 18.4008 10.7272 18.0632C10.3896 17.7256 10.2 17.2678 10.2 16.7904C10.2 16.313 10.3896 15.8552 10.7272 15.5176C11.0648 15.18 11.5226 14.9904 12 14.9904Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TextField({
  label,
  linkText,
  linkHref,
  onLinkClick,
  placeholder = "Placeholder text",
  disabled = false,
  error = false,
  errorMessage,
  previewState,
  className,
  id,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = useId();
  const errorId = useId();

  const showLabelRow = Boolean(label || linkText);
  const showErrorMessage = error && errorMessage;
  const isFocused = previewState === "focus" || focused;

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");
  const wrapperClassNames = [
    styles.inputWrapper,
    isFocused && !error && !disabled && styles.inputWrapperFocused,
    error && styles.inputWrapperError,
    disabled && styles.inputWrapperDisabled,
  ]
    .filter(Boolean)
    .join(" ");
  const linkClassNames = [styles.fieldLink, disabled && styles.fieldLinkDisabled]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassNames}>
      {showLabelRow && (
        <div className={styles.labelRow}>
          {label ? (
            <label id={labelId} htmlFor={inputId} className={styles.fieldLabel}>
              {label}
            </label>
          ) : (
            <span aria-hidden="true" />
          )}

          {linkText &&
            (linkHref ? (
              <a
                href={disabled ? undefined : linkHref}
                className={linkClassNames}
                aria-disabled={disabled || undefined}
                onClick={(event) => {
                  if (disabled) {
                    event.preventDefault();
                  }
                }}
              >
                {linkText}
              </a>
            ) : (
              <button
                type="button"
                className={linkClassNames}
                disabled={disabled}
                onClick={onLinkClick}
              >
                {linkText}
              </button>
            ))}
        </div>
      )}

      <div className={wrapperClassNames}>
        <input
          {...inputProps}
          id={inputId}
          className={styles.input}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={showErrorMessage ? errorId : undefined}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {error && <ErrorCircleIcon />}
      </div>

      {showErrorMessage && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export type { TextFieldPreviewState, TextFieldProps } from "./TextField.types";
