import type { SelectMenuOption } from "../SelectMenu";

export type SummaryPanelState = "editable" | "staged" | "approved";

export type SummaryApplyScope = "cell" | "holes";

export type SummaryPanelProps = {
  /** Invalid value shown in the header message. */
  invalidValue?: string;
  /** Number of cells containing the invalid value. */
  cellCount?: number;
  /** Number of drill holes containing the invalid value. */
  holeCount?: number;
  /** Replacement value options for the single select. */
  valueOptions?: SelectMenuOption[];
  /** Drill hole options for the multi select (when applying to holes). */
  holeOptions?: SelectMenuOption[];
  /** Initial selected drill hole IDs. */
  defaultSelectedHoles?: string[];
  /** Initial workflow state when the panel mounts or remounts. */
  defaultPanelState?: SummaryPanelState;
  /** Pre-filled staged value when opening in staged or approved state. */
  initialStagedValue?: string;
  /** Controlled collapsed state for the panel content area. */
  collapsed?: boolean;
  /** Uncontrolled initial collapsed state. */
  defaultCollapsed?: boolean;
  /** Called when the panel is collapsed or expanded. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Stretch the panel to fill its parent height instead of a fixed height. */
  fillHeight?: boolean;
  /** Called when the close button is clicked. */
  onClose?: () => void;
  /** Called when the panel workflow state changes (editable, staged, approved). */
  onPanelStateChange?: (state: SummaryPanelState) => void;
  className?: string;
};
