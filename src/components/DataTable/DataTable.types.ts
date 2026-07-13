import type { SummaryPanelState, SummaryApplyScope } from "../SummaryPanel";

/** Validation lifecycle mirrored on table cells and synced with SummaryPanel. */
export type TableCellStatus = "error" | "staged" | "approved";

/** Rich cell payload for validation columns; plain strings render as read-only text. */
export type DataTableCellValue = {
  value: string;
  status?: TableCellStatus;
  panelState?: SummaryPanelState;
  invalidValue?: string;
  cellCount?: number;
  holeCount?: number;
  initialStagedValue?: string;
  /** How this correction was applied (restored when re-selecting the cell). */
  applyScope?: SummaryApplyScope;
  /** Drill holes included when applyScope is "holes". */
  appliedHoles?: string[];
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
