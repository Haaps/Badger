import { useEffect, useId, useRef, type ChangeEvent } from "react";
import type { CheckboxProps } from "./Checkbox.types";
import checkIcon from "./assets/check.svg";
import indeterminateIcon from "./assets/indeterminate.svg";
import styles from "./Checkbox.module.css";

export function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  onCheckedChange,
  label,
  className,
  id,
  ...inputProps
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const boxClassNames = [
    styles.box,
    checked && !indeterminate && styles.checked,
    indeterminate && styles.indeterminate,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(event.target.checked);
  };

  const control = (
    <span className={styles.control}>
      <input
        {...inputProps}
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? "mixed" : checked}
        onChange={handleChange}
      />
      <span className={boxClassNames} aria-hidden="true">
        <span className={styles.iconLayer}>
          {checked && !indeterminate && (
            <img src={checkIcon} alt="" className={styles.checkIcon} />
          )}
          {indeterminate && (
            <img
              src={indeterminateIcon}
              alt=""
              className={styles.indeterminateIcon}
            />
          )}
        </span>
      </span>
    </span>
  );

  if (label) {
    return (
      <label
        className={[styles.root, disabled && styles.rootDisabled, className]
          .filter(Boolean)
          .join(" ")}
      >
        {control}
        <span className={styles.label}>{label}</span>
      </label>
    );
  }

  return (
    <span
      className={[styles.root, disabled && styles.rootDisabled, className]
        .filter(Boolean)
        .join(" ")}
    >
      {control}
    </span>
  );
}

export type { CheckboxProps };
