import { useId, useState, type ChangeEvent } from "react";
import type { RadioProps } from "./Radio.types";
import { getRadioIcon } from "./radioIcons";
import styles from "./Radio.module.css";

export function Radio({
  checked = false,
  disabled = false,
  onCheckedChange,
  label,
  className,
  id,
  ...inputProps
}: RadioProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [hovered, setHovered] = useState(false);

  const iconSrc = getRadioIcon(checked, disabled, hovered && !disabled);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      onCheckedChange?.(true);
    }
  };

  const control = (
    <span className={styles.control}>
      <input
        {...inputProps}
        id={inputId}
        type="radio"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <span className={styles.visual} aria-hidden="true">
        <img src={iconSrc} alt="" className={styles.icon} />
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

export type { RadioProps };
