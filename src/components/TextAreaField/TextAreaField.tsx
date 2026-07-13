import { useId, useState, type ChangeEvent } from "react";
import type { TextAreaFieldProps } from "./TextAreaField.types";
import styles from "./TextAreaField.module.css";

export function TextAreaField({
  label,
  maxLength,
  showCharacterCount = true,
  disabled = false,
  error = false,
  errorMessage,
  previewState,
  className,
  id,
  value = "",
  onChange,
  onFocus,
  onBlur,
  ...textareaProps
}: TextAreaFieldProps) {
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const labelId = useId();
  const errorId = useId();

  const currentValue = typeof value === "string" ? value : String(value ?? "");
  const currentLength = currentValue.length;
  const isAtLimit = currentLength >= maxLength;
  const showErrorMessage = error && errorMessage;
  const isFocused = previewState === "focus" || focused;

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");
  const wrapperClassNames = [
    styles.textareaWrapper,
    isFocused && !error && !disabled && styles.textareaWrapperFocused,
    error && styles.textareaWrapperError,
    disabled && styles.textareaWrapperDisabled,
  ]
    .filter(Boolean)
    .join(" ");
  const counterClassNames = [
    styles.characterCount,
    isAtLimit && styles.characterCountAtLimit,
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value.slice(0, maxLength);
    if (nextValue !== event.target.value) {
      event.target.value = nextValue;
    }
    onChange?.(event);
  };

  return (
    <div className={rootClassNames}>
      {(label || showCharacterCount) && (
        <div className={styles.labelRow}>
          {label ? (
            <label id={labelId} htmlFor={textareaId} className={styles.fieldLabel}>
              {label}
            </label>
          ) : (
            <span aria-hidden="true" />
          )}

          {showCharacterCount && (
            <span className={counterClassNames} aria-live="polite">
              {currentLength}/{maxLength} characters
            </span>
          )}
        </div>
      )}

      <div className={wrapperClassNames}>
        <textarea
          {...textareaProps}
          id={textareaId}
          className={styles.textarea}
          value={currentValue}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={error || undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={showErrorMessage ? errorId : undefined}
          onChange={handleChange}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </div>

      {showErrorMessage && (
        <p id={errorId} className={styles.errorMessage} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export type { TextAreaFieldPreviewState, TextAreaFieldProps } from "./TextAreaField.types";
