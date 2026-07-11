import { Checkbox } from "../Checkbox";
import type { SelectMenuOption } from "./SelectMenu.types";
import styles from "./SelectMenuPanel.module.css";

type SelectMenuPanelBaseProps = {
  options: SelectMenuOption[];
  showCheckboxes?: boolean;
  showAllHeader?: boolean;
  allLabel?: string;
  className?: string;
  "aria-label"?: string;
};

type SingleSelectMenuPanelProps = SelectMenuPanelBaseProps & {
  mode: "single";
  value: string;
  onChange?: (value: string) => void;
};

type MultiSelectMenuPanelProps = SelectMenuPanelBaseProps & {
  mode: "multi";
  value: string[];
  onChange?: (value: string[]) => void;
};

export type SelectMenuPanelProps =
  | SingleSelectMenuPanelProps
  | MultiSelectMenuPanelProps;

export function SelectMenuPanel(props: SelectMenuPanelProps) {
  const {
    options,
    mode,
    showCheckboxes = mode === "multi",
    showAllHeader = mode === "multi",
    allLabel = "All",
    className,
    "aria-label": ariaLabel = "Select menu",
  } = props;

  const panelClassNames = [styles.panel, className].filter(Boolean).join(" ");

  if (mode === "multi") {
    const { value, onChange } = props;
    const selectedValues = new Set(value);
    const selectedCount = options.filter((option) => selectedValues.has(option.value)).length;
    const allSelected = options.length > 0 && selectedCount === options.length;
    const indeterminate = selectedCount > 0 && !allSelected;

    const toggleAll = () => {
      if (allSelected) {
        onChange?.([]);
        return;
      }

      onChange?.(options.map((option) => option.value));
    };

    const toggleOption = (optionValue: string) => {
      if (selectedValues.has(optionValue)) {
        onChange?.(value.filter((item) => item !== optionValue));
        return;
      }

      onChange?.([...value, optionValue]);
    };

    return (
      <div className={panelClassNames}>
        {showAllHeader && (
          <button
            type="button"
            className={styles.header}
            aria-label={`${allLabel}. ${selectedCount} of ${options.length} selected.`}
            onClick={toggleAll}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={indeterminate}
              className={styles.headerCheckbox}
              tabIndex={-1}
              aria-hidden="true"
            />
            <span className={styles.headerLabel}>{allLabel}</span>
          </button>
        )}

        <ul
          className={styles.list}
          role="listbox"
          aria-label={ariaLabel}
          aria-multiselectable="true"
        >
          {options.map((option) => renderItem(option, selectedValues.has(option.value), () => toggleOption(option.value), showCheckboxes))}
        </ul>
      </div>
    );
  }

  const { value, onChange } = props;

  return (
    <div className={panelClassNames}>
      <ul className={styles.list} role="listbox" aria-label={ariaLabel}>
        {options.map((option) =>
          renderItem(option, option.value === value, () => onChange?.(option.value), showCheckboxes),
        )}
      </ul>
    </div>
  );
}

function renderItem(
  option: SelectMenuOption,
  selected: boolean,
  onSelect: () => void,
  showCheckboxes: boolean,
) {
  const itemClassNames = [styles.item, selected && styles.itemSelected]
    .filter(Boolean)
    .join(" ");

  return (
    <li key={option.value} role="presentation">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        className={itemClassNames}
        onClick={onSelect}
      >
        {showCheckboxes && (
          <Checkbox
            checked={selected}
            className={styles.itemCheckbox}
            tabIndex={-1}
            aria-hidden="true"
          />
        )}
        <span className={styles.itemLabel}>{option.label}</span>
      </button>
    </li>
  );
}
