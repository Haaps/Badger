import type { ReactNode } from "react";
import type { SelectMenuOption } from "../SelectMenu";

export type SingleSelectProps = {
  value: string;
  options: SelectMenuOption[];
  onChange?: (value: string) => void;
  label?: ReactNode;
  linkText?: ReactNode;
  linkHref?: string;
  onLinkClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export { createHoleOptions } from "../SelectMenu";
