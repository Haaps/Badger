import type { ReactNode } from "react";

export type SegmentedControlOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps = {
  value: string;
  options: SegmentedControlOption[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};
