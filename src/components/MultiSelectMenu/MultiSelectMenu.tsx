import { SelectMenuPanel } from "../SelectMenu";
import type { MultiSelectMenuProps } from "./MultiSelectMenu.types";
import styles from "./MultiSelectMenu.module.css";

export function MultiSelectMenu({
  value,
  options,
  onChange,
  allLabel = "All",
  className,
  "aria-label": ariaLabel = "Multi select menu",
}: MultiSelectMenuProps) {
  const rootClassNames = [styles.multiSelectMenu, className].filter(Boolean).join(" ");

  return (
    <SelectMenuPanel
      mode="multi"
      value={value}
      options={options}
      onChange={onChange}
      allLabel={allLabel}
      showAllHeader
      showCheckboxes
      className={rootClassNames}
      aria-label={ariaLabel}
    />
  );
}

export type {
  MultiSelectMenuOption,
  MultiSelectMenuProps,
} from "./MultiSelectMenu.types";
export { createHoleOptions } from "./MultiSelectMenu.types";
