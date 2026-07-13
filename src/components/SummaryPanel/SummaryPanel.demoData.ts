/** Gallery-only demo constants and helpers. Do not rely on these in production. */
import type { SelectMenuOption } from "../SelectMenu";
import { createHoleOptions } from "../SelectMenu";

export const DEMO_INVALID_VALUE = "xyz123";
export const DEMO_CELL_COUNT = 12;
export const DEMO_HOLE_COUNT = 5;
export const DEMO_AFFECTED_ROWS = 12;

export const DEMO_BOOLEAN_INVALID_VALUE = "maybe";
export const DEMO_BOOLEAN_CELL_COUNT = 17;
export const DEMO_BOOLEAN_HOLE_COUNT = 2;
export const DEMO_BOOLEAN_INITIAL_STAGED_VALUE = "true";

export const DEMO_BOOLEAN_VALUE_OPTIONS = [
  { value: "true", label: "True" },
  { value: "false", label: "False" },
];

export const DEMO_DATE_INVALID_VALUE = "15-03-2024";
export const DEMO_DATE_FORMAT = "yyyy/mm/dd";
export const DEMO_DATE_CELL_COUNT = 8;
export const DEMO_DATE_HOLE_COUNT = 3;
export const DEMO_DATE_INITIAL_STAGED_VALUE = "2024/03/15";

export const DEMO_VALUE_OPTIONS: SelectMenuOption[] = [
  { value: "bnd", label: "Bnd" },
  { value: "lst-a", label: "List Value A" },
  { value: "lst-b", label: "List Value B" },
  { value: "lst-c", label: "List Value C" },
];

export const DEMO_HOLE_OPTIONS = createHoleOptions(8);
export const DEMO_DEFAULT_SELECTED_HOLES = ["abc-00-003"];

export const DEMO_TEXT_INVALID_VALUE = "13.222 m";
export const DEMO_TEXT_CELL_COUNT = 3;
export const DEMO_TEXT_HOLE_COUNT = 2;
export const DEMO_TEXT_INITIAL_STAGED_VALUE = "13.2 m";

export const DEMO_MISSING_CELL_COUNT = 12;
export const DEMO_MISSING_HOLE_COUNT = 2;

export const DEMO_CHARACTER_LIMIT = 500;
// Ends on a complete word ("Structural dip ") so the full original text does not
// look accidentally truncated beside the 500-character trimmed preview.
export const DEMO_ENTERED_CHARACTER_COUNT = 552;
export const DEMO_MAX_ENTERED_CHARACTER_COUNT_IN_SELECTION = 1200;

const GEOLOGICAL_SUMMARY_BASE =
  "Drill hole summary: interbedded sandstone and siltstone with minor coal seams. " +
  "Grain size fines upward from basal conglomerate. Gamma values elevated through the middle section. " +
  "Structural dip averages 12 degrees to the northeast. Minor faulting observed at 145 m depth. " +
  "Aquifer risk is low based on lithology logging and sample recovery across the interval.";

export function createGeologicalSummaryText(length: number) {
  if (length <= 0) {
    return "";
  }

  let text = "";
  while (text.length < length) {
    text += GEOLOGICAL_SUMMARY_BASE;
    if (text.length < length) {
      text += " ";
    }
  }

  return text.slice(0, length);
}

export const DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT = createGeologicalSummaryText(
  DEMO_ENTERED_CHARACTER_COUNT,
);
