import { useEffect, useId, useRef, useState } from "react";
import { SelectMenuPanel } from "../SelectMenu";
import type { SingleSelectProps } from "./SingleSelect.types";
import { ChevronDownIcon } from "./icons";
import styles from "./SingleSelect.module.css";

export function SingleSelect({
  value,
  options,
  onChange,
  label,
  linkText,
  linkHref,
  onLinkClick,
  placeholder = "Placeholder text",
  disabled = false,
  className,
  "aria-label": ariaLabel = "Single select",
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const labelId = useId();
  const listboxId = useId();

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder;
  const isPlaceholder = !selectedOption;
  const showLabelRow = Boolean(label || linkText);

  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");
  const triggerClassNames = [
    styles.trigger,
    open && styles.triggerOpen,
    disabled && styles.triggerDisabled,
  ]
    .filter(Boolean)
    .join(" ");
  const valueClassNames = [styles.valueLabel, isPlaceholder && styles.placeholder]
    .filter(Boolean)
    .join(" ");
  const chevronClassNames = [styles.chevron, open && styles.chevronOpen]
    .filter(Boolean)
    .join(" ");
  const linkClassNames = [styles.fieldLink, disabled && styles.fieldLinkDisabled]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerAriaLabel = label ? undefined : ariaLabel;
  const triggerLabelledBy = label ? labelId : undefined;

  return (
    <div className={rootClassNames}>
      {showLabelRow && (
        <div className={styles.labelRow}>
          {label ? (
            <label id={labelId} htmlFor={triggerId} className={styles.fieldLabel}>
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

      <div className={styles.field} ref={fieldRef}>
        <button
          id={triggerId}
          type="button"
          className={triggerClassNames}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-label={triggerAriaLabel}
          aria-labelledby={triggerLabelledBy}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current);
            }
          }}
        >
          <span className={valueClassNames}>{displayLabel}</span>
          <ChevronDownIcon className={chevronClassNames} />
        </button>

        {open && !disabled && (
          <div className={styles.dropdown} id={listboxId}>
            <SelectMenuPanel
              mode="single"
              value={value}
              options={options}
              showCheckboxes={false}
              showAllHeader={false}
              aria-label={typeof label === "string" ? label : ariaLabel}
              onChange={(nextValue) => {
                onChange?.(nextValue);
                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export type { SingleSelectProps } from "./SingleSelect.types";
export { createHoleOptions } from "./SingleSelect.types";
