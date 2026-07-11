import type { DataTableColumn, DataTableRow } from "./DataTable.types";

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
];

const FIGMA_REPEAT_ROW = {
  holeNumber: "RJ220",
  from: "107.0",
  to: "120.0",
  length: "13.222",
  rcDd: "",
  lithoDomain: "PP",
  legacyCode: "Zanco",
  minDiagnostic: "OIC",
  oxidation: "",
} as const;

function createRepeatRow(index: number): DataTableRow {
  return {
    id: `row-${index}`,
    cells: { ...FIGMA_REPEAT_ROW },
  };
}

export const DEMO_TABLE_ROWS: DataTableRow[] = [
  {
    id: "row-1",
    cells: {
      holeNumber: "RJ220",
      from: "48.0",
      to: "96.0",
      length: "48.0",
      rcDd: "",
      lithoDomain: {
        value: "PP",
        status: "approved",
        panelState: "approved",
        invalidValue: "PP",
        cellCount: 1,
        holeCount: 1,
        initialStagedValue: "bnd",
      },
      legacyCode: "Zqsmu",
      minDiagnostic: "OIC",
      oxidation: "",
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
      lithoDomain: {
        value: "PP",
        status: "staged",
        panelState: "staged",
        invalidValue: "PP",
        cellCount: 2,
        holeCount: 1,
        initialStagedValue: "lst-a",
      },
      legacyCode: "Zqsmu",
      minDiagnostic: "OIC",
      oxidation: "",
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
      lithoDomain: {
        value: "PP",
        status: "error",
        panelState: "editable",
        invalidValue: "PP",
        cellCount: 4,
        holeCount: 2,
      },
      legacyCode: "Zanco",
      minDiagnostic: "OIC",
      oxidation: "",
    },
  },
  {
    id: "row-4",
    cells: {
      holeNumber: "RJ220",
      from: "107.0",
      to: "120.0",
      length: {
        value: "13.222",
        status: "error",
        panelState: "editable",
        invalidValue: "13.222",
        cellCount: 3,
        holeCount: 1,
      },
      rcDd: "",
      lithoDomain: {
        value: "PP",
        status: "error",
        panelState: "editable",
        invalidValue: "PP",
        cellCount: 4,
        holeCount: 2,
      },
      legacyCode: "Zanco",
      minDiagnostic: "OIC",
      oxidation: "",
    },
  },
  ...Array.from({ length: 13 }, (_, index) => createRepeatRow(index + 5)),
];
