import type { SelectMenuOption } from "../SelectMenu";

/** Correction workflow: pick fix → stage → approve (or revert approved → staged). */
export type SummaryPanelState = "editable" | "staged" | "approved";

export type SummaryApplyScope = "cell" | "holes";

/** Column validation kind — drives resolution UI and error copy. */
export type SummaryValidationType =
  | "list"
  | "text"
  | "boolean"
  | "date"
  | "date-time"
  | "numeric";

/** List, boolean, date, and date-time columns share these error categories. */
export type ListSummaryErrorType = "invalid-value" | "missing-value";

export type BooleanSummaryErrorType = ListSummaryErrorType;

export type DateSummaryErrorType = ListSummaryErrorType;

export type DateTimeSummaryErrorType = ListSummaryErrorType;

export type BooleanValueOption = {
  value: string;
  label: string;
};

/** Text-only errors (character limit vs required empty cells). */
export type TextSummaryErrorType = "exceeded-character-limit" | "value-required";

export type NumericSummaryErrorType =
  | "exceeded-decimal-limit"
  | "missing-value"
  | "invalid-value"
  | "below-min-value"
  | "above-max-value";

export type SummaryErrorType =
  | ListSummaryErrorType
  | TextSummaryErrorType
  | NumericSummaryErrorType;

export type CharacterLimitResolution = "trim-to-limit" | "increase-limit";

export type DecimalLimitResolution =
  | "round-to-limit"
  | "increase-limit"
  | "adjust-manually";

export type SummaryApplyImpact = {
  rowCount: number;
  holeCount: number;
};

export type SummaryPanelProps = {
  /** Validation category that determines how errors are corrected. */
  validationType?: SummaryValidationType;
  /** Validation error category that determines panel copy and correction UI. */
  errorType?: SummaryErrorType;
  /** Invalid value shown in the header message. */
  invalidValue?: string;
  /** Number of cells containing the invalid value. */
  cellCount?: number;
  /** Number of drill holes containing the invalid value. */
  holeCount?: number;
  /** Configured character limit for exceeded-character-limit text errors. */
  characterLimit?: number;
  /** Current entered character count for exceeded-character-limit text errors. */
  enteredCharacterCount?: number;
  /** Cell text that exceeded the character limit. */
  exceededLimitCellText?: string;
  /**
   * Highest entered character count among cells in the selected drill holes.
   * Used to warn when a manually increased limit is still too low.
   */
  maxEnteredCharacterCountInSelection?: number;
  /** Computes max entered character count for the selected drill holes. */
  getMaxEnteredCharacterCountInSelection?: (selectedHoles: string[]) => number | null;
  /** Initial resolution for exceeded-character-limit text errors. */
  defaultCharacterLimitResolution?: CharacterLimitResolution;
  /** Initial new character limit when using increase-limit resolution. */
  defaultNewCharacterLimit?: string;
  /** Configured decimal limit for exceeded-decimal-limit numeric errors. */
  decimalMax?: number;
  /** Current entered decimal count for exceeded-decimal-limit numeric errors. */
  enteredDecimalCount?: number;
  /** Configured minimum value for below-min-value numeric errors. */
  minValue?: number;
  /** Configured maximum value for above-max-value numeric errors. */
  maxValue?: number;
  /**
   * Highest entered decimal count among cells in the selected drill holes.
   * Used to warn when a manually increased decimal limit is still too low.
   */
  maxEnteredDecimalCountInSelection?: number;
  /** Computes max entered decimal count for the selected drill holes. */
  getMaxEnteredDecimalCountInSelection?: (selectedHoles: string[]) => number | null;
  /** Initial resolution for exceeded-decimal-limit numeric errors. */
  defaultDecimalLimitResolution?: DecimalLimitResolution;
  /** Initial new decimal limit when using increase-limit resolution. */
  defaultNewDecimalLimit?: string;
  /** Replacement value options for the single select. */
  valueOptions?: SelectMenuOption[];
  /** Replacement boolean value options shown as radio buttons. */
  booleanValueOptions?: BooleanValueOption[];
  /**
   * Required date format hint shown beside the Date field label (e.g. "yyyy/mm/dd").
   * Defined by the platform column schema. The panel validates input against this format.
   */
  dateFormat?: string;
  /**
   * Required combined date/time format hint beside the Date Time field label
   * (e.g. "yyyy/mm/dd hh:mm:ss"). Defined by the platform column schema.
   */
  dateTimeFormat?: string;
  /** Drill hole options for the multi select (when applying to holes). */
  holeOptions?: SelectMenuOption[];
  /** Initial selected drill hole IDs. */
  defaultSelectedHoles?: string[];
  /** Initial apply scope when the panel mounts or remounts. */
  defaultApplyScope?: SummaryApplyScope;
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
  onPanelStateChange?: (
    state: SummaryPanelState,
    stagedValue?: string,
    applyScope?: SummaryApplyScope,
    selectedHoles?: string[],
  ) => void;
  /** Computes how many cells and holes the current apply action would affect. */
  getApplyImpact?: (
    applyScope: SummaryApplyScope,
    selectedHoles: string[],
    panelState: SummaryPanelState,
  ) => SummaryApplyImpact | null;
  /** Fixed panel height in pixels when fillHeight is false. Defaults to 640. */
  panelHeight?: number;
  className?: string;
};
