export type GapsValues = {
  toValue: string;
  fromValue: string;
};

function parseNumericInput(value: string) {
  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseGapsStagedValue(value: string): GapsValues {
  const toMatch = value.match(/(?:^|\|)to:([^|]*)/);
  const fromMatch = value.match(/(?:^|\|)from:([^|]*)/);

  return {
    toValue: toMatch?.[1]?.trim() ?? "",
    fromValue: fromMatch?.[1]?.trim() ?? "",
  };
}

export function getGapsStagedValue(toValue: string, fromValue: string) {
  return `to:${toValue.trim()}|from:${fromValue.trim()}`;
}

export function computeGapsGap(toValue: string, fromValue: string) {
  const parsedToValue = parseNumericInput(toValue);
  const parsedFromValue = parseNumericInput(fromValue);

  if (parsedToValue === null || parsedFromValue === null) {
    return null;
  }

  return Math.abs(parsedFromValue - parsedToValue);
}

export function formatGapsGap(gap: number) {
  return Math.abs(gap).toFixed(1);
}

export function isValidGapsValue(value: string) {
  return parseNumericInput(value) !== null;
}

export function areGapsValuesEqual(toValue: string, fromValue: string) {
  const parsedToValue = parseNumericInput(toValue);
  const parsedFromValue = parseNumericInput(fromValue);

  if (parsedToValue === null || parsedFromValue === null) {
    return false;
  }

  return parsedToValue === parsedFromValue;
}

export function isValidGapsResolution(toValue: string, fromValue: string) {
  const trimmedTo = toValue.trim();
  const trimmedFrom = fromValue.trim();

  if (trimmedTo === "" || trimmedFrom === "") {
    return false;
  }

  return areGapsValuesEqual(trimmedTo, trimmedFrom);
}

export function getGapsFieldErrorMessage(value: string, otherValue: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return "Enter a numeric value";
  }

  if (!isValidGapsValue(trimmed)) {
    return "Must be numeric";
  }

  if (otherValue.trim() !== "" && isValidGapsValue(otherValue) && !areGapsValuesEqual(trimmed, otherValue)) {
    return "Values must be equal";
  }

  return "Must be numeric";
}

export function getGapsSummaryMessage(
  fromLabel: string,
  toLabel: string,
  selectedField: "to" | "from" = "from",
) {
  if (selectedField === "to") {
    return `The ${toLabel} value in this row must match the ${fromLabel} value in the row below. Adjust one or both to remove the gap.`;
  }

  return `The ${toLabel} value in the row above must match the ${fromLabel} value in the row below. Adjust one or both to remove the gap.`;
}

export function formatGapsValuesSummary(toLabel: string, toValue: string, fromLabel: string, fromValue: string) {
  return `${toLabel}: ${toValue.trim()}, ${fromLabel}: ${fromValue.trim()}`;
}
