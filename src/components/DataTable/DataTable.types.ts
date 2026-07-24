import type {
  SummaryApplyScope,
  SummaryErrorType,
  SummaryPanelProps,
  SummaryPanelState,
  SummaryValidationType,
} from "../SummaryPanel";

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
  /** Column validation kind — drives Summary Panel resolution UI. */
  validationType?: SummaryValidationType;
  /** Validation error category — drives Summary Panel copy and inputs. */
  errorType?: SummaryErrorType;
  /** Additional Summary Panel props for this cell's validation scenario. */
  panelProps?: Partial<SummaryPanelProps>;
  /** Other cell in a gaps/overlaps pair (previous row To ↔ current row From). */
  gapsPartner?: {
    rowId: string;
    columnId: string;
  };
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
  /** Duplicate row staged for deletion — fades row data and shows hatch overlay. */
  pendingDeletion?: boolean;
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
