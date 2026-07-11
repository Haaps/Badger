import type { SummaryPanelState } from "../SummaryPanel";

export type TableCellStatus = "error" | "staged" | "approved";

export type DataTableCellValue = {
  value: string;
  status?: TableCellStatus;
  panelState?: SummaryPanelState;
  invalidValue?: string;
  cellCount?: number;
  holeCount?: number;
  initialStagedValue?: string;
};

export type DataTableColumn = {
  id: string;
  label: string;
};

export type DataTableRow = {
  id: string;
  cells: Record<string, DataTableCellValue | string>;
};

export type SelectedTableCell = {
  rowId: string;
  columnId: string;
  cell: DataTableCellValue;
};

export type DataTableProps = {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  selectedCell?: SelectedTableCell | null;
  onCellSelect?: (selection: SelectedTableCell) => void;
  className?: string;
  "aria-label"?: string;
};

export type DataTableWithSummaryProps = {
  columns?: DataTableColumn[];
  rows?: DataTableRow[];
  className?: string;
  "aria-label"?: string;
};
