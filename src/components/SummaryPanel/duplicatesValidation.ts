import {
  formatGapsValuesSummary,
  getGapsStagedValue,
  isValidGapsValue,
  parseGapsStagedValue,
} from "./gapsValidation";
import type { DuplicateResolution } from "./SummaryPanel.types";

export function parseDuplicatesStagedValue(value: string): {
  resolution: DuplicateResolution;
  toValue: string;
  fromValue: string;
} {
  if (value === "delete-row") {
    return { resolution: "delete-row", toValue: "", fromValue: "" };
  }

  if (value.startsWith("edit:")) {
    const parsed = parseGapsStagedValue(value.slice("edit:".length));
    return {
      resolution: "edit-manually",
      toValue: parsed.toValue,
      fromValue: parsed.fromValue,
    };
  }

  return { resolution: "delete-row", toValue: "", fromValue: "" };
}

export function getDuplicatesStagedValue(
  resolution: DuplicateResolution,
  toValue: string,
  fromValue: string,
) {
  if (resolution === "delete-row") {
    return "delete-row";
  }

  return `edit:${getGapsStagedValue(toValue, fromValue)}`;
}

export function isDuplicateInterval(
  fromValue: string,
  toValue: string,
  duplicateFrom: string,
  duplicateTo: string,
) {
  return (
    fromValue.trim() === duplicateFrom.trim() && toValue.trim() === duplicateTo.trim()
  );
}

export function isValidDuplicatesEditResolution(
  toValue: string,
  fromValue: string,
  duplicateFrom: string,
  duplicateTo: string,
) {
  const trimmedTo = toValue.trim();
  const trimmedFrom = fromValue.trim();

  if (trimmedTo === "" || trimmedFrom === "") {
    return false;
  }

  if (!isValidGapsValue(trimmedTo) || !isValidGapsValue(trimmedFrom)) {
    return false;
  }

  return !isDuplicateInterval(trimmedFrom, trimmedTo, duplicateFrom, duplicateTo);
}

export function getDuplicatesSummaryMessage(rowCount: number) {
  return `${rowCount} rows have identical From and To values.`;
}

export function getDuplicatesFieldErrorMessage(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return "Enter a numeric value";
  }

  if (!isValidGapsValue(trimmed)) {
    return "Must be numeric";
  }

  return "";
}

export function getDuplicatesEditFieldErrorMessage(
  value: string,
  toValue: string,
  fromValue: string,
  duplicateFrom: string,
  duplicateTo: string,
  field: "to" | "from",
  toLabel = "To",
  fromLabel = "From",
) {
  const basicError = getDuplicatesFieldErrorMessage(value);
  if (basicError) {
    return basicError;
  }

  const trimmedTo = field === "to" ? value.trim() : toValue.trim();
  const trimmedFrom = field === "from" ? value.trim() : fromValue.trim();

  if (
    trimmedTo !== "" &&
    trimmedFrom !== "" &&
    isValidGapsValue(trimmedTo) &&
    isValidGapsValue(trimmedFrom) &&
    isDuplicateInterval(trimmedFrom, trimmedTo, duplicateFrom, duplicateTo)
  ) {
    if (field === "to") {
      return `With ${fromLabel} at ${trimmedFrom}, this interval still matches the duplicate (${duplicateFrom} → ${duplicateTo})`;
    }

    return `With ${toLabel} at ${trimmedTo}, this interval still matches the duplicate (${duplicateFrom} → ${duplicateTo})`;
  }

  return "";
}

export function getDuplicatesStagedDisplayText(
  resolution: DuplicateResolution,
  toLabel: string,
  toValue: string,
  fromLabel: string,
  fromValue: string,
) {
  if (resolution === "delete-row") {
    return "Delete this row";
  }

  return formatGapsValuesSummary(toLabel, toValue, fromLabel, fromValue);
}
