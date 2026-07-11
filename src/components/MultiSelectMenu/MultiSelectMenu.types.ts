export type { SelectMenuOption as MultiSelectMenuOption } from "../SelectMenu";
export { createHoleOptions } from "../SelectMenu";

export type MultiSelectMenuProps = {
  value: string[];
  options: import("../SelectMenu").SelectMenuOption[];
  onChange?: (value: string[]) => void;
  allLabel?: string;
  className?: string;
  "aria-label"?: string;
};
