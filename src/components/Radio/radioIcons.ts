import defaultIcon from "./assets/default.svg";
import defaultHoverIcon from "./assets/default-hover.svg";
import defaultDisabledIcon from "./assets/default-disabled.svg";
import selectedIcon from "./assets/selected.svg";
import selectedHoverIcon from "./assets/selected-hover.svg";
import selectedDisabledIcon from "./assets/selected-disabled.svg";

export function getRadioIcon(
  checked: boolean,
  disabled: boolean,
  hovered: boolean,
): string {
  if (checked && disabled) return selectedDisabledIcon;
  if (checked && hovered) return selectedHoverIcon;
  if (checked) return selectedIcon;
  if (disabled) return defaultDisabledIcon;
  if (hovered) return defaultHoverIcon;
  return defaultIcon;
}
