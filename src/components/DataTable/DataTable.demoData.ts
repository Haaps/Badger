import type { DataTableColumn, DataTableCellValue, DataTableRow } from "./DataTable.types";

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
  { id: "sampleType", label: "Sample_Type" },
  { id: "assayAu", label: "Assay_Au" },
  { id: "assayCu", label: "Assay_Cu" },
  { id: "recoveryPct", label: "Recovery_Pct" },
  { id: "alteration", label: "Alteration" },
  { id: "geologist", label: "Geologist" },
  { id: "dateLogged", label: "Date_Logged" },
  { id: "structureCode", label: "Structure_Code" },
];

export const DEMO_HOLE_NUMBERS = [
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
  "RJ230",
  "RJ231",
  "RJ232",
  "RJ233",
  "RJ234",
  "RJ235",
  "RJ236",
] as const;

const GEOLOGISTS = ["M. Chen", "A. Okonkwo", "J. Rivera", "S. Patel", "L. Nguyen"] as const;
const SAMPLE_TYPES = ["Core", "RC", "Chip"] as const;
const STRUCTURE_CODES = ["F1-NE", "F2-NW", "F3-E", "F4-SW", "F5-W"] as const;
const LITHO_VALUES = ["PP", "Sap", "Bnd", "Lst"] as const;
const LEGACY_CODES = ["Zqsmu", "Zanco", "Bnd", "Lst"] as const;

function createErrorCell(
  value: string,
  overrides: Partial<DataTableCellValue> = {},
): DataTableCellValue {
  return {
    value,
    status: "error",
    panelState: "editable",
    invalidValue: value,
    ...overrides,
  };
}

function createGeneratedRow(index: number): DataTableRow {
  const holeNumber = DEMO_HOLE_NUMBERS[index % DEMO_HOLE_NUMBERS.length];
  const from = (index * 4.5).toFixed(1);
  const to = ((index + 1) * 4.5).toFixed(1);
  const length = ((index + 1) * 4.5 - index * 4.5).toFixed(1);
  const litho = LITHO_VALUES[index % LITHO_VALUES.length];
  const recovery = (90 + (index % 10)).toFixed(1);
  const assayCu = (0.02 + (index % 15) * 0.05).toFixed(2);
  const alteration = index % 5 === 0 ? "Silicic" : "Argillic";
  const legacyCode = LEGACY_CODES[index % LEGACY_CODES.length];

  let lithoDomain: DataTableCellValue | string = litho;
  if (index % 11 === 0) {
    lithoDomain = createErrorCell(litho);
  }

  let recoveryPct: DataTableCellValue | string = recovery;
  if (index % 29 === 0) {
    recoveryPct = createErrorCell("badpct", {
      invalidValue: "badpct",
      value: "badpct",
    });
  }

  let assayCuCell: DataTableCellValue | string = assayCu;
  if (index % 41 === 0) {
    assayCuCell = createErrorCell("xyz123");
  }

  let alterationCell: DataTableCellValue | string = alteration;
  if (index % 47 === 0) {
    alterationCell = createErrorCell("unk99");
  }

  let legacyCodeCell: DataTableCellValue | string = legacyCode;
  if (index % 59 === 0) {
    legacyCodeCell = createErrorCell(legacyCode);
  }

  return {
    id: `row-${index}`,
    cells: {
      holeNumber,
      from,
      to,
      length,
      rcDd: index % 3 === 0 ? "RC" : "",
      lithoDomain,
      legacyCode: legacyCodeCell,
      minDiagnostic: index % 2 === 0 ? "OIC" : "BND",
      oxidation: index % 4 === 0 ? "Oxidized" : "",
      sampleType: SAMPLE_TYPES[index % SAMPLE_TYPES.length],
      assayAu: (0.1 + (index % 20) * 0.11).toFixed(2),
      assayCu: assayCuCell,
      recoveryPct,
      alteration: alterationCell,
      geologist: GEOLOGISTS[index % GEOLOGISTS.length],
      dateLogged: `2024-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
      structureCode: STRUCTURE_CODES[index % STRUCTURE_CODES.length],
    },
  };
}

const FEATURED_ROWS: DataTableRow[] = [
  {
    id: "row-1",
    cells: {
      holeNumber: "RJ220",
      from: "48.0",
      to: "96.0",
      length: "48.0",
      rcDd: "",
      lithoDomain: createErrorCell("PP"),
      legacyCode: "Zqsmu",
      minDiagnostic: "OIC",
      oxidation: "Oxidized",
      sampleType: "Core",
      assayAu: "1.24",
      assayCu: "0.31",
      recoveryPct: "98.2",
      alteration: "Argillic",
      geologist: "M. Chen",
      dateLogged: "2024-02-18",
      structureCode: "F2-NW",
    },
  },
  {
    id: "row-2",
    cells: {
      holeNumber: "RJ220",
      from: "100.0",
      to: "105.0",
      length: "5.0",
      rcDd: "",
      lithoDomain: createErrorCell("PP"),
      legacyCode: "Zqsmu",
      minDiagnostic: "OIC",
      oxidation: "",
      sampleType: "Chip",
      assayAu: "0.87",
      assayCu: "0.22",
      recoveryPct: createErrorCell("badpct", {
        invalidValue: "badpct",
        value: "badpct",
      }),
      alteration: "Phyllic",
      geologist: "A. Okonkwo",
      dateLogged: "2024-02-22",
      structureCode: "F1-NE",
    },
  },
  {
    id: "row-3",
    cells: {
      holeNumber: "RJ220",
      from: "105.0",
      to: "110.0",
      length: "5.0",
      rcDd: "",
      lithoDomain: createErrorCell("PP"),
      legacyCode: "Zanco",
      minDiagnostic: "OIC",
      oxidation: "Partial",
      sampleType: "Core",
      assayAu: "2.15",
      assayCu: createErrorCell("xyz123"),
      recoveryPct: "94.1",
      alteration: createErrorCell("unk99"),
      geologist: "J. Rivera",
      dateLogged: "2024-03-01",
      structureCode: "F3-E",
    },
  },
  {
    id: "row-4",
    cells: {
      holeNumber: "RJ220",
      from: "107.0",
      to: "120.0",
      length: "13.222",
      rcDd: "",
      lithoDomain: createErrorCell("PP"),
      legacyCode: "Zanco",
      minDiagnostic: "OIC",
      oxidation: "",
      sampleType: "Core",
      assayAu: "0.55",
      assayCu: "0.09",
      recoveryPct: "91.8",
      alteration: "Silicic",
      geologist: "M. Chen",
      dateLogged: "2024-03-14",
      structureCode: "F1-NE",
    },
  },
  {
    id: "row-5",
    cells: {
      holeNumber: "RJ221",
      from: "0.0",
      to: "45.0",
      length: "45.0",
      rcDd: "RC",
      lithoDomain: createErrorCell("Sap"),
      legacyCode: "Bnd",
      minDiagnostic: createErrorCell("BND"),
      oxidation: "Fresh",
      sampleType: "RC",
      assayAu: "0.12",
      assayCu: "0.04",
      recoveryPct: "99.0",
      alteration: "Propylitic",
      geologist: "A. Okonkwo",
      dateLogged: "2024-01-09",
      structureCode: "F4-SW",
    },
  },
  {
    id: "row-6",
    cells: {
      holeNumber: "RJ221",
      from: "45.0",
      to: "90.0",
      length: "45.0",
      rcDd: "RC",
      lithoDomain: createErrorCell("PP"),
      legacyCode: "Lst",
      minDiagnostic: "LST",
      oxidation: "Oxidized",
      sampleType: "RC",
      assayAu: "3.44",
      assayCu: "0.67",
      recoveryPct: "97.3",
      alteration: createErrorCell("Silicic"),
      geologist: "J. Rivera",
      dateLogged: "2024-01-11",
      structureCode: "F2-NW",
    },
  },
];

const GENERATED_ROW_COUNT = 311;

export const DEMO_TABLE_ROWS: DataTableRow[] = [
  ...FEATURED_ROWS,
  ...Array.from({ length: GENERATED_ROW_COUNT }, (_, index) =>
    createGeneratedRow(index + FEATURED_ROWS.length + 1),
  ),
];
