type DateFormatPart =
  | { kind: "year"; digits: 4 | 2 }
  | { kind: "month" }
  | { kind: "day" }
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

export function getDateFormatErrorMessage(format: string) {
  return `Enter a date in ${format} format`;
}
