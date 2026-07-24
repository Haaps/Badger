import {
  areGapsValuesEqual,
  formatGapsValuesSummary,
  getBoundaryMismatchMessage,
  isValidGapsResolution,
  isValidGapsValue,
  parseGapsStagedValue,
  type BoundaryFieldErrorOptions,
} from "./gapsValidation";

function parseNumericInput(value: string) {
  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseOverlapsStagedValue(value: string) {
  return parseGapsStagedValue(value);
}

export function getOverlapsStagedValue(toValue: string, fromValue: string) {
  return `to:${toValue.trim()}|from:${fromValue.trim()}`;
}

export function computeOverlap(toValue: string, fromValue: string) {
  const parsedToValue = parseNumericInput(toValue);
  const parsedFromValue = parseNumericInput(fromValue);

  if (parsedToValue === null || parsedFromValue === null) {
    return null;
  }

  if (parsedToValue <= parsedFromValue) {
    return null;
  }

  return parsedToValue - parsedFromValue;
}

export function formatOverlap(amount: number) {
  return Math.abs(amount).toFixed(1);
}

export function isValidOverlapsResolution(toValue: string, fromValue: string) {
  return isValidGapsResolution(toValue, fromValue);
}

export function isValidOverlapsValue(value: string) {
  return isValidGapsValue(value);
}

export function getOverlapsFieldErrorMessage(
  value: string,
  otherValue: string,
  options: BoundaryFieldErrorOptions = {},
) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return "Enter a numeric value";
  }

  if (!isValidGapsValue(trimmed)) {
    return "Must be numeric";
  }

  if (
    otherValue.trim() !== "" &&
    isValidGapsValue(otherValue) &&
    !areGapsValuesEqual(trimmed, otherValue)
  ) {
    if (options.field && options.toLabel && options.fromLabel) {
      return getBoundaryMismatchMessage(
        options.field,
        otherValue,
        options.toLabel,
        options.fromLabel,
        "overlaps",
      );
    }

    return "Values must be equal";
  }

  return "";
}

export function getOverlapsSummaryMessage(
  fromLabel: string,
  toLabel: string,
  selectedField: "to" | "from" = "from",
) {
  if (selectedField === "to") {
    return `The ${toLabel} value in this row overlaps the ${fromLabel} value in the row below. Adjust one or both to remove the overlap.`;
  }

  return `The ${toLabel} value in the row above overlaps the ${fromLabel} value in this row. Adjust one or both to remove the overlap.`;
}

export function formatOverlapsValuesSummary(
  toLabel: string,
  toValue: string,
  fromLabel: string,
  fromValue: string,
) {
  return formatGapsValuesSummary(toLabel, toValue, fromLabel, fromValue);
}

export function areOverlapsValuesEqual(toValue: string, fromValue: string) {
  return areGapsValuesEqual(toValue, fromValue);
}
