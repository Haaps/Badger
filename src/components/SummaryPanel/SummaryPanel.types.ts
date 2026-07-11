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
  /** Called when the close button is clicked. */
  onClose?: () => void;
  className?: string;
};
