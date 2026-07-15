/**
 * Summary Panel — corrects column validation errors through a three-state workflow:
 * editable (pick a fix) → staged (pending review) → approved (committed).
 *
 * `validationType` + `errorType` select copy and input UI (list select, text area,
 * boolean radios, date field, date/time fields, numeric fields, or character-limit resolution). Apply scope controls whether the
 * fix targets one cell or matching errors across selected drill holes.
 *
 * Omitted props fall back to demo constants from SummaryPanel.demoData so the gallery
 * works without wiring; production apps should pass real counts, values, and options.
 */
import { useMemo, useRef, useState, type CSSProperties } from "react";
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
  DEMO_HOLE_COUNT,
  DEMO_HOLE_OPTIONS,
  DEMO_INVALID_VALUE,
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

function isExceededDecimalLimitError(
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
) {
  return validationType === "numeric" && errorType === "exceeded-decimal-limit";
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

function getExceededLimitResultText(
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
    return "round-to-limit";
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
      resolution: "round-to-limit",
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
  newLimit: string,
  decimalMax: number,
  originalValue: string,
) {
  if (resolution === "round-to-limit") {
    return roundToDecimalLimit(originalValue, decimalMax);
  }

  if (resolution === "increase-limit") {
    const parsedLimit = parseNewDecimalLimitValue(newLimit);
    if (parsedLimit === null) {
      return originalValue;
    }

    return roundToDecimalLimit(originalValue, parsedLimit);
  }

  return newLimit.trim() || originalValue;
}

function getExceededDecimalLimitResultText(
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
    return getExceededDecimalLimitResultText(stagedValue, decimalMax, originalValue);
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

  if (errorType === "below-min-value") {
    return { ...options, minValue };
  }

  if (errorType === "above-max-value") {
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
      if (isExceededDecimalLimitError(validationType, errorType)) {
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
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column exceed the decimal max.`;
      case "missing-value":
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column are missing values.`;
      case "invalid-value":
        return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "field", "fields")} within this column.`;
      case "below-min-value":
        if (cellCount <= 1) {
          return `\u201C${invalidValue}\u201D is below the min value`;
        }
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column are identical and below the min value`;
      case "above-max-value":
        return `${formatCountLabel(cellCount, "cell", "cells")} in this column are identical and above the max value`;
      default:
        break;
    }
  }

  if (validationType === "boolean") {
    if (errorType === "missing-value") {
      return `${formatCountLabel(cellCount, "cell", "cells")} are missing values across ${formatCountLabel(holeCount, "hole", "holes")}.`;
    }

    return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "cell", "cells")} across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (validationType === "date" || validationType === "date-time") {
    if (errorType === "missing-value") {
      return `${formatCountLabel(cellCount, "cell", "cells")} are missing values across ${formatCountLabel(holeCount, "hole", "holes")}.`;
    }

    return `\u201C${invalidValue}\u201D appears in ${formatCountLabel(cellCount, "cell", "cells")} across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (errorType === "missing-value") {
    return "This column requires values in all fields.";
  }

  if (errorType === "value-required") {
    return `${formatCountLabel(cellCount, "cell", "cells")} in this column are missing values across ${formatCountLabel(holeCount, "hole", "holes")}.`;
  }

  if (isExceededCharacterLimitError(validationType, errorType)) {
    return `${formatCountLabel(cellCount, "cell", "cells")} in this column exceed the character limit across ${formatCountLabel(holeCount, "hole", "holes")}.`;
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
  defaultDecimalLimitResolution = "round-to-limit",
  defaultNewDecimalLimit = "",
  valueOptions = DEMO_VALUE_OPTIONS,
  booleanValueOptions = DEMO_BOOLEAN_VALUE_OPTIONS,
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
              : DEMO_INVALID_VALUE);
  const dateFormat = dateFormatProp ?? DEMO_DATE_FORMAT;
  const dateTimeFormat = dateTimeFormatProp ?? DEMO_DATE_TIME_FORMAT;
  const characterLimit = characterLimitProp ?? DEMO_CHARACTER_LIMIT;
  const enteredCharacterCount = enteredCharacterCountProp ?? DEMO_ENTERED_CHARACTER_COUNT;
  const decimalMax = decimalMaxProp ?? DEMO_DECIMAL_MAX;
  const enteredDecimalCount = enteredDecimalCountProp ?? DEMO_ENTERED_DECIMAL_COUNT;
  const minValue = minValueProp ?? DEMO_NUMERIC_MIN_VALUE;
  const maxValue = maxValueProp ?? DEMO_NUMERIC_MAX_VALUE;
  const originalExceededLimitTextRef = useRef(
    getOriginalExceededLimitCellText(
      exceededLimitCellTextProp,
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
                : DEMO_HOLE_COUNT);
  const defaultBooleanValue = booleanValueOptions[0]?.value ?? "";
  const initialStagedValue =
    initialStagedValueProp ??
    (validationType === "numeric"
      ? isExceededDecimalLimitError(validationType, errorType)
        ? defaultDecimalLimitResolution
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
  const [customValue, setCustomValue] = useState("");
  const [stagedValue, setStagedValue] = useState(
    opensInCommittedState ? initialStagedValue : "",
  );
  const [stagedApplyScope, setStagedApplyScope] = useState<SummaryApplyScope>(defaultApplyScope);
  const [applyScope, setApplyScope] = useState<SummaryApplyScope>(defaultApplyScope);
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
  const initialExceededDecimalLimitState = isExceededDecimalLimitError(
    validationType,
    errorType,
  )
    ? parseExceededDecimalLimitStagedValue(
        opensInCommittedState ? initialStagedValue : defaultDecimalLimitResolution,
      )
    : null;
  const [decimalLimitResolution, setDecimalLimitResolution] =
    useState<DecimalLimitResolution>(
      initialExceededDecimalLimitState?.resolution ?? defaultDecimalLimitResolution,
    );
  const [newDecimalLimit, setNewDecimalLimit] = useState(
    initialExceededDecimalLimitState?.newLimit ??
      defaultNewDecimalLimit ??
      DEMO_DEFAULT_NEW_DECIMAL_LIMIT,
  );
  const [manualNumericValue, setManualNumericValue] = useState(
    initialExceededDecimalLimitState?.manualValue ?? "",
  );

  const isApproved = panelState === "approved";
  const isStaged = panelState === "staged";
  const isEditable = panelState === "editable";
  const showHoleMenu = applyScope === "holes";
  const isCustomValueMode =
    validationType === "list" && valueInputMode === "custom";
  const isTextValueRequired = isTextValueRequiredError(validationType, errorType);
  const isExceededLimit = isExceededCharacterLimitError(validationType, errorType);
  const isExceededDecimalLimit = isExceededDecimalLimitError(validationType, errorType);
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
    !isExceededDecimalLimit &&
    trimmedNumericValue !== "" &&
    !isValidNumericValue(trimmedNumericValue, numericValidationOptions);
  const showManualNumericInputError =
    isExceededDecimalLimit &&
    decimalLimitResolution === "adjust-manually" &&
    trimmedManualNumericValue !== "" &&
    !isValidNumericValue(trimmedManualNumericValue, { decimalMax });
  const isNumericValueCommittable =
    !isNumeric ||
    isExceededDecimalLimit ||
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

  const currentValue = isExceededLimit
    ? getExceededLimitStagedValue(characterLimitResolution, newCharacterLimit)
    : isExceededDecimalLimit
      ? getExceededDecimalLimitStagedValue(
          decimalLimitResolution,
          newDecimalLimit,
          manualNumericValue,
        )
      : validationType === "text" ||
          validationType === "date" ||
          validationType === "date-time" ||
          validationType === "numeric"
        ? textValue.trim()
        : isCustomValueMode
          ? customValue.trim()
          : selectedValue;

  const canStageChange =
    isEditable &&
    (isExceededLimit
      ? canCommitExceededLimitResolution(characterLimitResolution, newCharacterLimit)
      : isExceededDecimalLimit
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
            : isNumeric
              ? isNumericValueCommittable
              : currentValue !== "");
  const hasStagedChanges =
    currentValue !== stagedValue || applyScope !== stagedApplyScope;
  const canUpdateStaged = isStaged && hasStagedChanges && (
    isExceededLimit
      ? canCommitExceededLimitResolution(characterLimitResolution, newCharacterLimit)
      : isExceededDecimalLimit
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
            : isNumeric
              ? isNumericValueCommittable
              : currentValue !== ""
  );

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
    : isExceededDecimalLimit
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
      : isBoolean
        ? resolveBooleanDisplayValue(stagedValue, booleanValueOptions)
        : validationType === "list"
          ? resolveDisplayValue(stagedValue, valueOptions)
          : stagedValue;

  const previouslyText = isExceededLimit
    ? originalExceededLimitText
    : isExceededDecimalLimit
      ? invalidValue
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
    isExceededDecimalLimit &&
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
    if (!isApproved) {
      return APPLY_SCOPE_OPTIONS.map((option) => ({ ...option }));
    }

    return APPLY_SCOPE_OPTIONS.map((option) => ({
      ...option,
      disabled: option.value !== applyScope,
    }));
  }, [applyScope, isApproved]);

  const panelClassNames = [
    styles.panel,
    fillHeight && styles.panelFillHeight,
    collapsed && styles.panelCollapsed,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const titleClassNames = [styles.title, isEditable && styles.titleError]
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
    if (isExceededDecimalLimit) {
      syncExceededDecimalLimitResolutionState(
        currentValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
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
    if (isExceededDecimalLimit) {
      syncExceededDecimalLimitResolutionState(
        currentValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
      );
    }
    onPanelStateChange?.("staged", currentValue, applyScope, selectedHoles);
  };

  const handleApprove = () => {
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
    if (isExceededLimit) {
      syncExceededLimitResolutionState(
        currentValue,
        setCharacterLimitResolution,
        setNewCharacterLimit,
      );
    }
    if (isExceededDecimalLimit) {
      syncExceededDecimalLimitResolutionState(
        currentValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
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
    if (isExceededDecimalLimit) {
      syncExceededDecimalLimitResolutionState(
        stagedValue,
        setDecimalLimitResolution,
        setNewDecimalLimit,
        setManualNumericValue,
      );
    }
    onPanelStateChange?.("staged", stagedValue, applyScope, selectedHoles);
  };

  const handleApplyScopeChange = (nextScope: string) => {
    if (isApproved) return;
    const scope = nextScope as SummaryApplyScope;
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
      errorMessage={getNumericValidationErrorMessage(manualNumericValue, {
        decimalMax,
      })}
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
    if (isExceededLimit || isExceededDecimalLimit) {
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
                      {getSummaryMessage(
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
                  quoteValues={!isBoolean}
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
                  quoteValues={!isBoolean}
                />
              )}

              {isExceededLimit ? (
                <>
                  {renderResolutionSection()}
                  {characterLimitResolution === "increase-limit" && renderNewCharacterLimitField()}
                </>
              ) : isExceededDecimalLimit ? (
                <>
                  {renderDecimalLimitResolutionSection()}
                  {decimalLimitResolution === "increase-limit" && renderNewDecimalLimitField()}
                  {decimalLimitResolution === "adjust-manually" && renderManualNumericValueField()}
                </>
              ) : isBoolean ? (
                renderBooleanValueField()
              ) : (
                renderValueField()
              )}
            </div>

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
