import { useId, useState, type ChangeEvent } from "react";
import type { SwitchProps } from "./Switch.types";
import handleOnIcon from "./assets/handle-on.svg";
import handleOnHoverIcon from "./assets/handle-on-hover.svg";
import styles from "./Switch.module.css";

export function Switch({
  checked = false,
  disabled = false,
  onCheckedChange,
  label,
  className,
  id,
  ...inputProps
}: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [hovered, setHovered] = useState(false);

  const trackClassNames = [
    styles.track,
    checked ? styles.trackOn : styles.trackOff,
    hovered && !disabled && (checked ? styles.trackOnHover : styles.trackOffHover),
    disabled && styles.trackDisabled,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClassNames = [
    styles.handle,
    checked && styles.handleOn,
  ]
    .filter(Boolean)
    .join(" ");

  const handleOnIconSrc =
    hovered && !disabled ? handleOnHoverIcon : handleOnIcon;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(event.target.checked);
  };

  const control = (
    <span
      className={styles.control}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <input
        {...inputProps}
        id={inputId}
        type="checkbox"
        role="switch"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        onChange={handleChange}
      />
      <span className={trackClassNames} aria-hidden="true">
        <span className={handleClassNames}>
          {checked && (
            <img src={handleOnIconSrc} alt="" className={styles.handleIcon} />
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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {control}
    </span>
  );
}

export type { SwitchProps };
