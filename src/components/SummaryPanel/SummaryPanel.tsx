/**
 * Summary Panel — corrects column validation errors through a three-state workflow:
 * editable (pick a fix) → staged (pending review) → approved (committed).
 *
 * `validationType` + `errorType` select copy and input UI (list select, text area,
 * boolean radios, date field, date/time fields, numeric fields, gaps fields, or character-limit resolution). Apply scope controls whether the
 * fix targets one cell or matching errors across selected drill holes.
 *
 * Omitted props fall back to demo constants from SummaryPanel.demoData so the gallery
 * works without wiring; production apps should pass real counts, values, and options.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Button } from "../Button";
import { MultiSelectMenu } from "../MultiSelectMenu";
import { Radio } from "../Radio";
import { SegmentedControl } from "../SegmentedControl";
import { SingleSelect } from "../SingleSelect";
import { TextAreaField } from "../TextAreaField";
import { TextField } from "../TextField";
import { CloseIcon, SidebarChevronIcon } from "./icons";
import {
  getDateFormatErrorMessage,
  getDateTimeFormatErrorMessage,
  isValidDateForFormat,
  isValidDateTimeForFormat,
} from "./dateFormatValidation";
import {
  computeGapsGap,
  formatGapsGap,
  formatGapsValuesSummary,
  getGapsFieldErrorMessage,
  getGapsStagedValue,
  getGapsSummaryMessage,
  isValidGapsValue,
  parseGapsStagedValue,
} from "./gapsValidation";
import {
  computeOverlap,
  formatOverlap,
  getOverlapsStagedValue,
  getOverlapsSummaryMessage,
  getOverlapsFieldErrorMessage,
  parseOverlapsStagedValue,
} from "./overlapsValidation";
import {
  getDuplicatesEditFieldErrorMessage,
  getDuplicatesStagedDisplayText,
  getDuplicatesStagedValue,
  getDuplicatesSummaryMessage,
  parseDuplicatesStagedValue,
} from "./duplicatesValidation";
import {
  getDuplicatesCrossValidationErrorMessage,
  getGapsCrossValidationErrorMessage,
  isValidDuplicatesEditWithCrossValidation,
  isValidGapsResolutionWithCrossValidation,
} from "./intervalValidation";
import {
  getNumericValidationErrorMessage,
  isValidNumericValue,
  parseNewDecimalLimitValue,
  roundToDecimalLimit,
} from "./numericValidation";
import {
  DEMO_BOOLEAN_CELL_COUNT,
  DEMO_BOOLEAN_HOLE_COUNT,
  DEMO_BOOLEAN_INITIAL_STAGED_VALUE,
  DEMO_BOOLEAN_INVALID_VALUE,
  DEMO_BOOLEAN_VALUE_OPTIONS,
  DEMO_DATE_CELL_COUNT,
  DEMO_DATE_FORMAT,
  DEMO_DATE_HOLE_COUNT,
  DEMO_DATE_INITIAL_STAGED_VALUE,
  DEMO_DATE_INVALID_VALUE,
  DEMO_DATE_TIME_CELL_COUNT,
  DEMO_DATE_TIME_FORMAT,
  DEMO_DATE_TIME_HOLE_COUNT,
  DEMO_DATE_TIME_INITIAL_STAGED_VALUE,
  DEMO_DATE_TIME_INVALID_VALUE,
  DEMO_CELL_COUNT,
  DEMO_CHARACTER_LIMIT,
  DEMO_DEFAULT_SELECTED_HOLES,
  DEMO_ENTERED_CHARACTER_COUNT,
  DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
  DEMO_GAPS_CELL_COUNT,
  DEMO_GAPS_FROM_LABEL,
  DEMO_GAPS_FROM_VALUE,
  DEMO_GAPS_HOLE_COUNT,
  DEMO_GAPS_TO_LABEL,
  DEMO_GAPS_TO_VALUE,
  DEMO_DUPLICATES_FROM_LABEL,
  DEMO_DUPLICATES_FROM_VALUE,
  DEMO_DUPLICATES_HOLE_COUNT,
  DEMO_DUPLICATES_ROW_COUNT,
  DEMO_DUPLICATES_TO_LABEL,
  DEMO_DUPLICATES_TO_VALUE,
  DEMO_HOLE_COUNT,
  DEMO_HOLE_OPTIONS,
  DEMO_INVALID_VALUE,
  DEMO_OVERLAPS_CELL_COUNT,
  DEMO_OVERLAPS_FROM_LABEL,
  DEMO_OVERLAPS_FROM_VALUE,
  DEMO_OVERLAPS_HOLE_COUNT,
  DEMO_OVERLAPS_TO_LABEL,
  DEMO_OVERLAPS_TO_VALUE,
  DEMO_MAX_ENTERED_CHARACTER_COUNT_IN_SELECTION,
  DEMO_MISSING_CELL_COUNT,
  DEMO_MISSING_HOLE_COUNT,
  DEMO_TEXT_CELL_COUNT,
  DEMO_TEXT_HOLE_COUNT,
  DEMO_TEXT_INITIAL_STAGED_VALUE,
  DEMO_TEXT_INVALID_VALUE,
  DEMO_VALUE_OPTIONS,
  DEMO_DECIMAL_MAX,
  DEMO_DEFAULT_NEW_DECIMAL_LIMIT,
  DEMO_ENTERED_DECIMAL_COUNT,
  DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
  DEMO_NUMERIC_ABOVE_MAX_CELL_COUNT,
  DEMO_NUMERIC_ABOVE_MAX_VALUE,
  DEMO_NUMERIC_BELOW_MIN_CELL_COUNT,
  DEMO_NUMERIC_BELOW_MIN_VALUE,
  DEMO_NUMERIC_CELL_COUNT,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_CELL_COUNT,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_CELL_COUNT,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_CELL_COUNT,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_VALUE,
  DEMO_NUMERIC_HOLE_COUNT,
  DEMO_NUMERIC_INITIAL_STAGED_VALUE,
  DEMO_NUMERIC_INVALID_VALUE,
  DEMO_NUMERIC_MAX_VALUE,
  DEMO_NUMERIC_MIN_VALUE,
  DEMO_NUMERIC_MISSING_CELL_COUNT,
  DEMO_NUMERIC_MISSING_HOLE_COUNT,
  createGeologicalSummaryText,
} from "./SummaryPanel.demoData";
import type { SelectMenuOption } from "../SelectMenu";
import type {
  BooleanValueOption,
  CharacterLimitResolution,
  DecimalLimitResolution,
  DuplicateResolution,
  DuplicatesSummaryErrorType,
  GapsSummaryErrorType,
  OverlapsSummaryErrorType,
  ListSummaryErrorType,
  NumericSummaryErrorType,
  SummaryApplyImpact,
  SummaryApplyScope,
  SummaryErrorType,
  SummaryPanelProps,
  SummaryPanelState,
  SummaryValidationType,
  TextSummaryErrorType,
} from "./SummaryPanel.types";
import styles from "./SummaryPanel.module.css";

const APPLY_SCOPE_OPTIONS = [
  { value: "cell", label: "This cell only" },
  { value: "holes", label: "Apply to drill holes" },
] as const;

const CHARACTER_LIMIT_RESOLUTION_OPTIONS = [
  { value: "trim-to-limit", label: "Trim to existing character limit" },
  { value: "increase-limit", label: "Increase character limit manually" },
] as const satisfies ReadonlyArray<{
  value: CharacterLimitResolution;
  label: string;
}>;

const DECIMAL_LIMIT_RESOLUTION_OPTIONS = [
  { value: "round-to-limit", label: "Round to current decimal limit" },
  { value: "increase-limit", label: "Increase max decimal limit" },
  { value: "adjust-manually", label: "Adjust value manually" },
] as const satisfies ReadonlyArray<{
  value: DecimalLimitResolution;
  label: string;
}>;

const DUPLICATE_RESOLUTION_OPTIONS = [
  { value: "delete-row", label: "Delete this row" },
  { value: "edit-manually", label: "Edit values manually" },
] as const satisfies ReadonlyArray<{
  value: DuplicateResolution;
  label: string;
}>;

type PanelCopy = {
  editableTitle: string;
  helperText?: string;
};

const LIST_ERROR_COPY: Record<ListSummaryErrorType, PanelCopy> = {
  "invalid-value": {
    editableTitle: "Invalid list value",
    helperText: "Choose or create a valid value to replace it.",
  },
  "missing-value": {
    editableTitle: "Value required",
    helperText: "Choose or create a valid value.",
  },
};

const TEXT_ERROR_COPY: Record<TextSummaryErrorType, PanelCopy> = {
  "exceeded-character-limit": {
    editableTitle: "",
  },
  "value-required": {
    editableTitle: "Value required",
  },
};

const BOOLEAN_ERROR_COPY: Record<ListSummaryErrorType, PanelCopy> = {
  "invalid-value": {
    editableTitle: "Invalid Boolean Value",
  },
  "missing-value": {
    editableTitle: "Value required",
  },
};

const GAPS_ERROR_COPY: Record<GapsSummaryErrorType, PanelCopy> = {
  "gaps-not-allowed": {
    editableTitle: "Gaps not allowed",
  },
};

const DUPLICATES_ERROR_COPY: Record<DuplicatesSummaryErrorType, PanelCopy> = {
  "duplicates-not-allowed": {
    editableTitle: "Duplicates not allowed",
  },
};

const OVERLAPS_ERROR_COPY: Record<OverlapsSummaryErrorType, PanelCopy> = {
  "overlaps-not-allowed": {
    editableTitle: "Overlaps not allowed",
  },
};

const DATE_ERROR_COPY: Record<ListSummaryErrorType, PanelCopy> = {
  "invalid-value": {
    editableTitle: "Invalid Date Value",
    helperText: "Enter a valid date to replace it.",
  },
  "missing-value": {
    editableTitle: "Value required",
    helperText: "Enter a date.",
  },
};

const DATE_TIME_ERROR_COPY: Record<ListSummaryErrorType, PanelCopy> = {
  "invalid-value": {
    editableTitle: "Invalid Date/Time Value",
    helperText: "Enter a valid date and time to replace it.",
  },
  "missing-value": {
    editableTitle: "Value required",
    helperText: "Enter a date and time.",
  },
};

const NUMERIC_ERROR_COPY: Record<NumericSummaryErrorType, PanelCopy> = {
  "exceeded-decimal-limit": {
    editableTitle: "",
  },
  "exceeded-decimal-below-min": {
    editableTitle: "",
  },
  "exceeded-decimal-above-max": {
    editableTitle: "",
  },
  "missing-value": {
    editableTitle: "Value required",
  },
  "invalid-value": {
    editableTitle: "Invalid value: must be numeric",
  },
  "below-min-value": {
    editableTitle: "",
  },
  "above-max-value": {
    editableTitle: "",
  },
};

function isBooleanValidation(validationType: SummaryValidationType) {
  return validationType === "boolean";
}

function isGapsValidation(validationType: SummaryValidationType) {
  return validationType === "gaps";
}

function isOverlapsValidation(validationType: SummaryValidationType) {
  return validationType === "overlaps";
}

function isIntervalBoundaryValidation(validationType: SummaryValidationType) {
  return isGapsValidation(validationType) || isOverlapsValidation(validationType);
}

function isDuplicatesValidation(validationType: SummaryValidationType) {
  return validationType === "duplicates";
}

function isNumericValidation(validationType: SummaryValidationType) {
  return validationType === "numeric";
}

function getPanelCopy(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
): PanelCopy {
  if (validationType === "boolean") {
    return BOOLEAN_ERROR_COPY[errorType as ListSummaryErrorType];
  }

  if (validationType === "gaps") {
    return GAPS_ERROR_COPY[errorType as GapsSummaryErrorType];
  }

  if (validationType === "duplicates") {
    return DUPLICATES_ERROR_COPY[errorType as DuplicatesSummaryErrorType];
  }

  if (validationType === "overlaps") {
    return OVERLAPS_ERROR_COPY[errorType as OverlapsSummaryErrorType];
  }

  if (validationType === "date") {
    return DATE_ERROR_COPY[errorType as ListSummaryErrorType];
  }

  if (validationType === "date-time") {
    return DATE_TIME_ERROR_COPY[errorType as ListSummaryErrorType];
  }

  if (validationType === "list") {
    return LIST_ERROR_COPY[errorType as ListSummaryErrorType];
  }

  if (validationType === "numeric") {
    return NUMERIC_ERROR_COPY[errorType as NumericSummaryErrorType];
  }

  return TEXT_ERROR_COPY[errorType as TextSummaryErrorType];
}

function isValueRequiredError(errorType: SummaryErrorType) {
  return errorType === "missing-value" || errorType === "value-required";
}

function isTextValueRequiredError(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
) {
  return validationType === "text" && errorType === "value-required";
}

function isExceededCharacterLimitError(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
) {
  return validationType === "text" && errorType === "exceeded-character-limit";
}

function isNumericDecimalLimitOnlyError(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
) {
  return validationType === "numeric" && errorType === "exceeded-decimal-limit";
}

function isNumericDecimalLimitResolutionError(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
) {
  return isNumericDecimalLimitOnlyError(validationType, errorType);
}

function isNumericMissingValueError(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
) {
  return validationType === "numeric" && errorType === "missing-value";
}

// Character-limit fixes encode resolution in the staged value string passed to
// onPanelStateChange: "trim-to-limit" or "increase-limit:{digits}".
function getExceededLimitStagedValue(
  resolution: CharacterLimitResolution,
  newLimit: string,
) {
  if (resolution === "trim-to-limit") {
    return "trim-to-limit";
  }

  return `increase-limit:${newLimit.trim()}`;
}

function parseExceededLimitStagedValue(value: string): {
  resolution: CharacterLimitResolution;
  newLimit: string;
} {
  if (value.startsWith("increase-limit:")) {
    return {
      resolution: "increase-limit",
      newLimit: value.slice("increase-limit:".length),
    };
  }

  return {
    resolution: value as CharacterLimitResolution,
    newLimit: "",
  };
}

function getOriginalExceededLimitCellText(
  exceededLimitCellText: string | undefined,
  enteredCharacterCount: number,
) {
  const declaredCount =
    enteredCharacterCount > 0 ? enteredCharacterCount : DEMO_ENTERED_CHARACTER_COUNT;

  if (
    exceededLimitCellText &&
    exceededLimitCellText.length === declaredCount
  ) {
    return exceededLimitCellText;
  }

  return createGeologicalSummaryText(declaredCount);
}

function getExceededLimitCommittedDisplayText(
  stagedValue: string,
  columnLimit: number,
  originalText: string,
) {
  return getExceededLimitResultText(stagedValue, columnLimit, originalText);
}

function getExceededLimitPreviewDisplayText(
  resolution: CharacterLimitResolution,
  newLimit: string,
  columnLimit: number,
  originalText: string,
  committedStagedValue: string,
) {
  if (
    resolution === "increase-limit" &&
    parseNewCharacterLimitValue(newLimit) === null
  ) {
    return getExceededLimitCommittedDisplayText(
      committedStagedValue,
      columnLimit,
      originalText,
    );
  }

  return getExceededLimitResultFromResolution(
    resolution,
    newLimit,
    columnLimit,
    originalText,
  );
}

function getExceededLimitStagedAsDisplayText(
  isApproved: boolean,
  isStaged: boolean,
  hasStagedChanges: boolean,
  stagedValue: string,
  resolution: CharacterLimitResolution,
  newLimit: string,
  columnLimit: number,
  originalText: string,
) {
  if (isApproved || (isStaged && !hasStagedChanges)) {
    return getExceededLimitCommittedDisplayText(stagedValue, columnLimit, originalText);
  }

  if (isStaged) {
    return getExceededLimitPreviewDisplayText(
      resolution,
      newLimit,
      columnLimit,
      originalText,
      stagedValue,
    );
  }

  return "";
}

function getExceededLimitResultFromResolution(
  resolution: CharacterLimitResolution,
  newLimit: string,
  columnLimit: number,
  originalText: string,
) {
  const originalLength = originalText.length;

  if (resolution === "trim-to-limit") {
    if (columnLimit >= originalLength) {
      return originalText;
    }

    return originalText.slice(0, columnLimit);
  }

  const parsedLimit = parseNewCharacterLimitValue(newLimit);
  if (parsedLimit === null) {
    return originalText;
  }

  if (parsedLimit >= originalLength) {
    return originalText;
  }

  return originalText.slice(0, parsedLimit);
}

export function getExceededLimitResultText(
  resolutionValue: string,
  columnLimit: number,
  originalText: string,
) {
  const { resolution, newLimit } = parseExceededLimitStagedValue(resolutionValue);

  return getExceededLimitResultFromResolution(
    resolution,
    newLimit,
    columnLimit,
    originalText,
  );
}

function syncExceededLimitResolutionState(
  resolutionValue: string,
  setResolution: (resolution: CharacterLimitResolution) => void,
  setNewLimit: (newLimit: string) => void,
) {
  const parsed = parseExceededLimitStagedValue(resolutionValue);
  setResolution(parsed.resolution);
  setNewLimit(parsed.newLimit);
}

function getAdjustValueLabel(label: string) {
  return `Adjust ${label} Value`;
}

function syncDuplicatesResolutionState(
  resolutionValue: string,
  setResolution: (resolution: DuplicateResolution) => void,
  setToValue: (value: string) => void,
  setFromValue: (value: string) => void,
  fallbackToValue: string,
  fallbackFromValue: string,
) {
  const parsed = parseDuplicatesStagedValue(resolutionValue);
  setResolution(parsed.resolution);
  if (parsed.resolution === "edit-manually") {
    setToValue(parsed.toValue);
    setFromValue(parsed.fromValue);
  } else {
    setToValue(fallbackToValue);
    setFromValue(fallbackFromValue);
  }
}

function canCommitExceededLimitResolution(
  resolution: CharacterLimitResolution,
  newLimit: string,
) {
  if (resolution === "trim-to-limit") {
    return true;
  }

  return newLimit.trim() !== "";
}

function parseNewCharacterLimitValue(newLimit: string) {
  const parsedLimit = Number.parseInt(newLimit.trim(), 10);
  return Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : null;
}

function resolveMaxEnteredCharacterCountInSelection(
  selectedHoles: string[],
  maxEnteredCharacterCountInSelection: number | undefined,
  getMaxEnteredCharacterCountInSelection:
    | ((selectedHoles: string[]) => number | null)
    | undefined,
) {
  const resolvedMax =
    getMaxEnteredCharacterCountInSelection?.(selectedHoles) ??
    maxEnteredCharacterCountInSelection ??
    DEMO_MAX_ENTERED_CHARACTER_COUNT_IN_SELECTION;

  return resolvedMax > 0 ? resolvedMax : null;
}

function shouldShowCharacterLimitTrimWarning(
  applyScope: SummaryApplyScope,
  resolution: CharacterLimitResolution,
  newLimit: string,
  selectedHoles: string[],
  maxEnteredCharacterCountInSelection: number | undefined,
  getMaxEnteredCharacterCountInSelection:
    | ((selectedHoles: string[]) => number | null)
    | undefined,
) {
  if (applyScope !== "holes" || resolution !== "increase-limit") {
    return false;
  }

  const parsedLimit = parseNewCharacterLimitValue(newLimit);
  if (parsedLimit === null) {
    return false;
  }

  const maxInSelection = resolveMaxEnteredCharacterCountInSelection(
    selectedHoles,
    maxEnteredCharacterCountInSelection,
    getMaxEnteredCharacterCountInSelection,
  );

  if (maxInSelection === null) {
    return false;
  }

  return parsedLimit < maxInSelection;
}

function getCharacterLimitTrimWarningMessage(newLimit: string) {
  const parsedLimit = parseNewCharacterLimitValue(newLimit);
  if (parsedLimit === null) {
    return "";
  }

  return `Some cells content still exceed ${parsedLimit} characters and will be trimmed automatically when this change is staged.`;
}

// Decimal-limit fixes encode resolution in the staged value string:
// "round-to-limit", "increase-limit:{digits}", or a manual numeric value.
function getExceededDecimalLimitStagedValue(
  resolution: DecimalLimitResolution,
  newLimit: string,
  manualValue: string,
) {
  if (resolution === "round-to-limit") {
    return resolution;
  }

  if (resolution === "increase-limit") {
    return `increase-limit:${newLimit.trim()}`;
  }

  return manualValue.trim();
}

function parseExceededDecimalLimitStagedValue(value: string): {
  resolution: DecimalLimitResolution;
  newLimit: string;
  manualValue: string;
} {
  if (value.startsWith("increase-limit:")) {
    return {
      resolution: "increase-limit",
      newLimit: value.slice("increase-limit:".length),
      manualValue: "",
    };
  }

  if (value === "round-to-limit") {
    return {
      resolution: value,
      newLimit: "",
      manualValue: "",
    };
  }

  return {
    resolution: "adjust-manually",
    newLimit: "",
    manualValue: value,
  };
}

function getExceededDecimalLimitResultFromResolution(
  resolution: DecimalLimitResolution,
  resolutionInput: string,
  decimalMax: number,
  originalValue: string,
) {
  if (resolution === "round-to-limit") {
    return roundToDecimalLimit(originalValue, decimalMax);
  }

  if (resolution === "increase-limit") {
    const parsedLimit = parseNewDecimalLimitValue(resolutionInput);
    if (parsedLimit === null) {
      return originalValue;
    }

    return roundToDecimalLimit(originalValue, parsedLimit);
  }

  return resolutionInput.trim() || originalValue;
}

export function getExceededDecimalLimitResultText(
  resolutionValue: string,
  decimalMax: number,
  originalValue: string,
) {
  const parsed = parseExceededDecimalLimitStagedValue(resolutionValue);

  return getExceededDecimalLimitResultFromResolution(
    parsed.resolution,
    parsed.resolution === "adjust-manually" ? parsed.manualValue : parsed.newLimit,
    decimalMax,
    originalValue,
  );
}

function getExceededDecimalLimitPreviewDisplayText(
  resolution: DecimalLimitResolution,
  newLimit: string,
  manualValue: string,
  decimalMax: number,
  originalValue: string,
  committedStagedValue: string,
) {
  if (
    resolution === "increase-limit" &&
    parseNewDecimalLimitValue(newLimit) === null
  ) {
    return getExceededDecimalLimitResultText(
      committedStagedValue,
      decimalMax,
      originalValue,
    );
  }

  return getExceededDecimalLimitResultFromResolution(
    resolution,
    resolution === "adjust-manually" ? manualValue : newLimit,
    decimalMax,
    originalValue,
  );
}

function getExceededDecimalLimitStagedAsDisplayText(
  isApproved: boolean,
  isStaged: boolean,
  hasStagedChanges: boolean,
  stagedValue: string,
  resolution: DecimalLimitResolution,
  newLimit: string,
  manualValue: string,
  decimalMax: number,
  originalValue: string,
) {
  if (isApproved || (isStaged && !hasStagedChanges)) {
    return getExceededDecimalLimitResultText(
      stagedValue,
      decimalMax,
      originalValue,
    );
  }

  if (isStaged) {
    return getExceededDecimalLimitPreviewDisplayText(
      resolution,
      newLimit,
      manualValue,
      decimalMax,
      originalValue,
      stagedValue,
    );
  }

  return "";
}

function syncExceededDecimalLimitResolutionState(
  resolutionValue: string,
  setResolution: (resolution: DecimalLimitResolution) => void,
  setNewLimit: (newLimit: string) => void,
  setManualValue: (manualValue: string) => void,
) {
  const parsed = parseExceededDecimalLimitStagedValue(resolutionValue);
  setResolution(parsed.resolution);
  setNewLimit(parsed.newLimit);
  setManualValue(parsed.manualValue);
}

function canCommitExceededDecimalLimitResolution(
  resolution: DecimalLimitResolution,
  newLimit: string,
  manualValue: string,
  decimalMax: number,
) {
  if (resolution === "round-to-limit") {
    return true;
  }

  if (resolution === "increase-limit") {
    return parseNewDecimalLimitValue(newLimit) !== null;
  }

  return isValidNumericValue(manualValue, { decimalMax });
}

function resolveMaxEnteredDecimalCountInSelection(
  selectedHoles: string[],
  maxEnteredDecimalCountInSelection: number | undefined,
  getMaxEnteredDecimalCountInSelection:
    | ((selectedHoles: string[]) => number | null)
    | undefined,
) {
  const resolvedMax =
    getMaxEnteredDecimalCountInSelection?.(selectedHoles) ??
    maxEnteredDecimalCountInSelection ??
    DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION;

  return resolvedMax > 0 ? resolvedMax : null;
}

function shouldShowDecimalLimitRoundWarning(
  applyScope: SummaryApplyScope,
  resolution: DecimalLimitResolution,
  newLimit: string,
  selectedHoles: string[],
  maxEnteredDecimalCountInSelection: number | undefined,
  getMaxEnteredDecimalCountInSelection:
    | ((selectedHoles: string[]) => number | null)
    | undefined,
) {
  if (applyScope !== "holes" || resolution !== "increase-limit") {
    return false;
  }

  const parsedLimit = parseNewDecimalLimitValue(newLimit);
  if (parsedLimit === null) {
    return false;
  }

  const maxInSelection = resolveMaxEnteredDecimalCountInSelection(
    selectedHoles,
    maxEnteredDecimalCountInSelection,
    getMaxEnteredDecimalCountInSelection,
  );

  if (maxInSelection === null) {
    return false;
  }

  return parsedLimit < maxInSelection;
}

function getDecimalLimitRoundWarningMessage(newLimit: string) {
  const parsedLimit = parseNewDecimalLimitValue(newLimit);
  if (parsedLimit === null) {
    return "";
  }

  return `Some cells still exceed ${parsedLimit} decimal places and will be rounded automatically when this change is staged.`;
}

function getNumericInputValidationOptions(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
  minValue: number,
  maxValue: number,
  decimalMax: number,
) {
  if (!isNumericValidation(validationType)) {
    return {};
  }

  const options = { decimalMax };

  if (errorType === "below-min-value" || errorType === "exceeded-decimal-below-min") {
    return { ...options, minValue };
  }

  if (errorType === "above-max-value" || errorType === "exceeded-decimal-above-max") {
    return { ...options, maxValue };
  }

  return options;
}

type ValueInputMode = "select" | "custom";

function StagedIcon() {
  return (
    <svg
      className={styles.stagedClockIcon}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7ZM7.875 3.5266C7.875 3.29454 7.78281 3.07198 7.61872 2.90788C7.45462 2.74379 7.23206 2.6516 7 2.6516C6.76794 2.6516 6.54538 2.74379 6.38128 2.90788C6.21719 3.07198 6.125 3.29454 6.125 3.5266V7C6.125 7.483 6.517 7.875 7 7.875H9.8C10.0321 7.875 10.2546 7.78281 10.4187 7.61872C10.5828 7.45462 10.675 7.23206 10.675 7C10.675 6.76794 10.5828 6.54538 10.4187 6.38128C10.2546 6.21719 10.0321 6.125 9.8 6.125H7.875V3.5266Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ApprovedIcon() {
  return (
    <svg
      className={styles.approvedCheckIcon}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM10.5028 5.21852C10.7615 4.87262 10.7093 4.37878 10.3856 4.09346C10.0619 3.80814 9.56808 3.86035 9.28276 4.18403L6.00765 8.04716L4.70078 6.76111C4.36841 6.43469 3.87664 6.43814 3.54844 6.76877C3.22024 7.0994 3.22369 7.59117 3.55606 7.91759L5.46622 9.79433C5.75154 10.0715 6.20549 10.0681 6.48714 9.7864L10.5028 5.21852Z"
        fill="currentColor"
      />
    </svg>
  );
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getDefaultApplyImpact(
  applyScope: SummaryApplyScope,
  selectedHoles: string[],
  cellCount: number,
  holeCount: number,
): SummaryApplyImpact {
  if (applyScope === "cell") {
    return { rowCount: 1, holeCount: 0 };
  }

  const selectedHoleCount = selectedHoles.length;
  if (selectedHoleCount === 0) {
    return { rowCount: 0, holeCount: 0 };
  }

  const rowsPerHole = holeCount > 0 ? cellCount / holeCount : cellCount;
  const rowCount = Math.max(1, Math.round(rowsPerHole * selectedHoleCount));

  return {
    rowCount,
    holeCount: selectedHoleCount,
  };
}

function getFooterNote(
  applyScope: SummaryApplyScope,
  panelState: SummaryPanelState,
  applyImpact: SummaryApplyImpact | null | undefined,
) {
  if (panelState === "approved" || applyScope === "cell") {
    return "Change will affect this cell only.";
  }

  if (!applyImpact || applyImpact.rowCount === 0) {
    return "Change will affect this cell only.";
  }

  return `Change will affect ${formatCountLabel(applyImpact.rowCount, "row", "rows")} across ${formatCountLabel(applyImpact.holeCount, "hole", "holes")}.`;
}

function getTitle(
  panelState: SummaryPanelState,
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
  characterLimit: number,
  enteredCharacterCount: number,
  decimalMax: number,
  enteredDecimalCount: number,
  minValue: number,
  maxValue: number,
  invalidValue: string,
) {
  switch (panelState) {
    case "staged":
      return "Staged update";
    case "approved":
      return "Approved update";
    default:
      if (isExceededCharacterLimitError(validationType, errorType)) {
        return `${characterLimit} character limit: ${enteredCharacterCount} entered`;
      }
      if (errorType === "exceeded-decimal-below-min") {
        return `Above decimal max of ${decimalMax} and below minimum value of ${minValue}`;
      }
      if (errorType === "exceeded-decimal-above-max") {
        return `Above decimal max of ${decimalMax} and above maximum value of ${maxValue}`;
      }
      if (isNumericDecimalLimitResolutionError(validationType, errorType)) {
        return `${decimalMax} decimal max: ${enteredDecimalCount} entered`;
      }
      if (errorType === "below-min-value") {
        return `${invalidValue} entered: ${minValue} min`;
      }
      if (errorType === "above-max-value") {
        return `${invalidValue} entered: ${maxValue} max`;
      }
      return getPanelCopy(validationType, errorType).editableTitle;
  }
}

function isSingleCellMessage(cellCount: number) {
  return cellCount <= 1;
}

function getSummaryMessage(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
  invalidValue: string,
  cellCount: number,
  holeCount: number,
) {
  if (validationType === "numeric") {
    switch (errorType) {
      case "exceeded-decimal-limit":
        if (isSingleCellMessage(cellCount)) {
          return "1 cell in this column exceeds the decimal max.";
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column exceed the decimal max.`;
      case "exceeded-decimal-below-min":
        if (isSingleCellMessage(cellCount)) {
          return `\u201C${invalidValue}\u201D exceeds the decimal max and is below the min value`;
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column exceed the decimal max and are below the min value`;
      case "exceeded-decimal-above-max":
        if (isSingleCellMessage(cellCount)) {
          return `\u201C${invalidValue}\u201D exceeds the decimal max and is above the max value`;
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column exceed the decimal max and are above the max value`;
      case "missing-value":
        if (isSingleCellMessage(cellCount)) {
          return "This cell is missing a value.";
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column are missing values.`;
      case "invalid-value":
        if (isSingleCellMessage(cellCount)) {
          return `\u201C${invalidValue}\u201D appears in this column.`;
        }
        return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "field", "fields")} within this column.`;
      case "below-min-value":
        if (isSingleCellMessage(cellCount)) {
          return `\u201C${invalidValue}\u201D is below the min value`;
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column are identical and below the min value`;
      case "above-max-value":
        if (isSingleCellMessage(cellCount)) {
          return `\u201C${invalidValue}\u201D is above the max value`;
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column are identical and above the max value`;
      default:
        break;
    }
  }

  if (validationType === "boolean") {
    if (errorType === "missing-value") {
      if (isSingleCellMessage(cellCount)) {
        return "This cell is missing a value.";
      }
      return `${formatCountLabel(cellCount, "cell", "cells")} are missing values across ${formatCountLabel(holeCount, "hole", "holes")}.`;
    }

    if (isSingleCellMessage(cellCount)) {
      return `\u201C${invalidValue}\u201D appears in this cell.`;
    }

    return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "cell", "cells")} across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (validationType === "date" || validationType === "date-time") {
    if (errorType === "missing-value") {
      if (isSingleCellMessage(cellCount)) {
        return "This cell is missing a value.";
      }
      return `${formatCountLabel(cellCount, "cell", "cells")} are missing values across ${formatCountLabel(holeCount, "hole", "holes")}.`;
    }

    if (isSingleCellMessage(cellCount)) {
      return `\u201C${invalidValue}\u201D appears in this cell.`;
    }

    return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "cell", "cells")} across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (validationType === "list") {
    if (errorType === "missing-value") {
      if (isSingleCellMessage(cellCount)) {
        return "This cell is missing a value.";
      }
      return "This column requires values in all fields.";
    }

    if (isSingleCellMessage(cellCount)) {
      return `\u201C${invalidValue}\u201D appears in this cell.`;
    }

    return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "cell", "cells")} across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (errorType === "missing-value") {
    if (isSingleCellMessage(cellCount)) {
      return "This cell is missing a value.";
    }
    return "This column requires values in all fields.";
  }

  if (errorType === "value-required") {
    if (isSingleCellMessage(cellCount)) {
      return "This cell is missing a value.";
    }
    return `${formatCountLabel(cellCount, "cell", "cells")} in this column are missing values across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (isExceededCharacterLimitError(validationType, errorType)) {
    if (isSingleCellMessage(cellCount)) {
      return "1 cell in this column exceeds the character limit.";
    }
    return `${formatCountLabel(cellCount, "cell", "cells")} in this column exceed the character limit across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (isSingleCellMessage(cellCount)) {
    return `\u201C${invalidValue}\u201D appears in this cell.`;
  }

  return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "cell", "cells")} across ${formatCountLabel(holeCount, "hole", "holes")}.`;
}

function getPreviousValueLabel(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
  invalidValue: string,
) {
  if (errorType === "missing-value") {
    return validationType === "list" ||
      validationType === "boolean" ||
      validationType === "date" ||
      validationType === "date-time" ||
      validationType === "numeric"
      ? "(no value)"
      : "";
  }

  if (errorType === "value-required") {
    return "";
  }

  return invalidValue;
}

function resolveDisplayValue(value: string, options: SelectMenuOption[]) {
  if (!value) return "";
  const option = options.find((item) => item.value === value);
  if (option && typeof option.label === "string") {
    return option.label;
  }
  return value;
}

function resolveBooleanDisplayValue(value: string, options: BooleanValueOption[]) {
  if (!value) return "";
  const option = options.find((item) => item.value === value);
  return option?.label ?? value;
}

type StatusDetailsBannerProps = {
  variant: "staged" | "approved";
  expanded: boolean;
  onToggle: () => void;
  stagedAsHeading: string;
  stagedAsText: string;
  previouslyText: string;
  quoteValues?: boolean;
};

function StatusDetailsBanner({
  variant,
  expanded,
  onToggle,
  stagedAsHeading,
  stagedAsText,
  previouslyText,
  quoteValues = true,
}: StatusDetailsBannerProps) {
  const isStaged = variant === "staged";
  const bannerClassName = isStaged
    ? `${styles.statusBanner} ${styles.statusBannerStaged}`
    : `${styles.statusBanner} ${styles.statusBannerApproved}`;
  const iconClassName = isStaged
    ? `${styles.statusIcon} ${styles.statusIconStaged}`
    : `${styles.statusIcon} ${styles.statusIconApproved}`;
  const toggleLabel = expanded
    ? isStaged
      ? "Hide staged details"
      : "Hide approved details"
    : isStaged
      ? "Show staged details"
      : "Show approved details";

  return (
    <div className={bannerClassName}>
      <span className={iconClassName}>{isStaged ? <StagedIcon /> : <ApprovedIcon />}</span>
      <div className={styles.statusBannerBody}>
        <button type="button" className={styles.statusLink} onClick={onToggle}>
          {toggleLabel}
        </button>
        {expanded && (
          <div className={styles.statusDetails}>
            <div>
              <p className={styles.statusDetailsHeading}>{stagedAsHeading}</p>
              <p className={styles.statusDetailsValue}>
                {quoteValues ? `\u201C${stagedAsText}\u201D` : stagedAsText}
              </p>
            </div>
            <div>
              <p className={styles.statusDetailsHeading}>PREVIOUSLY</p>
              <p className={styles.statusDetailsValue}>
                {quoteValues ? `\u201C${previouslyText}\u201D` : previouslyText}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SummaryPanel({
  validationType = "list",
  errorType = "invalid-value",
  invalidValue: invalidValueProp,
  cellCount: cellCountProp,
  holeCount: holeCountProp,
  characterLimit: characterLimitProp,
  enteredCharacterCount: enteredCharacterCountProp,
  exceededLimitCellText: exceededLimitCellTextProp,
  maxEnteredCharacterCountInSelection: maxEnteredCharacterCountInSelectionProp,
  getMaxEnteredCharacterCountInSelection,
  defaultCharacterLimitResolution = "trim-to-limit",
  defaultNewCharacterLimit = "",
  decimalMax: decimalMaxProp,
  enteredDecimalCount: enteredDecimalCountProp,
  minValue: minValueProp,
  maxValue: maxValueProp,
  maxEnteredDecimalCountInSelection: maxEnteredDecimalCountInSelectionProp,
  getMaxEnteredDecimalCountInSelection,
  defaultDecimalLimitResolution: defaultDecimalLimitResolutionProp,
  defaultNewDecimalLimit = "",
  valueOptions = DEMO_VALUE_OPTIONS,
  booleanValueOptions = DEMO_BOOLEAN_VALUE_OPTIONS,
  toValue: toValueProp,
  fromValue: fromValueProp,
  toLabel: toLabelProp,
  fromLabel: fromLabelProp,
  gapsSelectedField = "from",
  defaultDuplicateResolution = "delete-row",
  intervalCrossValidation,
  dateFormat: dateFormatProp,
  dateTimeFormat: dateTimeFormatProp,
  holeOptions = DEMO_HOLE_OPTIONS,
  defaultSelectedHoles = DEMO_DEFAULT_SELECTED_HOLES,
  defaultApplyScope = "cell",
  defaultPanelState = "editable",
  initialStagedValue: initialStagedValueProp,
  collapsed: collapsedProp,
  defaultCollapsed = true,
  onCollapsedChange,
  fillHeight = false,
  onClose,
  onPanelStateChange,
  getApplyImpact,
  className,
  panelHeight = 640,
}: SummaryPanelProps) {
  // Demo fallbacks — see module comment; omit these props only in the gallery.
  const invalidValue =
    invalidValueProp ??
    (validationType === "numeric"
      ? errorType === "exceeded-decimal-limit"
        ? DEMO_NUMERIC_EXCEEDED_DECIMAL_VALUE
        : errorType === "exceeded-decimal-below-min"
          ? DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_VALUE
          : errorType === "exceeded-decimal-above-max"
            ? DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_VALUE
            : errorType === "below-min-value"
          ? DEMO_NUMERIC_BELOW_MIN_VALUE
          : errorType === "above-max-value"
            ? DEMO_NUMERIC_ABOVE_MAX_VALUE
            : errorType === "invalid-value"
              ? DEMO_NUMERIC_INVALID_VALUE
              : DEMO_INVALID_VALUE
      : validationType === "text"
        ? DEMO_TEXT_INVALID_VALUE
        : validationType === "boolean"
          ? DEMO_BOOLEAN_INVALID_VALUE
          : validationType === "date"
            ? DEMO_DATE_INVALID_VALUE
            : validationType === "date-time"
              ? DEMO_DATE_TIME_INVALID_VALUE
              : validationType === "gaps"
                ? DEMO_INVALID_VALUE
                : validationType === "duplicates"
                  ? DEMO_INVALID_VALUE
                  : validationType === "overlaps"
                    ? DEMO_INVALID_VALUE
              : DEMO_INVALID_VALUE);
  const resolvedToValue =
    toValueProp ??
    (validationType === "duplicates"
      ? DEMO_DUPLICATES_TO_VALUE
      : validationType === "overlaps"
        ? DEMO_OVERLAPS_TO_VALUE
        : DEMO_GAPS_TO_VALUE);
  const resolvedFromValue =
    fromValueProp ??
    (validationType === "duplicates"
      ? DEMO_DUPLICATES_FROM_VALUE
      : validationType === "overlaps"
        ? DEMO_OVERLAPS_FROM_VALUE
        : DEMO_GAPS_FROM_VALUE);
  const resolvedToLabel =
    toLabelProp ??
    (validationType === "duplicates"
      ? DEMO_DUPLICATES_TO_LABEL
      : validationType === "overlaps"
        ? DEMO_OVERLAPS_TO_LABEL
        : DEMO_GAPS_TO_LABEL);
  const resolvedFromLabel =
    fromLabelProp ??
    (validationType === "duplicates"
      ? DEMO_DUPLICATES_FROM_LABEL
      : validationType === "overlaps"
        ? DEMO_OVERLAPS_FROM_LABEL
        : DEMO_GAPS_FROM_LABEL);
  const originalGapsValuesRef = useRef({
    toValue: resolvedToValue,
    fromValue: resolvedFromValue,
  });
  const originalGapsValues = originalGapsValuesRef.current;
  const originalDuplicatesValuesRef = useRef({
    toValue: resolvedToValue,
    fromValue: resolvedFromValue,
  });
  const originalDuplicatesValues = originalDuplicatesValuesRef.current;
  const dateFormat = dateFormatProp ?? DEMO_DATE_FORMAT;
  const dateTimeFormat = dateTimeFormatProp ?? DEMO_DATE_TIME_FORMAT;
  const characterLimit = characterLimitProp ?? DEMO_CHARACTER_LIMIT;
  const enteredCharacterCount = enteredCharacterCountProp ?? DEMO_ENTERED_CHARACTER_COUNT;
  const decimalMax = decimalMaxProp ?? DEMO_DECIMAL_MAX;
  const enteredDecimalCount = enteredDecimalCountProp ?? DEMO_ENTERED_DECIMAL_COUNT;
  const minValue = minValueProp ?? DEMO_NUMERIC_MIN_VALUE;
  const maxValue = maxValueProp ?? DEMO_NUMERIC_MAX_VALUE;
  const resolvedDefaultDecimalLimitResolution =
    defaultDecimalLimitResolutionProp ?? "round-to-limit";
  const originalExceededLimitTextRef = useRef(
    getOriginalExceededLimitCellText(
      exceededLimitCellTextProp ?? DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
      enteredCharacterCountProp ?? DEMO_ENTERED_CHARACTER_COUNT,
    ),
  );
  const originalExceededLimitText = originalExceededLimitTextRef.current;
  const cellCount =
    cellCountProp ??
    (validationType === "numeric"
      ? isNumericMissingValueError(validationType, errorType)
        ? DEMO_NUMERIC_MISSING_CELL_COUNT
        : errorType === "exceeded-decimal-limit"
          ? DEMO_NUMERIC_EXCEEDED_DECIMAL_CELL_COUNT
          : errorType === "exceeded-decimal-below-min"
            ? DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_CELL_COUNT
            : errorType === "exceeded-decimal-above-max"
              ? DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_CELL_COUNT
              : errorType === "below-min-value"
            ? DEMO_NUMERIC_BELOW_MIN_CELL_COUNT
            : errorType === "above-max-value"
              ? DEMO_NUMERIC_ABOVE_MAX_CELL_COUNT
              : DEMO_NUMERIC_CELL_COUNT
      : isValueRequiredError(errorType)
        ? DEMO_MISSING_CELL_COUNT
        : validationType === "text"
          ? DEMO_TEXT_CELL_COUNT
          : validationType === "boolean"
            ? DEMO_BOOLEAN_CELL_COUNT
            : validationType === "date"
              ? DEMO_DATE_CELL_COUNT
              : validationType === "date-time"
                ? DEMO_DATE_TIME_CELL_COUNT
                : validationType === "gaps"
                  ? DEMO_GAPS_CELL_COUNT
                  : validationType === "duplicates"
                    ? DEMO_DUPLICATES_ROW_COUNT
                    : validationType === "overlaps"
                      ? DEMO_OVERLAPS_CELL_COUNT
                : DEMO_CELL_COUNT);
  const holeCount =
    holeCountProp ??
    (validationType === "numeric"
      ? isNumericMissingValueError(validationType, errorType)
        ? DEMO_NUMERIC_MISSING_HOLE_COUNT
        : DEMO_NUMERIC_HOLE_COUNT
      : isValueRequiredError(errorType)
        ? DEMO_MISSING_HOLE_COUNT
        : validationType === "text"
          ? DEMO_TEXT_HOLE_COUNT
          : validationType === "boolean"
            ? DEMO_BOOLEAN_HOLE_COUNT
            : validationType === "date"
              ? DEMO_DATE_HOLE_COUNT
              : validationType === "date-time"
                ? DEMO_DATE_TIME_HOLE_COUNT
                : validationType === "gaps"
                  ? DEMO_GAPS_HOLE_COUNT
                  : validationType === "duplicates"
                    ? DEMO_DUPLICATES_HOLE_COUNT
                    : validationType === "overlaps"
                      ? DEMO_OVERLAPS_HOLE_COUNT
                : DEMO_HOLE_COUNT);
  const defaultBooleanValue = booleanValueOptions[0]?.value ?? "";
  const initialStagedValue =
    initialStagedValueProp ??
    (validationType === "numeric"
      ? isNumericDecimalLimitResolutionError(validationType, errorType)
        ? resolvedDefaultDecimalLimitResolution
        : DEMO_NUMERIC_INITIAL_STAGED_VALUE
      : validationType === "text"
        ? isExceededCharacterLimitError(validationType, errorType)
          ? defaultCharacterLimitResolution
          : DEMO_TEXT_INITIAL_STAGED_VALUE
        : validationType === "boolean"
          ? DEMO_BOOLEAN_INITIAL_STAGED_VALUE
          : validationType === "date"
            ? DEMO_DATE_INITIAL_STAGED_VALUE
            : validationType === "date-time"
              ? DEMO_DATE_TIME_INITIAL_STAGED_VALUE
              : validationType === "gaps"
                ? getGapsStagedValue(resolvedToValue, resolvedFromValue)
                : validationType === "overlaps"
                  ? getOverlapsStagedValue(resolvedToValue, resolvedFromValue)
                : validationType === "duplicates"
                  ? getDuplicatesStagedValue(defaultDuplicateResolution, resolvedToValue, resolvedFromValue)
              : "bnd");
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsedControlled = collapsedProp !== undefined;
  const collapsed = isCollapsedControlled ? collapsedProp : internalCollapsed;

  const setCollapsed = (nextCollapsed: boolean) => {
    if (!isCollapsedControlled) {
      setInternalCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  // When opening in staged/approved, seed inputs from initialStagedValue instead of empty.
  const opensInCommittedState =
    defaultPanelState === "staged" || defaultPanelState === "approved";
  const initialGapsValues = opensInCommittedState
    ? validationType === "overlaps"
      ? parseOverlapsStagedValue(initialStagedValue)
      : parseGapsStagedValue(initialStagedValue)
    : { toValue: resolvedToValue, fromValue: resolvedFromValue };
  const initialDuplicatesValues = opensInCommittedState
    ? parseDuplicatesStagedValue(initialStagedValue)
    : {
        resolution: defaultDuplicateResolution,
        toValue: resolvedToValue,
        fromValue: resolvedFromValue,
      };

  const [panelState, setPanelState] = useState<SummaryPanelState>(defaultPanelState);
  const [valueInputMode, setValueInputMode] = useState<ValueInputMode>("select");
  const [selectedValue, setSelectedValue] = useState(
    opensInCommittedState
      ? initialStagedValue
      : validationType === "boolean"
        ? defaultBooleanValue
        : "",
  );
  const [textValue, setTextValue] = useState(
    opensInCommittedState ? initialStagedValue : "",
  );
  const [gapsToValue, setGapsToValue] = useState(initialGapsValues.toValue);
  const [gapsFromValue, setGapsFromValue] = useState(initialGapsValues.fromValue);
  const [duplicateResolution, setDuplicateResolution] = useState<DuplicateResolution>(
    initialDuplicatesValues.resolution,
  );
  const [duplicatesToValue, setDuplicatesToValue] = useState(
    initialDuplicatesValues.resolution === "edit-manually"
      ? initialDuplicatesValues.toValue
      : resolvedToValue,
  );
  const [duplicatesFromValue, setDuplicatesFromValue] = useState(
    initialDuplicatesValues.resolution === "edit-manually"
      ? initialDuplicatesValues.fromValue
      : resolvedFromValue,
  );
  const [customValue, setCustomValue] = useState("");
  const [stagedValue, setStagedValue] = useState(
    opensInCommittedState ? initialStagedValue : "",
  );
  const [stagedApplyScope, setStagedApplyScope] = useState<SummaryApplyScope>(defaultApplyScope);
  const [applyScope, setApplyScope] = useState<SummaryApplyScope>(
    cellCount <= 1 ? "cell" : defaultApplyScope,
  );
  const [selectedHoles, setSelectedHoles] = useState<string[]>(defaultSelectedHoles);
  const [stagedDetailsExpanded, setStagedDetailsExpanded] = useState(false);
  const [approvedDetailsExpanded, setApprovedDetailsExpanded] = useState(false);
  const initialExceededLimitState = isExceededCharacterLimitError(validationType, errorType)
    ? parseExceededLimitStagedValue(
        opensInCommittedState ? initialStagedValue : defaultCharacterLimitResolution,
      )
    : null;
  const [characterLimitResolution, setCharacterLimitResolution] =
    useState<CharacterLimitResolution>(
      initialExceededLimitState?.resolution ?? defaultCharacterLimitResolution,
    );
  const [newCharacterLimit, setNewCharacterLimit] = useState(
    initialExceededLimitState?.newLimit ?? defaultNewCharacterLimit,
  );
  const initialExceededDecimalLimitState = isNumericDecimalLimitResolutionError(
    validationType,
    errorType,
  )
    ? parseExceededDecimalLimitStagedValue(
        opensInCommittedState ? initialStagedValue : resolvedDefaultDecimalLimitResolution,
      )
    : null;
  const [decimalLimitResolution, setDecimalLimitResolution] =
    useState<DecimalLimitResolution>(
      initialExceededDecimalLimitState?.resolution ?? resolvedDefaultDecimalLimitResolution,
    );
  const [newDecimalLimit, setNewDecimalLimit] = useState(
    initialExceededDecimalLimitState?.newLimit ??
      defaultNewDecimalLimit ??
      DEMO_DEFAULT_NEW_DECIMAL_LIMIT,
  );
  const [manualNumericValue, setManualNumericValue] = useState(
    initialExceededDecimalLimitState?.manualValue ?? "",
  );

  const isSingleCellError = cellCount <= 1;
  const isGaps = isGapsValidation(validationType);
  const isOverlaps = isOverlapsValidation(validationType);
  const isIntervalBoundary = isIntervalBoundaryValidation(validationType);
  const isDuplicates = isDuplicatesValidation(validationType);

  useEffect(() => {
    if (isSingleCellError || isIntervalBoundary || isDuplicates) {
      setApplyScope("cell");
    }
  }, [isSingleCellError, isIntervalBoundary, isDuplicates]);

  const isApproved = panelState === "approved";
  const isStaged = panelState === "staged";
  const isEditable = panelState === "editable";
  const showHoleMenu = applyScope === "holes";
  const isCustomValueMode =
    validationType === "list" && valueInputMode === "custom";
  const isTextValueRequired = isTextValueRequiredError(validationType, errorType);
  const isExceededLimit = isExceededCharacterLimitError(validationType, errorType);
  const isNumericDecimalLimitResolution = isNumericDecimalLimitResolutionError(validationType, errorType);
  const isNumeric = isNumericValidation(validationType);
  const isBoolean = isBooleanValidation(validationType);
  const isDate = validationType === "date";
  const isDateTime = validationType === "date-time";
  const panelCopy = getPanelCopy(validationType, errorType);
  const previousValueLabel = getPreviousValueLabel(validationType, errorType, invalidValue);
  const numericValidationOptions = getNumericInputValidationOptions(
    validationType,
    errorType,
    minValue,
    maxValue,
    decimalMax,
  );
  const trimmedNumericValue = isNumeric ? textValue.trim() : "";
  const trimmedManualNumericValue = manualNumericValue.trim();
  const showNumericInputError =
    isNumeric &&
    !isNumericDecimalLimitResolution &&
    trimmedNumericValue !== "" &&
    !isValidNumericValue(trimmedNumericValue, numericValidationOptions);
  const showManualNumericInputError =
    isNumericDecimalLimitResolution &&
    decimalLimitResolution === "adjust-manually" &&
    trimmedManualNumericValue !== "" &&
    !isValidNumericValue(trimmedManualNumericValue, { decimalMax });
  const isNumericValueCommittable =
    !isNumeric ||
    isNumericDecimalLimitResolution ||
    (trimmedNumericValue !== "" &&
      isValidNumericValue(trimmedNumericValue, numericValidationOptions));

  const trimmedDateTimeValue = isDateTime ? textValue.trim() : "";
  const trimmedDateValue = isDate ? textValue.trim() : "";
  const showDateFormatError =
    isDate &&
    trimmedDateValue !== "" &&
    !isValidDateForFormat(trimmedDateValue, dateFormat);
  const showDateTimeFormatError =
    isDateTime &&
    trimmedDateTimeValue !== "" &&
    !isValidDateTimeForFormat(trimmedDateTimeValue, dateTimeFormat);
  const isDateValueCommittable =
    !isDate || (trimmedDateValue !== "" && isValidDateForFormat(trimmedDateValue, dateFormat));
  const isDateTimeValueCommittable =
    !isDateTime ||
    (trimmedDateTimeValue !== "" &&
      isValidDateTimeForFormat(trimmedDateTimeValue, dateTimeFormat));

  const trimmedGapsToValue = isIntervalBoundary ? gapsToValue.trim() : "";
  const trimmedGapsFromValue = isIntervalBoundary ? gapsFromValue.trim() : "";
  const isIntervalBoundaryValueCommittable =
    !isIntervalBoundary ||
    isValidGapsResolutionWithCrossValidation(
      gapsToValue,
      gapsFromValue,
      intervalCrossValidation,
    );
  const resolveBoundaryFieldErrorMessage = (field: "to" | "from", value: string, otherValue: string) => {
    const fieldOptions = {
      field,
      toLabel: resolvedToLabel,
      fromLabel: resolvedFromLabel,
    };
    const basicError = isOverlaps
      ? getOverlapsFieldErrorMessage(value, otherValue, fieldOptions)
      : getGapsFieldErrorMessage(value, otherValue, fieldOptions);
    if (basicError) {
      return basicError;
    }

    if (!isValidGapsValue(value.trim())) {
      return "";
    }

    return getGapsCrossValidationErrorMessage(
      gapsToValue,
      gapsFromValue,
      intervalCrossValidation,
      field,
      resolvedToLabel,
      resolvedFromLabel,
    );
  };
  const showBoundaryToError =
    isIntervalBoundary &&
    gapsSelectedField === "to" &&
    trimmedGapsToValue !== "" &&
    resolveBoundaryFieldErrorMessage("to", gapsToValue, gapsFromValue) !== "";
  const showBoundaryFromError =
    isIntervalBoundary &&
    gapsSelectedField === "from" &&
    trimmedGapsFromValue !== "" &&
    resolveBoundaryFieldErrorMessage("from", gapsFromValue, gapsToValue) !== "";
  const displayedGapsGap = isGaps ? computeGapsGap(gapsToValue, gapsFromValue) : null;
  const displayedOverlap = isOverlaps ? computeOverlap(gapsToValue, gapsFromValue) : null;
  const showCurrentGapsGap =
    isGaps && isEditable && displayedGapsGap !== null && displayedGapsGap > 0;
  const showCurrentOverlap =
    isOverlaps && isEditable && displayedOverlap !== null && displayedOverlap > 0;

  const trimmedDuplicatesToValue = isDuplicates ? duplicatesToValue.trim() : "";
  const trimmedDuplicatesFromValue = isDuplicates ? duplicatesFromValue.trim() : "";
  const isDuplicatesValueCommittable =
    !isDuplicates ||
    duplicateResolution === "delete-row" ||
    isValidDuplicatesEditWithCrossValidation(
      duplicatesToValue,
      duplicatesFromValue,
      originalDuplicatesValues.fromValue,
      originalDuplicatesValues.toValue,
      intervalCrossValidation,
    );
  const resolveDuplicatesFieldErrorMessage = (field: "to" | "from", value: string) => {
    const basicError = getDuplicatesEditFieldErrorMessage(
      value,
      duplicatesToValue,
      duplicatesFromValue,
      originalDuplicatesValues.fromValue,
      originalDuplicatesValues.toValue,
      field,
      resolvedToLabel,
      resolvedFromLabel,
    );

    if (basicError) {
      return basicError;
    }

    return getDuplicatesCrossValidationErrorMessage(
      duplicatesToValue,
      duplicatesFromValue,
      originalDuplicatesValues.fromValue,
      originalDuplicatesValues.toValue,
      intervalCrossValidation,
      field,
      resolvedFromLabel,
      resolvedToLabel,
    );
  };
  const showDuplicatesToError =
    isDuplicates &&
    duplicateResolution === "edit-manually" &&
    gapsSelectedField === "to" &&
    trimmedDuplicatesToValue !== "" &&
    resolveDuplicatesFieldErrorMessage("to", duplicatesToValue) !== "";
  const showDuplicatesFromError =
    isDuplicates &&
    duplicateResolution === "edit-manually" &&
    gapsSelectedField === "from" &&
    trimmedDuplicatesFromValue !== "" &&
    resolveDuplicatesFieldErrorMessage("from", duplicatesFromValue) !== "";

  const currentValue = isExceededLimit
    ? getExceededLimitStagedValue(characterLimitResolution, newCharacterLimit)
    : isNumericDecimalLimitResolution
      ? getExceededDecimalLimitStagedValue(
          decimalLimitResolution,
          newDecimalLimit,
          manualNumericValue,
        )
      : isIntervalBoundary
        ? getGapsStagedValue(gapsToValue, gapsFromValue)
        : isDuplicates
          ? getDuplicatesStagedValue(duplicateResolution, duplicatesToValue, duplicatesFromValue)
      : validationType === "text" ||
          validationType === "date" ||
          validationType === "date-time" ||
          validationType === "numeric"
        ? textValue.trim()
        : isCustomValueMode
          ? customValue.trim()
          : selectedValue;

  const isCurrentValueCommittable = isExceededLimit
    ? canCommitExceededLimitResolution(characterLimitResolution, newCharacterLimit)
    : isNumericDecimalLimitResolution
      ? canCommitExceededDecimalLimitResolution(
          decimalLimitResolution,
          newDecimalLimit,
          manualNumericValue,
          decimalMax,
        )
      : isDateTime
        ? isDateTimeValueCommittable
        : isDate
          ? isDateValueCommittable
          : isIntervalBoundary
            ? isIntervalBoundaryValueCommittable
            : isDuplicates
              ? isDuplicatesValueCommittable
            : isNumeric
              ? isNumericValueCommittable
              : currentValue !== "";

  const canStageChange = isEditable && isCurrentValueCommittable;
  const hasStagedChanges =
    currentValue !== stagedValue || applyScope !== stagedApplyScope;
  const canUpdateStaged = isStaged && hasStagedChanges && isCurrentValueCommittable;
  const canApprove = isStaged && isCurrentValueCommittable;

  const stagedGapsValues = parseGapsStagedValue(stagedValue);
  const stagedDuplicatesValues = parseDuplicatesStagedValue(stagedValue);
  const stagedAsText = isExceededLimit
    ? getExceededLimitStagedAsDisplayText(
        isApproved,
        isStaged,
        hasStagedChanges,
        stagedValue,
        characterLimitResolution,
        newCharacterLimit,
        characterLimit,
        originalExceededLimitText,
      )
    : isNumericDecimalLimitResolution
      ? getExceededDecimalLimitStagedAsDisplayText(
          isApproved,
          isStaged,
          hasStagedChanges,
          stagedValue,
          decimalLimitResolution,
          newDecimalLimit,
          manualNumericValue,
          decimalMax,
          invalidValue,
        )
      : isIntervalBoundary
        ? formatGapsValuesSummary(
            resolvedToLabel,
            stagedGapsValues.toValue,
            resolvedFromLabel,
            stagedGapsValues.fromValue,
          )
        : isDuplicates
          ? getDuplicatesStagedDisplayText(
              stagedDuplicatesValues.resolution,
              resolvedToLabel,
              stagedDuplicatesValues.toValue,
              resolvedFromLabel,
              stagedDuplicatesValues.fromValue,
            )
      : isBoolean
        ? resolveBooleanDisplayValue(stagedValue, booleanValueOptions)
        : validationType === "list"
          ? resolveDisplayValue(stagedValue, valueOptions)
          : stagedValue;

  const previouslyText = isExceededLimit
    ? originalExceededLimitText
    : isNumericDecimalLimitResolution
      ? invalidValue
      : isIntervalBoundary
        ? formatGapsValuesSummary(
            resolvedToLabel,
            originalGapsValues.toValue,
            resolvedFromLabel,
            originalGapsValues.fromValue,
          )
        : isDuplicates
          ? formatGapsValuesSummary(
              resolvedToLabel,
              originalDuplicatesValues.toValue,
              resolvedFromLabel,
              originalDuplicatesValues.fromValue,
            )
      : previousValueLabel;

  const applyImpact = useMemo(
    () =>
      getApplyImpact?.(applyScope, selectedHoles, panelState) ??
      getDefaultApplyImpact(applyScope, selectedHoles, cellCount, holeCount),
    [getApplyImpact, applyScope, selectedHoles, panelState, cellCount, holeCount],
  );

  const showCharacterLimitTrimWarning =
    isExceededLimit &&
    !isApproved &&
    shouldShowCharacterLimitTrimWarning(
      applyScope,
      characterLimitResolution,
      newCharacterLimit,
      selectedHoles,
      maxEnteredCharacterCountInSelectionProp,
      getMaxEnteredCharacterCountInSelection,
    );

  const showDecimalLimitRoundWarning =
    isNumericDecimalLimitResolution &&
    !isApproved &&
    shouldShowDecimalLimitRoundWarning(
      applyScope,
      decimalLimitResolution,
      newDecimalLimit,
      selectedHoles,
      maxEnteredDecimalCountInSelectionProp,
      getMaxEnteredDecimalCountInSelection,
    );

  const segmentedOptions = useMemo(() => {
    if (isApproved) {
      return APPLY_SCOPE_OPTIONS.map((option) => ({
        ...option,
        disabled: option.value !== applyScope,
      }));
    }

    return APPLY_SCOPE_OPTIONS.map((option) => ({
      ...option,
      disabled: isSingleCellError && option.value === "holes",
    }));
  }, [applyScope, isApproved, isSingleCellError]);

  const panelClassNames = [
    styles.panel,
    fillHeight && styles.panelFillHeight,
    collapsed && styles.panelCollapsed,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const titleClassNames = [
    styles.title,
    isEditable && styles.titleError,
  ]
    .filter(Boolean)
    .join(" ");
  const chevronClassNames = [
    styles.sidebarChevron,
    collapsed ? styles.sidebarChevronCollapsed : styles.sidebarChevronExpanded,
  ]
    .filter(Boolean)
    .join(" ");
  const applySectionClassNames = [
    styles.applySection,
    showHoleMenu && styles.applySectionWithMenu,
  ]
    .filter(Boolean)
    .join(" ");

  const handleStageChange = () => {
    if (!canStageChange) return;
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
    if (isExceededLimit) {
      syncExceededLimitResolutionState(
        currentValue,
        setCharacterLimitResolution,
        setNewCharacterLimit,
      );
    }
    if (isNumericDecimalLimitResolution) {
      syncExceededDecimalLimitResolutionState(
        currentValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
      );
    }
    if (isDuplicates) {
      syncDuplicatesResolutionState(
        currentValue,
        setDuplicateResolution,
        setDuplicatesToValue,
        setDuplicatesFromValue,
        resolvedToValue,
        resolvedFromValue,
      );
    }
    setStagedDetailsExpanded(false);
    setPanelState("staged");
    onPanelStateChange?.("staged", currentValue, applyScope, selectedHoles);
  };

  const handleUpdateStaged = () => {
    if (!canUpdateStaged) return;
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
    if (isExceededLimit) {
      syncExceededLimitResolutionState(
        currentValue,
        setCharacterLimitResolution,
        setNewCharacterLimit,
      );
    }
    if (isNumericDecimalLimitResolution) {
      syncExceededDecimalLimitResolutionState(
        currentValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
      );
    }
    if (isDuplicates) {
      syncDuplicatesResolutionState(
        currentValue,
        setDuplicateResolution,
        setDuplicatesToValue,
        setDuplicatesFromValue,
        resolvedToValue,
        resolvedFromValue,
      );
    }
    onPanelStateChange?.("staged", currentValue, applyScope, selectedHoles);
  };

  const handleApprove = () => {
    if (!canApprove) return;
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
    if (isExceededLimit) {
      syncExceededLimitResolutionState(
        currentValue,
        setCharacterLimitResolution,
        setNewCharacterLimit,
      );
    }
    if (isNumericDecimalLimitResolution) {
      syncExceededDecimalLimitResolutionState(
        currentValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
      );
    }
    if (isDuplicates) {
      syncDuplicatesResolutionState(
        currentValue,
        setDuplicateResolution,
        setDuplicatesToValue,
        setDuplicatesFromValue,
        resolvedToValue,
        resolvedFromValue,
      );
    }
    setStagedDetailsExpanded(false);
    setApprovedDetailsExpanded(false);
    setPanelState("approved");
    onPanelStateChange?.("approved", currentValue, applyScope, selectedHoles);
  };

  const handleRevertToStaged = () => {
    setApprovedDetailsExpanded(false);
    setPanelState("staged");
    if (isExceededLimit) {
      syncExceededLimitResolutionState(
        stagedValue,
        setCharacterLimitResolution,
        setNewCharacterLimit,
      );
    }
    if (isNumericDecimalLimitResolution) {
      syncExceededDecimalLimitResolutionState(
        stagedValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
      );
    }
    if (isDuplicates) {
      syncDuplicatesResolutionState(
        stagedValue,
        setDuplicateResolution,
        setDuplicatesToValue,
        setDuplicatesFromValue,
        resolvedToValue,
        resolvedFromValue,
      );
    }
    onPanelStateChange?.("staged", stagedValue, applyScope, selectedHoles);
  };

  const handleApplyScopeChange = (nextScope: string) => {
    if (isApproved) return;
    const scope = nextScope as SummaryApplyScope;
    if (scope === "holes" && isSingleCellError) return;
    setApplyScope(scope);
    if (scope === "holes" && defaultSelectedHoles.length > 0) {
      setSelectedHoles(defaultSelectedHoles);
    }
  };

  const handleAddNewValue = () => {
    if (isApproved) return;
    setValueInputMode("custom");
  };

  const handleChooseExistingValue = () => {
    if (isApproved) return;
    setValueInputMode("select");
  };

  const handleClose = () => {
    setCollapsed(true);
    onClose?.();
  };

  const renderResolutionSection = () => (
    <div className={styles.resolutionSection}>
      <p className={styles.resolutionLabel}>Select resolution</p>
      <div
        className={styles.resolutionOptions}
        role="radiogroup"
        aria-label="Select resolution"
      >
        {CHARACTER_LIMIT_RESOLUTION_OPTIONS.map((option) => (
          <Radio
            key={option.value}
            name="character-limit-resolution"
            className={styles.resolutionRadio}
            checked={characterLimitResolution === option.value}
            onCheckedChange={() => {
              setCharacterLimitResolution(option.value);
              if (option.value === "trim-to-limit") {
                setNewCharacterLimit("");
              }
            }}
            disabled={isApproved}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );

  const renderNewCharacterLimitField = () => (
    <div className={styles.characterLimitInputSection}>
      <TextField
        className={styles.characterLimitField}
        label="New Character Limit"
        placeholder=""
        value={newCharacterLimit}
        onChange={(event) => setNewCharacterLimit(event.target.value)}
        disabled={isApproved}
        aria-label="New character limit"
      />
      {showCharacterLimitTrimWarning && (
        <div className={styles.characterLimitWarning} role="alert">
          <p className={styles.characterLimitWarningText}>
            {getCharacterLimitTrimWarningMessage(newCharacterLimit)}
          </p>
        </div>
      )}
    </div>
  );

  const renderDecimalLimitResolutionSection = () => (
    <div className={styles.resolutionSection}>
      <p className={styles.resolutionLabel}>Select resolution</p>
      <div
        className={styles.resolutionOptions}
        role="radiogroup"
        aria-label="Select resolution"
      >
        {DECIMAL_LIMIT_RESOLUTION_OPTIONS.map((option) => (
          <Radio
            key={option.value}
            name="decimal-limit-resolution"
            className={styles.resolutionRadio}
            checked={decimalLimitResolution === option.value}
            onCheckedChange={() => {
              setDecimalLimitResolution(option.value);
              if (option.value === "round-to-limit") {
                setNewDecimalLimit("");
              }
              if (option.value !== "adjust-manually") {
                setManualNumericValue("");
              }
            }}
            disabled={isApproved}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );

  const renderNewDecimalLimitField = () => (
    <div className={styles.characterLimitInputSection}>
      <TextField
        className={styles.characterLimitField}
        label="New Decimal Limit"
        placeholder=""
        value={newDecimalLimit}
        onChange={(event) => setNewDecimalLimit(event.target.value)}
        disabled={isApproved}
        aria-label="New decimal limit"
      />
      {showDecimalLimitRoundWarning && (
        <div className={styles.characterLimitWarning} role="alert">
          <p className={styles.characterLimitWarningText}>
            {getDecimalLimitRoundWarningMessage(newDecimalLimit)}
          </p>
        </div>
      )}
    </div>
  );

  const renderManualNumericValueField = () => (
    <TextField
      className={styles.valueField}
      label="Enter Value"
      placeholder=""
      value={manualNumericValue}
      onChange={(event) => setManualNumericValue(event.target.value)}
      disabled={isApproved}
      error={showManualNumericInputError}
      errorMessage={getNumericValidationErrorMessage(manualNumericValue, { decimalMax })}
      aria-label="Enter value"
    />
  );

  const getNumericFieldLabel = () => {
    if (errorType === "missing-value") {
      return "Enter Value";
    }

    if (errorType === "invalid-value") {
      return "Enter Replacement Value";
    }

    return "Enter Updated Value";
  };

  const renderIntervalBoundaryResolutionFields = () => (
    <>
      {showCurrentGapsGap && (
        <div className={styles.gapsCurrentGapBanner}>
          <p className={styles.gapsCurrentGapText}>
            Current gap: {formatGapsGap(displayedGapsGap!)}
          </p>
        </div>
      )}
      {showCurrentOverlap && (
        <div className={styles.gapsCurrentGapBanner}>
          <p className={styles.gapsCurrentGapText}>
            Current overlap: {formatOverlap(displayedOverlap!)}
          </p>
        </div>
      )}
      <div className={styles.gapsFields}>
        {gapsSelectedField === "to" ? (
          <TextField
            className={styles.gapsField}
            label={getAdjustValueLabel(resolvedToLabel)}
            placeholder=""
            value={gapsToValue}
            onChange={(event) => setGapsToValue(event.target.value)}
            disabled={isApproved}
            error={showBoundaryToError}
            errorMessage={resolveBoundaryFieldErrorMessage("to", gapsToValue, gapsFromValue)}
            aria-label={getAdjustValueLabel(resolvedToLabel)}
          />
        ) : (
          <TextField
            className={styles.gapsField}
            label={getAdjustValueLabel(resolvedFromLabel)}
            placeholder=""
            value={gapsFromValue}
            onChange={(event) => setGapsFromValue(event.target.value)}
            disabled={isApproved}
            error={showBoundaryFromError}
            errorMessage={resolveBoundaryFieldErrorMessage("from", gapsFromValue, gapsToValue)}
            aria-label={getAdjustValueLabel(resolvedFromLabel)}
          />
        )}
      </div>
    </>
  );

  const renderDuplicatesResolutionSection = () => (
    <div className={styles.resolutionSection}>
      <p className={styles.resolutionLabel}>Select resolution</p>
      <div
        className={styles.resolutionOptions}
        role="radiogroup"
        aria-label="Select resolution"
      >
        {DUPLICATE_RESOLUTION_OPTIONS.map((option) => (
          <Radio
            key={option.value}
            name="duplicate-resolution"
            className={styles.resolutionRadio}
            checked={duplicateResolution === option.value}
            onCheckedChange={() => {
              setDuplicateResolution(option.value);
              if (option.value === "edit-manually") {
                setDuplicatesToValue(resolvedToValue);
                setDuplicatesFromValue(resolvedFromValue);
              }
            }}
            disabled={isApproved}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );

  const renderDuplicatesEditFields = () => (
    <div className={styles.gapsFields}>
      {gapsSelectedField === "to" ? (
        <TextField
          className={styles.gapsField}
          label={getAdjustValueLabel(resolvedToLabel)}
          placeholder=""
          value={duplicatesToValue}
          onChange={(event) => setDuplicatesToValue(event.target.value)}
          disabled={isApproved}
          error={showDuplicatesToError}
          errorMessage={resolveDuplicatesFieldErrorMessage("to", duplicatesToValue)}
          aria-label={getAdjustValueLabel(resolvedToLabel)}
        />
      ) : (
        <TextField
          className={styles.gapsField}
          label={getAdjustValueLabel(resolvedFromLabel)}
          placeholder=""
          value={duplicatesFromValue}
          onChange={(event) => setDuplicatesFromValue(event.target.value)}
          disabled={isApproved}
          error={showDuplicatesFromError}
          errorMessage={resolveDuplicatesFieldErrorMessage("from", duplicatesFromValue)}
          aria-label={getAdjustValueLabel(resolvedFromLabel)}
        />
      )}
    </div>
  );

  const renderBooleanValueField = () => (
    <div className={styles.resolutionSection}>
      <p className={styles.resolutionLabel}>Choose a value</p>
      <div
        className={[
          styles.resolutionOptions,
          isApproved && styles.booleanValueOptionsDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
        role="radiogroup"
        aria-label="Choose a value"
      >
        {booleanValueOptions.map((option) => (
          <Radio
            key={option.value}
            name="boolean-value"
            className={styles.resolutionRadio}
            checked={selectedValue === option.value}
            onCheckedChange={() => setSelectedValue(option.value)}
            disabled={isApproved}
            label={option.label}
          />
        ))}
      </div>
    </div>
  );

  const renderValueField = () => {
    if (isExceededLimit || isNumericDecimalLimitResolution || isIntervalBoundary || isDuplicates) {
      return null;
    }

    if (validationType === "numeric") {
      return (
        <TextField
          className={styles.valueField}
          label={getNumericFieldLabel()}
          placeholder=""
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          disabled={isApproved}
          error={showNumericInputError}
          errorMessage={getNumericValidationErrorMessage(
            trimmedNumericValue,
            numericValidationOptions,
          )}
          aria-label={getNumericFieldLabel()}
        />
      );
    }

    if (validationType === "text" && isTextValueRequired) {
      return (
        <TextAreaField
          className={styles.valueField}
          label="Enter Value"
          placeholder=""
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          maxLength={characterLimit}
          disabled={isApproved}
          aria-label="Enter value"
        />
      );
    }

    if (validationType === "date-time") {
      return (
        <TextField
          className={styles.valueField}
          label={
            <>
              Date Time{" "}
              <span className={styles.dateFormatHint}>({dateTimeFormat})</span>
            </>
          }
          placeholder=""
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          disabled={isApproved}
          error={showDateTimeFormatError}
          errorMessage={getDateTimeFormatErrorMessage(dateTimeFormat)}
          aria-label={`Date Time (${dateTimeFormat})`}
        />
      );
    }

    if (validationType === "date") {
      return (
        <TextField
          className={styles.valueField}
          label={
            <>
              Date{" "}
              <span className={styles.dateFormatHint}>({dateFormat})</span>
            </>
          }
          placeholder=""
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          disabled={isApproved}
          error={showDateFormatError}
          errorMessage={getDateFormatErrorMessage(dateFormat)}
          aria-label={`Date (${dateFormat})`}
        />
      );
    }

    if (validationType === "text") {
      return (
        <TextField
          className={styles.valueField}
          label="Corrected Value"
          placeholder=""
          value={textValue}
          onChange={(event) => setTextValue(event.target.value)}
          disabled={isApproved}
          aria-label="Corrected value"
        />
      );
    }

    if (isCustomValueMode) {
      return (
        <TextField
          className={styles.valueField}
          label="Add New List Value"
          linkText={isApproved ? undefined : "Choose existing value"}
          onLinkClick={handleChooseExistingValue}
          placeholder=""
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          disabled={isApproved}
          aria-label="New list value"
        />
      );
    }

    return (
      <SingleSelect
        className={styles.valueField}
        value={selectedValue}
        options={valueOptions}
        onChange={setSelectedValue}
        label="Select Value"
        linkText={isApproved ? undefined : "Add new value"}
        onLinkClick={handleAddNewValue}
        placeholder="Select Value"
        disabled={isApproved}
        aria-label="Replacement value"
      />
    );
  };

  const panelStyle: CSSProperties | undefined =
    !fillHeight && panelHeight !== 640
      ? ({ "--summary-panel-height": `${panelHeight}px` } as CSSProperties)
      : undefined;

  return (
    <aside
      className={panelClassNames}
      style={panelStyle}
      aria-label="Summary panel"
    >
      <button
        type="button"
        className={styles.sidebar}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand summary panel" : "Collapse summary panel"}
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className={styles.sidebarInner}>
          <SidebarChevronIcon className={chevronClassNames} />
          <p className={styles.sidebarLabel}>SUMMARY</p>
        </div>
      </button>

      {!collapsed && (
        <div className={styles.content}>
          <div className={styles.body}>
            <div className={styles.bodyMain}>
              <div className={styles.introBlock}>
                <div className={styles.headerRow}>
                  <h2 className={titleClassNames}>
                    {getTitle(
                      panelState,
                      validationType,
                      errorType,
                      characterLimit,
                      enteredCharacterCount,
                      decimalMax,
                      enteredDecimalCount,
                      minValue,
                      maxValue,
                      invalidValue,
                    )}
                  </h2>
                  <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="Close summary panel"
                    onClick={handleClose}
                  >
                    <CloseIcon className={styles.closeIcon} />
                  </button>
                </div>

                {isEditable && (
                  <>
                    <p className={styles.summaryText}>
                      {isGaps
                        ? getGapsSummaryMessage(
                            resolvedFromLabel,
                            resolvedToLabel,
                            gapsSelectedField,
                          )
                        : isOverlaps
                          ? getOverlapsSummaryMessage(
                              resolvedFromLabel,
                              resolvedToLabel,
                              gapsSelectedField,
                            )
                        : isDuplicates
                          ? getDuplicatesSummaryMessage(cellCount)
                        : getSummaryMessage(
                            validationType,
                            errorType,
                            invalidValue,
                            cellCount,
                            holeCount,
                          )}
                    </p>
                    {panelCopy.helperText && (
                      <p className={styles.helperText}>{panelCopy.helperText}</p>
                    )}
                  </>
                )}
              </div>

              {isStaged && (
                <StatusDetailsBanner
                  variant="staged"
                  expanded={stagedDetailsExpanded}
                  onToggle={() => setStagedDetailsExpanded((current) => !current)}
                  stagedAsHeading="STAGED AS"
                  stagedAsText={stagedAsText}
                  previouslyText={previouslyText}
                  quoteValues={!isBoolean && !isIntervalBoundary && !isDuplicates}
                />
              )}

              {isApproved && (
                <StatusDetailsBanner
                  variant="approved"
                  expanded={approvedDetailsExpanded}
                  onToggle={() => setApprovedDetailsExpanded((current) => !current)}
                  stagedAsHeading="APPROVED AS"
                  stagedAsText={stagedAsText}
                  previouslyText={previouslyText}
                  quoteValues={!isBoolean && !isIntervalBoundary && !isDuplicates}
                />
              )}

              {isExceededLimit ? (
                <>
                  {renderResolutionSection()}
                  {characterLimitResolution === "increase-limit" && renderNewCharacterLimitField()}
                </>
              ) : isNumericDecimalLimitResolution ? (
                <>
                  {renderDecimalLimitResolutionSection()}
                  {decimalLimitResolution === "increase-limit" && renderNewDecimalLimitField()}
                  {decimalLimitResolution === "adjust-manually" && renderManualNumericValueField()}
                </>
              ) : isIntervalBoundary ? (
                renderIntervalBoundaryResolutionFields()
              ) : isDuplicates ? (
                <>
                  {renderDuplicatesResolutionSection()}
                  {duplicateResolution === "edit-manually" && renderDuplicatesEditFields()}
                </>
              ) : isBoolean ? (
                renderBooleanValueField()
              ) : (
                renderValueField()
              )}
            </div>

            {!isIntervalBoundary && !isDuplicates && (
            <div className={applySectionClassNames}>
              <SegmentedControl
                className={styles.segmentedControl}
                value={applyScope}
                options={segmentedOptions}
                onChange={handleApplyScopeChange}
                aria-label="Apply change scope"
              />

              {showHoleMenu && (
                <div
                  className={[
                    styles.holeMenuWrapper,
                    isApproved ? styles.holeMenuDisabled : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <MultiSelectMenu
                    className={styles.holeMenu}
                    fillHeight
                    value={selectedHoles}
                    options={holeOptions}
                    onChange={setSelectedHoles}
                    aria-label="Drill hole selection"
                  />
                </div>
              )}
            </div>
            )}
          </div>

          <div className={styles.footer}>
            {isEditable && (
              <>
                <div className={styles.actionRow}>
                  <Button
                    variant="primary"
                    className={styles.fullWidthButton}
                    disabled={!canStageChange}
                    onClick={handleStageChange}
                  >
                    Stage Change
                  </Button>
                </div>
                <p className={styles.footerNote}>
                  {getFooterNote(applyScope, panelState, applyImpact)}
                </p>
              </>
            )}

            {isStaged && (
              <>
                <div className={styles.actionRow}>
                  <Button
                    variant="primary"
                    className={styles.fullWidthButton}
                    disabled={!canUpdateStaged}
                    onClick={handleUpdateStaged}
                  >
                    Update Staged Value
                  </Button>
                  <Button
                    variant="approval"
                    className={styles.fullWidthButton}
                    disabled={!canApprove}
                    onClick={handleApprove}
                  >
                    Approve Update
                  </Button>
                </div>
                <p className={styles.footerNote}>
                  {getFooterNote(applyScope, panelState, applyImpact)}
                </p>
              </>
            )}

            {isApproved && (
              <div className={styles.actionRow}>
                <Button
                  variant="primary"
                  className={styles.fullWidthButton}
                  onClick={handleRevertToStaged}
                >
                  Revert to Staged
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
