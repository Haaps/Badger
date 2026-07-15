export type NumericValidationOptions = {
  /** Minimum allowed value (inclusive). */
  minValue?: number;
  /** Maximum allowed value (inclusive). */
  maxValue?: number;
  /** Maximum decimal places allowed. */
  decimalMax?: number;
};

function countDecimalPlaces(value: string) {
  const trimmed = value.trim();
  const decimalIndex = trimmed.indexOf(".");
  if (decimalIndex === -1) {
    return 0;
  }

  return trimmed.slice(decimalIndex + 1).length;
}

function parseNumericValue(value: string) {
  const trimmed = value.trim();
  if (trimmed === "" || !/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Returns true when `value` is a finite number and satisfies optional min/max/decimal constraints. */
export function isValidNumericValue(value: string, options: NumericValidationOptions = {}) {
  const parsed = parseNumericValue(value);
  if (parsed === null) {
    return false;
  }

  if (options.minValue !== undefined && parsed < options.minValue) {
    return false;
  }

  if (options.maxValue !== undefined && parsed > options.maxValue) {
    return false;
  }

  if (
    options.decimalMax !== undefined &&
    countDecimalPlaces(value) > options.decimalMax
  ) {
    return false;
  }

  return true;
}

export function getNumericValidationErrorMessage(
  value: string,
  options: NumericValidationOptions = {},
) {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "Enter a numeric value";
  }

  if (parseNumericValue(trimmed) === null) {
    return "Must be numeric";
  }

  const parsed = parseNumericValue(trimmed)!;

  if (options.minValue !== undefined && parsed < options.minValue) {
    return `Must be at least ${options.minValue}`;
  }

  if (options.maxValue !== undefined && parsed > options.maxValue) {
    return `Must be at most ${options.maxValue}`;
  }

  if (
    options.decimalMax !== undefined &&
    countDecimalPlaces(trimmed) > options.decimalMax
  ) {
    return `Cannot exceed ${options.decimalMax} decimal places`;
  }

  return "Must be numeric";
}

export function parseNewDecimalLimitValue(newLimit: string) {
  const parsedLimit = Number.parseInt(newLimit.trim(), 10);
  return Number.isFinite(parsedLimit) && parsedLimit >= 0 ? parsedLimit : null;
}

export function roundToDecimalLimit(value: string, decimalMax: number) {
  const parsed = parseNumericValue(value);
  if (parsed === null) {
    return value.trim();
  }

  const factor = 10 ** decimalMax;
  const rounded = Math.round(parsed * factor) / factor;
  return rounded.toFixed(decimalMax);
}
