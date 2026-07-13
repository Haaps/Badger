import { useState } from "react";
import type { FilterChipProps } from "./FilterBar.types";
import styles from "./FilterBar.module.css";

export function FilterChip({
  label,
  variant,
  selected,
  deactivated,
  readOnly = false,
  onClick,
  renderIcon,
}: FilterChipProps) {
  const [hovered, setHovered] = useState(false);
  // Hover uses the active icon/style even when the chip is not selected.
  const showActiveStyle = selected || hovered;

  const classNames = [
    styles.chip,
    styles[variant],
    !renderIcon && styles.chipNoIcon,
    selected && styles.selected,
    deactivated && !hovered && styles.deactivated,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={readOnly}
      aria-pressed={selected}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {renderIcon && (
        <span className={styles.icon}>{renderIcon(showActiveStyle)}</span>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  );
}
