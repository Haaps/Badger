type DateFormatPart =
  | { kind: "year"; digits: 4 | 2 }
  | { kind: "month" }
  | { kind: "day" }
  | { kind: "literal"; value: string };

type DateTimeFormatPart =
  | { kind: "year"; digits: 4 | 2 }
  | { kind: "month" }
  | { kind: "day" }
  | { kind: "hour" }
  | { kind: "minute" }
  | { kind: "second" }
  | { kind: "literal"; value: string };

function parseDateFormat(format: string): DateFormatPart[] {
  const parts: DateFormatPart[] = [];
  let index = 0;

  while (index < format.length) {
    if (format.startsWith("yyyy", index)) {
      parts.push({ kind: "year", digits: 4 });
      index += 4;
      continue;
    }

    if (format.startsWith("yy", index)) {
      parts.push({ kind: "year", digits: 2 });
      index += 2;
      continue;
    }

    if (format.startsWith("MM", index) || format.startsWith("mm", index)) {
      parts.push({ kind: "month" });
      index += 2;
      continue;
    }

    if (format.startsWith("dd", index)) {
      parts.push({ kind: "day" });
      index += 2;
      continue;
    }

    parts.push({ kind: "literal", value: format[index] });
    index += 1;
  }

  return parts;
}

function resolveMinuteOrMonth(format: string, index: number): "month" | "minute" {
  const dayIndex = format.indexOf("dd");
  if (dayIndex === -1) {
    return "minute";
  }

  return index < dayIndex ? "month" : "minute";
}

function parseDateTimeFormat(format: string): DateTimeFormatPart[] {
  const parts: DateTimeFormatPart[] = [];
  let index = 0;

  while (index < format.length) {
    if (format.startsWith("yyyy", index)) {
      parts.push({ kind: "year", digits: 4 });
      index += 4;
      continue;
    }

    if (format.startsWith("yy", index)) {
      parts.push({ kind: "year", digits: 2 });
      index += 2;
      continue;
    }

    if (format.startsWith("dd", index)) {
      parts.push({ kind: "day" });
      index += 2;
      continue;
    }

    if (format.startsWith("HH", index) || format.startsWith("hh", index)) {
      parts.push({ kind: "hour" });
      index += 2;
      continue;
    }

    if (format.startsWith("ss", index)) {
      parts.push({ kind: "second" });
      index += 2;
      continue;
    }

    if (format.startsWith("MM", index)) {
      parts.push({ kind: "month" });
      index += 2;
      continue;
    }

    if (format.startsWith("mm", index)) {
      parts.push({
        kind: resolveMinuteOrMonth(format, index) === "month" ? "month" : "minute",
      });
      index += 2;
      continue;
    }

    parts.push({ kind: "literal", value: format[index] });
    index += 1;
  }

  return parts;
}

function isValidCalendarDate(year: number, month: number, day: number) {
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

function expandTwoDigitYear(year: number) {
  return year >= 70 ? 1900 + year : 2000 + year;
}

function isValidTimeComponent(kind: "hour" | "minute" | "second", value: number) {
  if (kind === "hour") {
    return value >= 0 && value <= 23;
  }

  return value >= 0 && value <= 59;
}

/** Returns true when `value` matches `format` (e.g. "yyyy/mm/dd") and is a real calendar date. */
export function isValidDateForFormat(value: string, format: string) {
  const trimmed = value.trim();
  if (!trimmed || !format.trim()) {
    return false;
  }

  const parts = parseDateFormat(format);
  let valueIndex = 0;
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  for (const part of parts) {
    if (part.kind === "literal") {
      if (trimmed[valueIndex] !== part.value) {
        return false;
      }
      valueIndex += 1;
      continue;
    }

    const width = part.kind === "year" ? part.digits : 2;
    const segment = trimmed.slice(valueIndex, valueIndex + width);

    if (segment.length !== width || !/^\d+$/.test(segment)) {
      return false;
    }

    const numericValue = Number(segment);

    if (part.kind === "year") {
      year = part.digits === 2 ? expandTwoDigitYear(numericValue) : numericValue;
    } else if (part.kind === "month") {
      month = numericValue;
    } else if (part.kind === "day") {
      day = numericValue;
    }

    valueIndex += width;
  }

  if (valueIndex !== trimmed.length || year === null || month === null || day === null) {
    return false;
  }

  return isValidCalendarDate(year, month, day);
}

/**
 * Returns true when `value` matches a combined date/time `format`
 * (e.g. "yyyy/mm/dd hh:mm:ss").
 */
export function isValidDateTimeForFormat(value: string, format: string) {
  const trimmed = value.trim();
  if (!trimmed || !format.trim()) {
    return false;
  }

  const parts = parseDateTimeFormat(format);
  let valueIndex = 0;
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;
  const time: Partial<Record<"hour" | "minute" | "second", number>> = {};

  for (const part of parts) {
    if (part.kind === "literal") {
      if (trimmed[valueIndex] !== part.value) {
        return false;
      }
      valueIndex += 1;
      continue;
    }

    const width = part.kind === "year" ? part.digits : 2;
    const segment = trimmed.slice(valueIndex, valueIndex + width);

    if (segment.length !== width || !/^\d+$/.test(segment)) {
      return false;
    }

    const numericValue = Number(segment);

    switch (part.kind) {
      case "year":
        year = part.digits === 2 ? expandTwoDigitYear(numericValue) : numericValue;
        break;
      case "month":
        month = numericValue;
        break;
      case "day":
        day = numericValue;
        break;
      case "hour":
        time.hour = numericValue;
        break;
      case "minute":
        time.minute = numericValue;
        break;
      case "second":
        time.second = numericValue;
        break;
    }

    valueIndex += width;
  }

  if (valueIndex !== trimmed.length) {
    return false;
  }

  const expectsDate = parts.some(
    (part) => part.kind === "year" || part.kind === "month" || part.kind === "day",
  );
  const hasDate = year !== null && month !== null && day !== null;
  if (expectsDate && !hasDate) {
    return false;
  }

  if (
    hasDate &&
    year !== null &&
    month !== null &&
    day !== null &&
    !isValidCalendarDate(year, month, day)
  ) {
    return false;
  }

  const expectsTime = parts.some(
    (part) => part.kind === "hour" || part.kind === "minute" || part.kind === "second",
  );
  if (
    expectsTime &&
    !Object.entries(time).every(([kind, numericValue]) =>
      isValidTimeComponent(kind as "hour" | "minute" | "second", numericValue),
    )
  ) {
    return false;
  }

  return !expectsTime || Object.keys(time).length > 0;
}

export function getDateFormatErrorMessage(format: string) {
  return `Must be in ${format} format`;
}

export function getDateTimeFormatErrorMessage(format: string) {
  return `Must be in ${format} format`;
}
