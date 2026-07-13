import type { ComponentType } from "react";
import {
  DefaultDisabledIcon,
  DefaultHoverIcon,
  DefaultIcon,
  SelectedDisabledIcon,
  SelectedHoverIcon,
  SelectedIcon,
} from "./icons";

export type RadioIconComponent = ComponentType<{ className?: string }>;

/** Picks the inline SVG icon component for checked/disabled/hover state (see icons/). */
export function getRadioIcon(
  checked: boolean,
  disabled: boolean,
  hovered: boolean,
): RadioIconComponent {
  if (checked && disabled) return SelectedDisabledIcon;
  if (checked && hovered) return SelectedHoverIcon;
  if (checked) return SelectedIcon;
  if (disabled) return DefaultDisabledIcon;
  if (hovered) return DefaultHoverIcon;
  return DefaultIcon;
}
