import type { SelectMenuOption } from "../SelectMenu";
import { createHoleOptions } from "../SelectMenu";

export const DEMO_INVALID_VALUE = "xyz123";
export const DEMO_CELL_COUNT = 12;
export const DEMO_HOLE_COUNT = 5;
export const DEMO_AFFECTED_ROWS = 12;

export const DEMO_VALUE_OPTIONS: SelectMenuOption[] = [
  { value: "bnd", label: "Bnd" },
  { value: "lst-a", label: "List Value A" },
  { value: "lst-b", label: "List Value B" },
  { value: "lst-c", label: "List Value C" },
];

export const DEMO_HOLE_OPTIONS = createHoleOptions(8);
export const DEMO_DEFAULT_SELECTED_HOLES = ["abc-00-003"];
