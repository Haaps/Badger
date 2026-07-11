import type { CSSProperties } from "react";
import type { SegmentedControlProps } from "./SegmentedControl.types";
import styles from "./SegmentedControl.module.css";

export function SegmentedControl({
  value,
  options,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Segmented control",
}: SegmentedControlProps) {
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const rootClassNames = [styles.root, disabled && styles.rootDisabled, className]
    .filter(Boolean)
    .join(" ");

  const rootStyle = {
    "--segment-count": options.length,
    "--selected-index": selectedIndex,
  } as CSSProperties;

  return (
    <div
      className={rootClassNames}
      style={rootStyle}
      role="tablist"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
    >
      <span className={styles.indicator} aria-hidden="true" />

      {options.map((option) => {
        const selected = option.value === value;
        const segmentDisabled = disabled || option.disabled;
        const showUnselectedDisabledStyle =
          segmentDisabled && !selected;

        const segmentClassNames = [
          styles.segment,
          selected && styles.segmentSelected,
          showUnselectedDisabledStyle && styles.segmentUnselectedDisabled,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            className={segmentClassNames}
            aria-selected={selected}
            disabled={segmentDisabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => {
              if (!segmentDisabled && option.value !== value) {
                onChange?.(option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export type { SegmentedControlOption, SegmentedControlProps } from "./SegmentedControl.types";
