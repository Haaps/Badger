import {
  DEMO_BOOLEAN_INVALID_VALUE,
  DEMO_BOOLEAN_VALUE_OPTIONS,
  DEMO_CHARACTER_LIMIT,
  DEMO_DATE_FORMAT,
  DEMO_DATE_INVALID_VALUE,
  DEMO_DATE_TIME_FORMAT,
  DEMO_DATE_TIME_INVALID_VALUE,
  DEMO_DECIMAL_MAX,
  DEMO_ENTERED_CHARACTER_COUNT,
  DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
  DEMO_ENTERED_DECIMAL_COUNT,
  DEMO_GAPS_FROM_LABEL,
  DEMO_GAPS_FROM_VALUE,
  DEMO_GAPS_TO_LABEL,
  DEMO_GAPS_TO_VALUE,
  DEMO_DUPLICATES_FROM_LABEL,
  DEMO_DUPLICATES_TO_LABEL,
  DEMO_OVERLAPS_FROM_LABEL,
  DEMO_OVERLAPS_FROM_VALUE,
  DEMO_OVERLAPS_TO_LABEL,
  DEMO_OVERLAPS_TO_VALUE,
  DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
  DEMO_NUMERIC_ABOVE_MAX_VALUE,
  DEMO_NUMERIC_BELOW_MIN_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_VALUE,
  DEMO_NUMERIC_INVALID_VALUE,
  DEMO_NUMERIC_MAX_VALUE,
  DEMO_NUMERIC_MIN_VALUE,
} from "../SummaryPanel";
import type { SummaryErrorType, SummaryPanelProps, SummaryValidationType } from "../SummaryPanel";
import type { DataTableColumn, DataTableCellValue, DataTableRow } from "./DataTable.types";

export const DEMO_TABLE_HOLE_NUMBERS = [
  "RJ220",
  "RJ221",
  "RJ222",
  "RJ223",
  "RJ224",
  "RJ225",
  "RJ226",
  "RJ227",
  "RJ228",
  "RJ229",
] as const;

const LIST_INVALID_VALUE = "PP";

export const DEMO_TABLE_COLUMNS: DataTableColumn[] = [
  { id: "holeNumber", label: "Hole Number" },
  { id: "from", label: "From" },
  { id: "to", label: "To" },
  { id: "length", label: "Length" },
  { id: "rcDd", label: "RC/DD" },
  { id: "lithoDomain", label: "Litho_Domain" },
  { id: "legacyCode", label: "Legacy_Code" },
  { id: "minDiagnostic", label: "Min_Diagnostic" },
  { id: "oxidation", label: "Oxidation" },
  { id: "verified", label: "Verified" },
  { id: "sampleType", label: "Sample_Type" },
  { id: "assayAu", label: "Assay_Au" },
  { id: "assayCu", label: "Assay_Cu" },
  { id: "recoveryPct", label: "Recovery_Pct" },
  { id: "alteration", label: "Alteration" },
  { id: "geologist", label: "Geologist" },
  { id: "dateLogged", label: "Date_Logged" },
  { id: "loggedAt", label: "Logged_At" },
  { id: "structureCode", label: "Structure_Code" },
];

type ValidationCellOptions = {
  invalidValue?: string;
  panelProps?: Partial<SummaryPanelProps>;
};

function formatDepth(value: number) {
  return `${value}.0`;
}

function createIntervalCells(from: number, to: number) {
  return {
    from: formatDepth(from),
    to: formatDepth(to),
    length: formatDepth(to - from),
  };
}

function createValidationCell(
  value: string,
  validationType: SummaryValidationType,
  errorType: SummaryErrorType,
  options: ValidationCellOptions = {},
): DataTableCellValue {
  return {
    value,
    status: "error",
    panelState: "editable",
    invalidValue: options.invalidValue ?? value,
    validationType,
    errorType,
    cellCount: 1,
    holeCount: 0,
    panelProps: options.panelProps,
  };
}

function getNumericPanelProps(
  errorType: SummaryErrorType,
  invalidValue: string,
): Partial<SummaryPanelProps> {
  const shared = {
    decimalMax: DEMO_DECIMAL_MAX,
    minValue: DEMO_NUMERIC_MIN_VALUE,
    maxValue: DEMO_NUMERIC_MAX_VALUE,
    invalidValue,
  };

  switch (errorType) {
    case "exceeded-decimal-limit":
    case "exceeded-decimal-below-min":
    case "exceeded-decimal-above-max":
      return {
        ...shared,
        enteredDecimalCount: DEMO_ENTERED_DECIMAL_COUNT,
        maxEnteredDecimalCountInSelection: DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
      };
    default:
      return shared;
  }
}

function createNumericErrorCell(
  errorType: SummaryErrorType,
  value: string,
  invalidValue: string = value,
) {
  return createValidationCell(value, "numeric", errorType, {
    invalidValue,
    panelProps: getNumericPanelProps(errorType, invalidValue),
  });
}

function createListInvalidCell() {
  return createValidationCell(LIST_INVALID_VALUE, "list", "invalid-value");
}

function createBaseCells(overrides: Partial<Record<string, DataTableCellValue | string>> = {}) {
  return {
    holeNumber: "RJ220",
    ...createIntervalCells(0, 10),
    rcDd: "RC",
    lithoDomain: "Bnd",
    legacyCode: "Zqsmu",
    minDiagnostic: "OIC",
    oxidation: "Oxidized",
    verified: "True",
    sampleType: "Core",
    assayAu: "1.24",
    assayCu: "0.31",
    recoveryPct: "98.2",
    alteration: "Argillic",
    geologist: "M. Chen",
    dateLogged: "2024/02/18",
    loggedAt: "2024/02/18 14:30:00",
    structureCode: "F2-NW",
    ...overrides,
  };
}

function createGapsPairCells(
  toRowId: string,
  fromRowId: string,
  toValue: string,
  fromValue: string,
): { toCell: DataTableCellValue; fromCell: DataTableCellValue } {
  const panelProps = {
    toLabel: DEMO_GAPS_TO_LABEL,
    fromLabel: DEMO_GAPS_FROM_LABEL,
  };
  const shared = {
    validationType: "gaps" as const,
    errorType: "gaps-not-allowed" as const,
    status: "error" as const,
    panelState: "editable" as const,
    cellCount: 2,
    holeCount: 0,
    panelProps,
  };

  return {
    toCell: {
      ...shared,
      value: toValue,
      invalidValue: toValue,
      gapsPartner: { rowId: fromRowId, columnId: "from" },
    },
    fromCell: {
      ...shared,
      value: fromValue,
      invalidValue: fromValue,
      gapsPartner: { rowId: toRowId, columnId: "to" },
    },
  };
}

const DUPLICATE_INTERVAL_FROM = 270;
const DUPLICATE_INTERVAL_TO = 280;
const DUPLICATE_INTERVAL_KEY = `${formatDepth(DUPLICATE_INTERVAL_FROM)}|${formatDepth(DUPLICATE_INTERVAL_TO)}`;

function createDuplicatesIntervalCells(from: number, to: number) {
  const fromValue = formatDepth(from);
  const toValue = formatDepth(to);
  const panelProps = {
    toValue,
    fromValue,
    toLabel: DEMO_DUPLICATES_TO_LABEL,
    fromLabel: DEMO_DUPLICATES_FROM_LABEL,
  };
  const shared = {
    validationType: "duplicates" as const,
    errorType: "duplicates-not-allowed" as const,
    status: "error" as const,
    panelState: "editable" as const,
    invalidValue: DUPLICATE_INTERVAL_KEY,
    cellCount: 2,
    holeCount: 2,
    panelProps,
  };

  return {
    from: {
      ...shared,
      value: fromValue,
    },
    to: {
      ...shared,
      value: toValue,
    },
    length: formatDepth(to - from),
  };
}

function createOverlapsPairCells(
  toRowId: string,
  fromRowId: string,
  toValue: string,
  fromValue: string,
): { toCell: DataTableCellValue; fromCell: DataTableCellValue } {
  const panelProps = {
    toLabel: DEMO_OVERLAPS_TO_LABEL,
    fromLabel: DEMO_OVERLAPS_FROM_LABEL,
  };
  const shared = {
    validationType: "overlaps" as const,
    errorType: "overlaps-not-allowed" as const,
    status: "error" as const,
    panelState: "editable" as const,
    cellCount: 2,
    holeCount: 0,
    panelProps,
  };

  return {
    toCell: {
      ...shared,
      value: toValue,
      invalidValue: toValue,
      gapsPartner: { rowId: fromRowId, columnId: "from" },
    },
    fromCell: {
      ...shared,
      value: fromValue,
      invalidValue: fromValue,
      gapsPartner: { rowId: toRowId, columnId: "to" },
    },
  };
}

function createIntervalRow(
  id: string,
  from: number,
  to: number,
  holeNumber: string,
  overrides: Partial<Record<string, DataTableCellValue | string>> = {},
): DataTableRow {
  return {
    id,
    cells: createBaseCells({
      holeNumber,
      ...createIntervalCells(from, to),
      ...overrides,
    }),
  };
}

const GAPS_INTERVAL_END_ROW_ID = "validation-gaps-interval-end";
const GAPS_INTERVAL_START_ROW_ID = "validation-gaps-interval-start";

const GAPS_PAIR = createGapsPairCells(
  GAPS_INTERVAL_END_ROW_ID,
  GAPS_INTERVAL_START_ROW_ID,
  DEMO_GAPS_TO_VALUE,
  DEMO_GAPS_FROM_VALUE,
);

const OVERLAPS_INTERVAL_END_ROW_ID = "validation-overlaps-interval-end";
const OVERLAPS_INTERVAL_START_ROW_ID = "validation-overlaps-interval-start";

const OVERLAPS_PAIR = createOverlapsPairCells(
  OVERLAPS_INTERVAL_END_ROW_ID,
  OVERLAPS_INTERVAL_START_ROW_ID,
  DEMO_OVERLAPS_TO_VALUE,
  DEMO_OVERLAPS_FROM_VALUE,
);

/** Intervals run 0→10, 10→20, 20→30, then a gap (30 vs 40), overlap (280 vs 278), then validation errors continue 50→60, … */
export const DEMO_TABLE_ROWS: DataTableRow[] = [
  createIntervalRow("validation-interval-0-10", 0, 10, DEMO_TABLE_HOLE_NUMBERS[0]),
  createIntervalRow("validation-interval-10-20", 10, 20, DEMO_TABLE_HOLE_NUMBERS[0]),
  createIntervalRow(GAPS_INTERVAL_END_ROW_ID, 20, 30, DEMO_TABLE_HOLE_NUMBERS[0], {
    to: GAPS_PAIR.toCell,
  }),
  createIntervalRow(GAPS_INTERVAL_START_ROW_ID, 40, 50, DEMO_TABLE_HOLE_NUMBERS[0], {
    from: GAPS_PAIR.fromCell,
  }),
  createIntervalRow(OVERLAPS_INTERVAL_END_ROW_ID, 270, 280, DEMO_TABLE_HOLE_NUMBERS[1], {
    to: OVERLAPS_PAIR.toCell,
  }),
  createIntervalRow(OVERLAPS_INTERVAL_START_ROW_ID, 278, 290, DEMO_TABLE_HOLE_NUMBERS[1], {
    from: OVERLAPS_PAIR.fromCell,
  }),
  ...DEMO_TABLE_HOLE_NUMBERS.slice(0, 8).map((holeNumber, index) =>
    createIntervalRow(
      `validation-list-invalid-${holeNumber}`,
      50 + index * 10,
      60 + index * 10,
      holeNumber,
      {
        lithoDomain: createListInvalidCell(),
      },
    ),
  ),
  createIntervalRow("validation-list-missing", 130, 140, DEMO_TABLE_HOLE_NUMBERS[8], {
    lithoDomain: createValidationCell("", "list", "missing-value", {
      invalidValue: "",
    }),
  }),
  createIntervalRow(
    "validation-text-exceeded-character-limit",
    140,
    150,
    DEMO_TABLE_HOLE_NUMBERS[1],
    {
      alteration: createValidationCell(DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT, "text", "exceeded-character-limit", {
        panelProps: {
          characterLimit: DEMO_CHARACTER_LIMIT,
          enteredCharacterCount: DEMO_ENTERED_CHARACTER_COUNT,
          exceededLimitCellText: DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
        },
      }),
    },
  ),
  createIntervalRow("validation-text-value-required", 150, 160, DEMO_TABLE_HOLE_NUMBERS[2], {
    alteration: createValidationCell("", "text", "value-required", {
      invalidValue: "",
    }),
  }),
  createIntervalRow("validation-boolean-invalid", 160, 170, DEMO_TABLE_HOLE_NUMBERS[3], {
    verified: createValidationCell(DEMO_BOOLEAN_INVALID_VALUE, "boolean", "invalid-value", {
      panelProps: {
        booleanValueOptions: DEMO_BOOLEAN_VALUE_OPTIONS,
      },
    }),
  }),
  createIntervalRow("validation-boolean-missing", 170, 180, DEMO_TABLE_HOLE_NUMBERS[4], {
    verified: createValidationCell("", "boolean", "missing-value", {
      invalidValue: "",
      panelProps: {
        booleanValueOptions: DEMO_BOOLEAN_VALUE_OPTIONS,
      },
    }),
  }),
  createIntervalRow("validation-date-invalid", 180, 190, DEMO_TABLE_HOLE_NUMBERS[5], {
    dateLogged: createValidationCell(DEMO_DATE_INVALID_VALUE, "date", "invalid-value", {
      panelProps: {
        dateFormat: DEMO_DATE_FORMAT,
      },
    }),
  }),
  createIntervalRow("validation-date-time-invalid", 190, 200, DEMO_TABLE_HOLE_NUMBERS[6], {
    loggedAt: createValidationCell(DEMO_DATE_TIME_INVALID_VALUE, "date-time", "invalid-value", {
      panelProps: {
        dateTimeFormat: DEMO_DATE_TIME_FORMAT,
      },
    }),
  }),
  createIntervalRow(
    "validation-numeric-exceeded-decimal-limit",
    200,
    210,
    DEMO_TABLE_HOLE_NUMBERS[7],
    {
      assayAu: createNumericErrorCell(
        "exceeded-decimal-limit",
        DEMO_NUMERIC_EXCEEDED_DECIMAL_VALUE,
      ),
    },
  ),
  createIntervalRow(
    "validation-numeric-exceeded-decimal-below-min",
    210,
    220,
    DEMO_TABLE_HOLE_NUMBERS[8],
    {
      assayAu: createNumericErrorCell(
        "exceeded-decimal-below-min",
        DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_VALUE,
      ),
    },
  ),
  createIntervalRow(
    "validation-numeric-exceeded-decimal-above-max",
    220,
    230,
    DEMO_TABLE_HOLE_NUMBERS[9],
    {
      assayAu: createNumericErrorCell(
        "exceeded-decimal-above-max",
        DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_VALUE,
      ),
    },
  ),
  createIntervalRow("validation-numeric-missing", 230, 240, DEMO_TABLE_HOLE_NUMBERS[0], {
    assayAu: createNumericErrorCell("missing-value", "", ""),
  }),
  createIntervalRow("validation-numeric-invalid", 240, 250, DEMO_TABLE_HOLE_NUMBERS[1], {
    assayAu: createNumericErrorCell("invalid-value", DEMO_NUMERIC_INVALID_VALUE),
  }),
  createIntervalRow("validation-numeric-below-min", 250, 260, DEMO_TABLE_HOLE_NUMBERS[2], {
    assayAu: createNumericErrorCell("below-min-value", DEMO_NUMERIC_BELOW_MIN_VALUE),
  }),
  createIntervalRow("validation-numeric-above-max", 260, 270, DEMO_TABLE_HOLE_NUMBERS[3], {
    assayAu: createNumericErrorCell("above-max-value", DEMO_NUMERIC_ABOVE_MAX_VALUE),
  }),
  createIntervalRow(
    "validation-duplicates-a",
    DUPLICATE_INTERVAL_FROM,
    DUPLICATE_INTERVAL_TO,
    DEMO_TABLE_HOLE_NUMBERS[4],
    createDuplicatesIntervalCells(DUPLICATE_INTERVAL_FROM, DUPLICATE_INTERVAL_TO),
  ),
  createIntervalRow(
    "validation-duplicates-b",
    DUPLICATE_INTERVAL_FROM,
    DUPLICATE_INTERVAL_TO,
    DEMO_TABLE_HOLE_NUMBERS[5],
    createDuplicatesIntervalCells(DUPLICATE_INTERVAL_FROM, DUPLICATE_INTERVAL_TO),
  ),
];
