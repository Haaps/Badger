import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusIcon } from "../FilterBar/icons/StatusIcon";
import type { StatusFilter } from "../FilterBar";
import { SummaryPanel } from "../SummaryPanel";
import type { SummaryPanelState } from "../SummaryPanel";
import { DEMO_TABLE_COLUMNS, DEMO_TABLE_ROWS } from "./DataTable.demoData";
import type {
  DataTableCellValue,
  DataTableColumn,
  DataTableProps,
  DataTableRow,
  DataTableWithSummaryProps,
  SelectedTableCell,
  TableCellStatus,
} from "./DataTable.types";
import styles from "./DataTable.module.css";

const STATUS_TO_FILTER: Record<TableCellStatus, StatusFilter> = {
  error: "errors",
  staged: "staged",
  approved: "approved",
};

const STATUS_DISPLAY_ORDER: TableCellStatus[] = ["error", "staged", "approved"];

function normalizeCell(
  cell: DataTableCellValue | string,
): { text: string; config?: DataTableCellValue } {
  if (typeof cell === "string") {
    return { text: cell };
  }

  return {
    text: cell.value,
    config: cell,
  };
}

function panelStateToCellStatus(state: SummaryPanelState): TableCellStatus {
  switch (state) {
    case "staged":
      return "staged";
    case "approved":
      return "approved";
    default:
      return "error";
  }
}

function getColumnStatuses(rows: DataTableRow[], columnId: string): TableCellStatus[] {
  const found = new Set<TableCellStatus>();

  for (const row of rows) {
    const cell = row.cells[columnId];
    if (typeof cell === "object" && cell.status) {
      found.add(cell.status);
    }
  }

  return STATUS_DISPLAY_ORDER.filter((status) => found.has(status));
}

function updateRowCell(
  rows: DataTableRow[],
  rowId: string,
  columnId: string,
  updates: Partial<DataTableCellValue>,
): DataTableRow[] {
  return rows.map((row) => {
    if (row.id !== rowId) return row;

    const cell = row.cells[columnId];
    if (typeof cell !== "object") return row;

    return {
      ...row,
      cells: {
        ...row.cells,
        [columnId]: {
          ...cell,
          ...updates,
        },
      },
    };
  });
}

function getCellClassName(
  status: TableCellStatus | undefined,
  selectable: boolean,
  selected: boolean,
) {
  return [
    styles.cell,
    status === "error" && styles.cellStatusError,
    status === "staged" && styles.cellStatusStaged,
    status === "approved" && styles.cellStatusApproved,
    status && styles.cellStatus,
    selectable && styles.cellSelectable,
    selected && status === "error" && styles.cellSelectedError,
    selected && status === "staged" && styles.cellSelectedStaged,
    selected && status === "approved" && styles.cellSelectedApproved,
  ]
    .filter(Boolean)
    .join(" ");
}

function getSelectionKey(selection: SelectedTableCell | null | undefined) {
  if (!selection) return null;
  return `${selection.rowId}:${selection.columnId}`;
}

function scrollCellIntoView(element: HTMLElement | null | undefined) {
  if (!element) return;

  requestAnimationFrame(() => {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

export function DataTable({
  columns,
  rows,
  selectedCell,
  onCellSelect,
  className,
  "aria-label": ariaLabel = "Data table",
}: DataTableProps) {
  const selectedKey = getSelectionKey(selectedCell);
  const selectedCellRef = useRef<HTMLButtonElement | null>(null);

  const handleCellClick = useCallback(
    (row: DataTableRow, column: DataTableColumn, cell: DataTableCellValue) => {
      onCellSelect?.({
        rowId: row.id,
        columnId: column.id,
        cell,
      });
    },
    [onCellSelect],
  );

  useEffect(() => {
    scrollCellIntoView(selectedCellRef.current);
  }, [selectedKey]);

  return (
    <table className={[styles.table, className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <colgroup>
        {columns.map((column) => (
          <col key={column.id} className={styles.col} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {columns.map((column) => {
            const headerStatuses = getColumnStatuses(rows, column.id);

            return (
              <th key={column.id} scope="col" className={styles.headerCell}>
                <div
                  className={[
                    styles.headerContent,
                    headerStatuses.length > 0 && styles.headerContentWithIcons,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className={styles.headerLabel}>{column.label}</span>
                  {headerStatuses.length > 0 && (
                    <div className={styles.headerIcons}>
                      {headerStatuses.map((status) => (
                        <StatusIcon
                          key={status}
                          variant={STATUS_TO_FILTER[status]}
                          active
                          className={styles.headerIcon}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className={styles.bodyRow}>
            {columns.map((column) => {
              const rawCell = row.cells[column.id] ?? "";
              const { text, config } = normalizeCell(rawCell);
              const isSelectable = Boolean(config?.status);
              const cellKey = `${row.id}:${column.id}`;
              const isSelected = selectedKey === cellKey;

              if (isSelectable && config) {
                return (
                  <td key={column.id} className={getCellClassName(config.status, true, isSelected)}>
                    <button
                      type="button"
                      ref={isSelected ? selectedCellRef : undefined}
                      className={styles.cellButton}
                      onClick={() => handleCellClick(row, column, config)}
                      aria-pressed={isSelected}
                    >
                      <span className={styles.cellText}>{text}</span>
                    </button>
                  </td>
                );
              }

              return (
                <td key={column.id} className={getCellClassName(undefined, false, false)}>
                  <span className={styles.cellText}>{text}</span>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DataTableWithSummary({
  columns = DEMO_TABLE_COLUMNS,
  rows: initialRows = DEMO_TABLE_ROWS,
  className,
  "aria-label": ariaLabel = "Validation data table",
}: DataTableWithSummaryProps) {
  const [rows, setRows] = useState(initialRows);
  const [selectedCell, setSelectedCell] = useState<SelectedTableCell | null>(null);
  const [panelCollapsed, setPanelCollapsed] = useState(true);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const selectedCellRef = useRef<SelectedTableCell | null>(null);
  selectedCellRef.current = selectedCell;

  const handleCellSelect = useCallback((selection: SelectedTableCell) => {
    setSelectedCell(selection);
    setPanelCollapsed(false);
  }, []);

  const handlePanelClose = useCallback(() => {
    setPanelCollapsed(true);
  }, []);

  const handlePanelStateChange = useCallback((state: SummaryPanelState) => {
    const current = selectedCellRef.current;
    if (!current) return;

    const status = panelStateToCellStatus(state);
    const { rowId, columnId } = current;

    setRows((currentRows) =>
      updateRowCell(currentRows, rowId, columnId, {
        status,
        panelState: state,
      }),
    );

    setSelectedCell({
      ...current,
      cell: {
        ...current.cell,
        status,
        panelState: state,
      },
    });
  }, []);

  const panelKey = useMemo(() => {
    if (!selectedCell) return "summary-panel-empty";
    return `${selectedCell.rowId}:${selectedCell.columnId}`;
  }, [selectedCell]);

  const summaryProps = selectedCell
    ? {
        invalidValue: selectedCell.cell.invalidValue ?? selectedCell.cell.value,
        cellCount: selectedCell.cell.cellCount,
        holeCount: selectedCell.cell.holeCount,
        defaultPanelState: selectedCell.cell.panelState ?? "editable",
        initialStagedValue: selectedCell.cell.initialStagedValue,
      }
    : {};

  useEffect(() => {
    if (panelCollapsed || !selectedCell) return;

    const frame = requestAnimationFrame(() => {
      const selectedButton = tableScrollRef.current?.querySelector<HTMLButtonElement>(
        'button[aria-pressed="true"]',
      );
      scrollCellIntoView(selectedButton);
    });

    return () => cancelAnimationFrame(frame);
  }, [panelCollapsed, selectedCell]);

  return (
    <div className={[styles.workspace, className].filter(Boolean).join(" ")}>
      <div className={styles.tableRegion}>
        <div ref={tableScrollRef} className={styles.tableScroll}>
          <DataTable
            columns={columns}
            rows={rows}
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
            aria-label={ariaLabel}
          />
        </div>
      </div>

      <SummaryPanel
        key={panelKey}
        className={styles.summaryPanel}
        fillHeight
        collapsed={panelCollapsed}
        onCollapsedChange={setPanelCollapsed}
        onClose={handlePanelClose}
        onPanelStateChange={handlePanelStateChange}
        {...summaryProps}
      />
    </div>
  );
}

export type {
  DataTableCellValue,
  DataTableColumn,
  DataTableProps,
  DataTableRow,
  DataTableWithSummaryProps,
  SelectedTableCell,
  TableCellStatus,
} from "./DataTable.types";
