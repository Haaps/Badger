import { useCallback } from "react";
import type {
  FilterBarProps,
  FilterBarValue,
  FilterCounts,
  StatusFilter,
} from "./FilterBar.types";
import { FilterChip } from "./FilterChip";
import { StatusIcon } from "./icons/StatusIcon";
import styles from "./FilterBar.module.css";

const DEFAULT_COUNTS = { errors: 0, staged: 0, approved: 0 };

function isSelected(
  value: FilterBarValue,
  filter: StatusFilter | "all",
): boolean {
  if (filter === "all") return value.mode === "all";
  return value.mode === "specific" && value.filters.includes(filter);
}

function isDeactivated(value: FilterBarValue, filter: StatusFilter | "all") {
  if (filter === "all") return value.mode === "specific";
  return value.mode === "all";
}

export function FilterBar({
  value,
  onChange,
  counts = DEFAULT_COUNTS,
  className,
  readOnly = false,
  "aria-label": ariaLabel = "Status filters",
}: FilterBarProps) {
  const selectAll = useCallback(() => onChange({ mode: "all" }), [onChange]);

  const toggleStatus = useCallback(
    (filter: StatusFilter) => {
      if (value.mode === "all") {
        onChange({ mode: "specific", filters: [filter] });
        return;
      }

      const next = value.filters.includes(filter)
        ? value.filters.filter((f) => f !== filter)
        : [...value.filters, filter];

      if (next.length === 0) {
        onChange({ mode: "all" });
        return;
      }

      onChange({ mode: "specific", filters: next });
    },
    [onChange, value],
  );

  return (
    <div
      className={[styles.bar, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      <FilterChip
        label="All"
        variant="all"
        selected={isSelected(value, "all")}
        deactivated={isDeactivated(value, "all")}
        readOnly={readOnly}
        onClick={selectAll}
      />
      <FilterChip
        label={`Errors (${counts.errors})`}
        variant="errors"
        selected={isSelected(value, "errors")}
        deactivated={isDeactivated(value, "errors")}
        readOnly={readOnly}
        onClick={() => toggleStatus("errors")}
        renderIcon={(active) => (
          <StatusIcon variant="errors" active={active} />
        )}
      />
      <FilterChip
        label={`Staged (${counts.staged})`}
        variant="staged"
        selected={isSelected(value, "staged")}
        deactivated={isDeactivated(value, "staged")}
        readOnly={readOnly}
        onClick={() => toggleStatus("staged")}
        renderIcon={(active) => (
          <StatusIcon variant="staged" active={active} />
        )}
      />
      <FilterChip
        label={`Approved (${counts.approved})`}
        variant="approved"
        selected={isSelected(value, "approved")}
        deactivated={isDeactivated(value, "approved")}
        readOnly={readOnly}
        onClick={() => toggleStatus("approved")}
        renderIcon={(active) => (
          <StatusIcon variant="approved" active={active} />
        )}
      />
    </div>
  );
}

export type { FilterBarProps, FilterBarValue, FilterCounts, StatusFilter };
