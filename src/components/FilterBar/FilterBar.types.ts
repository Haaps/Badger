import type { ReactNode } from "react";

export type StatusFilter = "errors" | "staged" | "approved";

export type FilterBarValue =
  | { mode: "all" }
  | { mode: "specific"; filters: StatusFilter[] };

export type FilterCounts = {
  errors: number;
  staged: number;
  approved: number;
};

export type FilterBarProps = {
  value: FilterBarValue;
  onChange: (value: FilterBarValue) => void;
  counts?: FilterCounts;
  className?: string;
  readOnly?: boolean;
  "aria-label"?: string;
};

export type FilterChipProps = {
  label: string;
  selected: boolean;
  deactivated: boolean;
  readOnly?: boolean;
  onClick: () => void;
  variant: "all" | StatusFilter;
  renderIcon?: (active: boolean) => ReactNode;
};
