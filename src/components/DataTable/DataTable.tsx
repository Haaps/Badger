/**
 * DataTable renders validation-status cells; DataTableWithSummary is a gallery
 * composition that wires row state to SummaryPanel.
 *
 * Cells with a `status` are selectable; selecting one opens the panel and syncs
 * stage/approve actions back onto matching rows (single cell or drill-hole scope).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusIcon } from "../FilterBar/icons/StatusIcon";
import type { StatusFilter } from "../FilterBar";
import {
  SummaryPanel,
  parseGapsStagedValue,
  parseDuplicatesStagedValue,
  getExceededLimitResultText,
  getExceededDecimalLimitResultText,
} from "../SummaryPanel";
import type { SummaryPanelState, SummaryApplyScope } from "../SummaryPanel";
import { DEMO_TABLE_COLUMNS, DEMO_TABLE_ROWS } from "./DataTable.demoData";
import { DEMO_CHARACTER_LIMIT, DEMO_DECIMAL_MAX, DEMO_VALUE_OPTIONS } from "../SummaryPanel";
import type { SelectMenuOption } from "../SelectMenu";
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

function resolveDisplayValue(value: string, options: SelectMenuOption[] = DEMO_VALUE_OPTIONS) {
  const option = options.find((item) => item.value === value);
  if (option && typeof option.label === "string") {
    return option.label;
  }
  return value;
}

function getExceededLimitOriginalText(cell: DataTableCellValue) {
  return (
    cell.panelProps?.exceededLimitCellText ??
    cell.invalidValue ??
    cell.value
  );
}

function resolveStagedCellDisplayValue(cell: DataTableCellValue, stagedValue: string) {
  if (
    cell.validationType === "text" &&
    cell.errorType === "exceeded-character-limit"
  ) {
    const characterLimit = cell.panelProps?.characterLimit ?? DEMO_CHARACTER_LIMIT;
    return getExceededLimitResultText(
      stagedValue,
      characterLimit,
      getExceededLimitOriginalText(cell),
    );
  }

  if (
    cell.validationType === "numeric" &&
    cell.errorType === "exceeded-decimal-limit"
  ) {
    const decimalMax = cell.panelProps?.decimalMax ?? DEMO_DECIMAL_MAX;
    const originalValue = cell.invalidValue ?? cell.value;
    return getExceededDecimalLimitResultText(stagedValue, decimalMax, originalValue);
  }

  return resolveDisplayValue(stagedValue);
}

const CELL_TEXT_TRUNCATE_LENGTH = 30;

function truncateCellText(text: string) {
  if (text.length <= CELL_TEXT_TRUNCATE_LENGTH) {
    return { displayText: text, isTruncated: false };
  }

  return {
    displayText: `${text.slice(0, CELL_TEXT_TRUNCATE_LENGTH)}…`,
    isTruncated: true,
  };
}

function DataTableCellText({ text }: { text: string }) {
  const { displayText, isTruncated } = truncateCellText(text);

  if (!isTruncated) {
    return <span className={styles.cellText}>{displayText}</span>;
  }

  return (
    <span className={styles.cellTextWrap}>
      <span className={styles.cellText}>{displayText}</span>
      <span className={styles.cellTooltip} role="tooltip">
        {text}
      </span>
    </span>
  );
}

function getHoleNumberValue(cell: DataTableCellValue | string | undefined) {
  if (typeof cell === "string") {
    return cell;
  }
  return undefined;
}

function getMatchingErrorValue(cell: DataTableCellValue) {
  return cell.invalidValue ?? cell.value;
}

type ApplyAction = "stage" | "update-staged" | "approve" | "revert";

/** Maps SummaryPanel state transitions to which matching cells should update. */
function getApplyAction(
  currentPanelState: SummaryPanelState,
  nextState: SummaryPanelState,
): ApplyAction {
  if (nextState === "approved") return "approve";
  if (nextState === "staged" && currentPanelState === "editable") return "stage";
  if (nextState === "staged" && currentPanelState === "staged") return "update-staged";
  if (nextState === "staged" && currentPanelState === "approved") return "revert";
  return "stage";
}

function getPreviewApplyAction(panelState: SummaryPanelState): ApplyAction {
  if (panelState === "editable") return "stage";
  return "approve";
}

/** Bulk apply only touches cells in the status expected for this action (e.g. stage → errors only). */
function shouldUpdateCellForHolesScope(
  cell: DataTableCellValue,
  selectedInvalidValue: string,
  action: ApplyAction,
) {
  if (getMatchingErrorValue(cell) !== selectedInvalidValue) {
    return false;
  }

  switch (action) {
    case "stage":
      return cell.status === "error";
    case "update-staged":
      return cell.status === "staged";
    case "approve":
      return cell.status === "error" || cell.status === "staged";
    case "revert":
      return cell.status === "approved";
    default:
      return false;
  }
}

function forEachMatchingColumnCell(
  rows: DataTableRow[],
  columnId: string,
  invalidValue: string,
  action: ApplyAction | "count-errors",
  selectedHoles: Set<string> | null,
  onMatch: (row: DataTableRow) => void,
) {
  for (const row of rows) {
    const holeNumber = getHoleNumberValue(row.cells.holeNumber);
    if (selectedHoles && holeNumber && !selectedHoles.has(holeNumber)) {
      continue;
    }

    const cell = row.cells[columnId];
    if (typeof cell !== "object") continue;

    const matches =
      action === "count-errors"
        ? cell.status === "error" && getMatchingErrorValue(cell) === invalidValue
        : shouldUpdateCellForHolesScope(cell, invalidValue, action);

    if (!matches) continue;

    onMatch(row);
  }
}

function getErrorOccurrenceStats(rows: DataTableRow[], selectedCell: SelectedTableCell) {
  const { columnId, cell: selectedCellValue } = selectedCell;
  const invalidValue = getMatchingErrorValue(selectedCellValue);

  let cellCount = 0;
  const holes = new Set<string>();

  forEachMatchingColumnCell(rows, columnId, invalidValue, "count-errors", null, (row) => {
    cellCount += 1;
    const holeNumber = getHoleNumberValue(row.cells.holeNumber);
    if (holeNumber) {
      holes.add(holeNumber);
    }
  });

  return {
    cellCount,
    holeCount: holes.size,
  };
}

function getApplyImpactStats(
  rows: DataTableRow[],
  selectedCell: SelectedTableCell,
  applyScope: SummaryApplyScope,
  selectedHoles: string[],
  panelState: SummaryPanelState,
) {
  if (applyScope === "cell") {
    return { rowCount: 1, holeCount: 0 };
  }

  const action = getPreviewApplyAction(panelState);
  const selectedInvalidValue = getMatchingErrorValue(selectedCell.cell);
  const holeFilter = new Set(selectedHoles);
  const affectedHoles = new Set<string>();
  let rowCount = 0;

  forEachMatchingColumnCell(
    rows,
    selectedCell.columnId,
    selectedInvalidValue,
    action,
    holeFilter,
    (row) => {
      rowCount += 1;
      const holeNumber = getHoleNumberValue(row.cells.holeNumber);
      if (holeNumber) {
        affectedHoles.add(holeNumber);
      }
    },
  );

  return {
    rowCount,
    holeCount: affectedHoles.size,
  };
}

function getMatchingErrorHoleOptions(
  rows: DataTableRow[],
  selectedCell: SelectedTableCell,
): SelectMenuOption[] {
  const { columnId, cell: selectedCellValue } = selectedCell;
  const invalidValue = getMatchingErrorValue(selectedCellValue);
  const holes = new Set<string>();

  for (const row of rows) {
    const cell = row.cells[columnId];
    if (typeof cell !== "object" || !cell.status) continue;
    if (getMatchingErrorValue(cell) !== invalidValue) continue;

    const holeNumber = getHoleNumberValue(row.cells.holeNumber);
    if (holeNumber) {
      holes.add(holeNumber);
    }
  }

  return Array.from(holes)
    .sort()
    .map((hole) => ({
      value: hole,
      label: hole,
    }));
}

function buildCellUpdates(
  cell: DataTableCellValue,
  state: SummaryPanelState,
  stagedValue: string | undefined,
  applyScope: SummaryApplyScope | undefined,
  selectedHoles: string[] | undefined,
): Partial<DataTableCellValue> {
  const status = panelStateToCellStatus(state);
  const updates: Partial<DataTableCellValue> = {
    status,
    panelState: state,
  };

  if (stagedValue && (state === "staged" || state === "approved")) {
    updates.value = resolveStagedCellDisplayValue(cell, stagedValue);
    updates.initialStagedValue = stagedValue;
  }

  if (applyScope === "holes" && selectedHoles && selectedHoles.length > 0) {
    updates.applyScope = "holes";
    updates.appliedHoles = [...selectedHoles].sort();
  } else if (applyScope === "cell") {
    updates.applyScope = "cell";
    updates.appliedHoles = undefined;
  }

  return updates;
}

function getCellDisplayValue(cell: DataTableCellValue | string | undefined) {
  if (typeof cell === "object") {
    return cell.value;
  }

  return cell ?? "";
}

function getIntervalBoundaryPairLocations(
  selectedCell: SelectedTableCell,
): { toRowId: string; fromRowId: string } | null {
  const { cell, rowId, columnId } = selectedCell;
  if (
    (cell.validationType !== "gaps" && cell.validationType !== "overlaps") ||
    !cell.gapsPartner
  ) {
    return null;
  }

  if (columnId === "to") {
    return { toRowId: rowId, fromRowId: cell.gapsPartner.rowId };
  }

  if (columnId === "from") {
    return { toRowId: cell.gapsPartner.rowId, fromRowId: rowId };
  }

  return null;
}

function getGapsSummaryContext(rows: DataTableRow[], selectedCell: SelectedTableCell) {
  const pair = getIntervalBoundaryPairLocations(selectedCell);
  if (!pair || selectedCell.cell.validationType !== "gaps") {
    return null;
  }

  const toRow = rows.find((row) => row.id === pair.toRowId);
  const fromRow = rows.find((row) => row.id === pair.fromRowId);
  const toCell = toRow?.cells.to;
  const fromCell = fromRow?.cells.from;
  const anchorCell =
    typeof fromCell === "object"
      ? fromCell
      : typeof toCell === "object"
        ? toCell
        : selectedCell.cell;

  return {
    toValue: getCellDisplayValue(toCell),
    fromValue: getCellDisplayValue(fromCell),
    defaultPanelState: anchorCell.panelState ?? "editable",
    initialStagedValue: anchorCell.initialStagedValue,
    cellCount: 2,
    holeCount: anchorCell.holeCount ?? 0,
    toLabel: anchorCell.panelProps?.toLabel,
    fromLabel: anchorCell.panelProps?.fromLabel,
    intervalCrossValidation: buildIntervalCrossValidationContext(
      rows,
      new Set([pair.toRowId, pair.fromRowId]),
      {
        gapAboveRowFrom: getCellDisplayValue(toRow?.cells.from),
        gapBelowRowTo: getCellDisplayValue(fromRow?.cells.to),
      },
    ),
  };
}

function getOverlapsSummaryContext(rows: DataTableRow[], selectedCell: SelectedTableCell) {
  const pair = getIntervalBoundaryPairLocations(selectedCell);
  if (!pair || selectedCell.cell.validationType !== "overlaps") {
    return null;
  }

  const toRow = rows.find((row) => row.id === pair.toRowId);
  const fromRow = rows.find((row) => row.id === pair.fromRowId);
  const toCell = toRow?.cells.to;
  const fromCell = fromRow?.cells.from;
  const anchorCell =
    typeof fromCell === "object"
      ? fromCell
      : typeof toCell === "object"
        ? toCell
        : selectedCell.cell;

  return {
    toValue: getCellDisplayValue(toCell),
    fromValue: getCellDisplayValue(fromCell),
    defaultPanelState: anchorCell.panelState ?? "editable",
    initialStagedValue: anchorCell.initialStagedValue,
    cellCount: 2,
    holeCount: anchorCell.holeCount ?? 0,
    toLabel: anchorCell.panelProps?.toLabel,
    fromLabel: anchorCell.panelProps?.fromLabel,
    intervalCrossValidation: buildIntervalCrossValidationContext(
      rows,
      new Set([pair.toRowId, pair.fromRowId]),
      {
        gapAboveRowFrom: getCellDisplayValue(toRow?.cells.from),
        gapBelowRowTo: getCellDisplayValue(fromRow?.cells.to),
      },
    ),
  };
}

function applyIntervalBoundaryPanelChangeToRows(
  rows: DataTableRow[],
  selectedCell: SelectedTableCell,
  state: SummaryPanelState,
  stagedValue: string | undefined,
): DataTableRow[] {
  const pair = getIntervalBoundaryPairLocations(selectedCell);
  if (!pair) {
    return rows;
  }

  const validationType = selectedCell.cell.validationType;
  if (validationType !== "gaps" && validationType !== "overlaps") {
    return rows;
  }

  const status = panelStateToCellStatus(state);
  const parsed = stagedValue ? parseGapsStagedValue(stagedValue) : null;
  const sharedUpdates: Partial<DataTableCellValue> = {
    status,
    panelState: state,
    applyScope: "cell",
    appliedHoles: undefined,
  };

  if (stagedValue && (state === "staged" || state === "approved")) {
    sharedUpdates.initialStagedValue = stagedValue;
  }

  return rows.map((row) => {
    if (row.id === pair.toRowId) {
      const toCell = row.cells.to;
      if (typeof toCell !== "object" || toCell.validationType !== validationType) {
        return row;
      }

      return {
        ...row,
        cells: {
          ...row.cells,
          to: {
            ...toCell,
            ...sharedUpdates,
            ...(parsed ? { value: parsed.toValue } : {}),
          },
        },
      };
    }

    if (row.id === pair.fromRowId) {
      const fromCell = row.cells.from;
      if (typeof fromCell !== "object" || fromCell.validationType !== validationType) {
        return row;
      }

      return {
        ...row,
        cells: {
          ...row.cells,
          from: {
            ...fromCell,
            ...sharedUpdates,
            ...(parsed ? { value: parsed.fromValue } : {}),
          },
        },
      };
    }

    return row;
  });
}

function computeIntervalLength(fromValue: string, toValue: string) {
  const from = Number.parseFloat(fromValue);
  const to = Number.parseFloat(toValue);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return null;
  }

  return `${Math.abs(to - from).toFixed(1)}`;
}

function getRowIntervalKey(row: DataTableRow) {
  return `${getCellDisplayValue(row.cells.from)}|${getCellDisplayValue(row.cells.to)}`;
}

function isDuplicateValidationRow(row: DataTableRow) {
  return (
    (typeof row.cells.from === "object" && row.cells.from.validationType === "duplicates") ||
    (typeof row.cells.to === "object" && row.cells.to.validationType === "duplicates")
  );
}

function getEffectiveDuplicateInterval(row: DataTableRow) {
  for (const columnId of ["from", "to"] as const) {
    const cell = row.cells[columnId];
    if (typeof cell !== "object") {
      continue;
    }

    if (
      cell.initialStagedValue?.startsWith("edit:") &&
      (cell.panelState === "staged" || cell.panelState === "approved")
    ) {
      const parsed = parseDuplicatesStagedValue(cell.initialStagedValue);
      if (parsed.resolution === "edit-manually") {
        return `${parsed.fromValue.trim()}|${parsed.toValue.trim()}`;
      }
    }
  }

  return getRowIntervalKey(row);
}

function clearDuplicateErrorsOnOtherRows(
  rows: DataTableRow[],
  intervalKey: string,
  excludeRowId: string,
) {
  return rows.map((row) => {
    if (row.id === excludeRowId || row.pendingDeletion || !isDuplicateValidationRow(row)) {
      return row;
    }

    if (getEffectiveDuplicateInterval(row) !== intervalKey) {
      return row;
    }

    const nextCells = { ...row.cells };

    for (const columnId of ["from", "to"] as const) {
      const cell = nextCells[columnId];
      if (
        typeof cell === "object" &&
        cell.validationType === "duplicates" &&
        !isDuplicateCellCommitted(cell)
      ) {
        nextCells[columnId] = cell.value;
      }
    }

    return { ...row, cells: nextCells };
  });
}

function getActiveRowIntervals(rows: DataTableRow[], excludeRowIds: Set<string>) {
  return rows
    .filter((row) => !row.pendingDeletion && !excludeRowIds.has(row.id))
    .map((row) => getEffectiveDuplicateInterval(row));
}

function buildIntervalCrossValidationContext(
  rows: DataTableRow[],
  excludeRowIds: Set<string>,
  neighbors: {
    previousRowTo?: string;
    nextRowFrom?: string;
    gapAboveRowFrom?: string;
    gapBelowRowTo?: string;
  } = {},
) {
  return {
    otherIntervals: getActiveRowIntervals(rows, excludeRowIds),
    ...neighbors,
  };
}

function extractDuplicateTemplate(
  cell: DataTableCellValue | string | undefined,
): Omit<DataTableCellValue, "value"> | null {
  if (typeof cell !== "object" || cell.validationType !== "duplicates") {
    return null;
  }

  const { value: _value, ...template } = cell;
  return template;
}

function isDuplicateCellCommitted(cell: DataTableCellValue | string | undefined) {
  return (
    typeof cell === "object" &&
    (cell.panelState === "staged" || cell.panelState === "approved")
  );
}

/** Clears or restores duplicate errors based on duplicate-flagged row counts (ignores pendingDeletion rows). */
function reconcileDuplicateErrors(rows: DataTableRow[]): DataTableRow[] {
  const activeRows = rows.filter((row) => !row.pendingDeletion);
  const duplicateActiveRows = activeRows.filter(isDuplicateValidationRow);
  const intervalCounts = new Map<string, number>();
  const intervalHoles = new Map<string, Set<string>>();
  const intervalTemplates = new Map<string, Omit<DataTableCellValue, "value">>();

  for (const row of rows) {
    if (!isDuplicateValidationRow(row)) {
      continue;
    }

    const key = getEffectiveDuplicateInterval(row);
    const template =
      extractDuplicateTemplate(row.cells.from) ?? extractDuplicateTemplate(row.cells.to);

    if (template && !intervalTemplates.has(key)) {
      intervalTemplates.set(key, template);
    }
  }

  for (const row of duplicateActiveRows) {
    const key = getEffectiveDuplicateInterval(row);
    intervalCounts.set(key, (intervalCounts.get(key) ?? 0) + 1);

    const hole = getHoleNumberValue(row.cells.holeNumber);
    if (hole) {
      const holes = intervalHoles.get(key) ?? new Set<string>();
      holes.add(hole);
      intervalHoles.set(key, holes);
    }
  }

  return rows.map((row) => {
    if (row.pendingDeletion || !isDuplicateValidationRow(row)) {
      return row;
    }

    const key = getEffectiveDuplicateInterval(row);
    const count = intervalCounts.get(key) ?? 0;
    const holeCount = intervalHoles.get(key)?.size ?? 0;
    const template = intervalTemplates.get(key);
    const fromValue = getCellDisplayValue(row.cells.from);
    const toValue = getCellDisplayValue(row.cells.to);

    if (count >= 2 && template) {
      if (isDuplicateCellCommitted(row.cells.from) || isDuplicateCellCommitted(row.cells.to)) {
        return row;
      }

      const shared: DataTableCellValue = {
        ...template,
        status: "error",
        panelState: "editable",
        cellCount: count,
        holeCount,
        initialStagedValue: undefined,
        applyScope: undefined,
        appliedHoles: undefined,
        value: "",
      };

      return {
        ...row,
        cells: {
          ...row.cells,
          from: { ...shared, value: fromValue },
          to: { ...shared, value: toValue },
        },
      };
    }

    if (count < 2) {
      const nextCells = { ...row.cells };

      for (const columnId of ["from", "to"] as const) {
        const cell = nextCells[columnId];
        if (
          typeof cell === "object" &&
          cell.validationType === "duplicates" &&
          !isDuplicateCellCommitted(cell)
        ) {
          nextCells[columnId] = cell.value;
        }
      }

      return { ...row, cells: nextCells };
    }

    return row;
  });
}

function updateRowDuplicateCells(
  row: DataTableRow,
  updates: Partial<DataTableCellValue>,
) {
  const fromCell = row.cells.from;
  const toCell = row.cells.to;

  return {
    ...row,
    cells: {
      ...row.cells,
      ...(typeof fromCell === "object"
        ? { from: { ...fromCell, ...updates } }
        : {}),
      ...(typeof toCell === "object" ? { to: { ...toCell, ...updates } } : {}),
    },
  };
}

function getDuplicatesSummaryContext(rows: DataTableRow[], selectedCell: SelectedTableCell) {
  const rowIndex = rows.findIndex((row) => row.id === selectedCell.rowId);
  const row = rowIndex >= 0 ? rows[rowIndex] : undefined;
  if (!row) {
    return null;
  }

  const intervalKey = getEffectiveDuplicateInterval(row);
  const duplicateRowCount = rows.filter(
    (candidate) =>
      !candidate.pendingDeletion &&
      isDuplicateValidationRow(candidate) &&
      getEffectiveDuplicateInterval(candidate) === intervalKey,
  ).length;

  const previousRow = rowIndex > 0 ? rows[rowIndex - 1] : undefined;
  const nextRow = rowIndex < rows.length - 1 ? rows[rowIndex + 1] : undefined;

  return {
    toValue: getCellDisplayValue(row.cells.to),
    fromValue: getCellDisplayValue(row.cells.from),
    defaultPanelState: selectedCell.cell.panelState ?? "editable",
    initialStagedValue: selectedCell.cell.initialStagedValue,
    cellCount: duplicateRowCount,
    holeCount: selectedCell.cell.holeCount ?? 0,
    toLabel: selectedCell.cell.panelProps?.toLabel,
    fromLabel: selectedCell.cell.panelProps?.fromLabel,
    intervalCrossValidation: buildIntervalCrossValidationContext(
      rows,
      new Set([selectedCell.rowId]),
      {
        previousRowTo:
          previousRow && !previousRow.pendingDeletion
            ? getCellDisplayValue(previousRow.cells.to)
            : undefined,
        nextRowFrom:
          nextRow && !nextRow.pendingDeletion
            ? getCellDisplayValue(nextRow.cells.from)
            : undefined,
      },
    ),
  };
}

function applyDuplicatesPanelChangeToRows(
  rows: DataTableRow[],
  selectedCell: SelectedTableCell,
  state: SummaryPanelState,
  stagedValue: string | undefined,
): DataTableRow[] {
  const parsed = stagedValue ? parseDuplicatesStagedValue(stagedValue) : null;
  const status = panelStateToCellStatus(state);
  const { rowId } = selectedCell;
  const correctingRow = rows.find((row) => row.id === rowId);
  const originalIntervalKey = correctingRow
    ? getEffectiveDuplicateInterval(correctingRow)
    : null;

  const sharedUpdates: Partial<DataTableCellValue> = {
    status,
    panelState: state,
    applyScope: "cell",
    appliedHoles: undefined,
  };

  if (stagedValue && (state === "staged" || state === "approved")) {
    sharedUpdates.initialStagedValue = stagedValue;
  }

  let nextRows = rows.map((row) => {
    if (row.id !== rowId) {
      return row;
    }

    if (parsed?.resolution === "delete-row") {
      return {
        ...updateRowDuplicateCells(row, sharedUpdates),
        pendingDeletion: state === "staged" || state === "approved",
      };
    }

    if (parsed?.resolution === "edit-manually") {
      const fromValue = parsed.fromValue;
      const toValue = parsed.toValue;
      const length = computeIntervalLength(fromValue, toValue);

      return {
        ...row,
        pendingDeletion: false,
        cells: {
          ...row.cells,
          from:
            typeof row.cells.from === "object"
              ? { ...row.cells.from, ...sharedUpdates, value: fromValue }
              : fromValue,
          to:
            typeof row.cells.to === "object"
              ? { ...row.cells.to, ...sharedUpdates, value: toValue }
              : toValue,
          ...(length ? { length } : {}),
        },
      };
    }

    return row;
  });

  if (
    parsed?.resolution === "edit-manually" &&
    (state === "staged" || state === "approved") &&
    originalIntervalKey
  ) {
    const correctedIntervalKey = `${parsed.fromValue.trim()}|${parsed.toValue.trim()}`;
    if (correctedIntervalKey !== originalIntervalKey) {
      nextRows = clearDuplicateErrorsOnOtherRows(
        nextRows,
        originalIntervalKey,
        rowId,
      );
    }
  }

  return reconcileDuplicateErrors(nextRows);
}

function applyPanelChangeToRows(
  rows: DataTableRow[],
  selectedCell: SelectedTableCell,
  state: SummaryPanelState,
  stagedValue: string | undefined,
  applyScope: SummaryApplyScope | undefined,
  selectedHoles: string[] | undefined,
): DataTableRow[] {
  if (selectedCell.cell.validationType === "gaps" || selectedCell.cell.validationType === "overlaps") {
    return applyIntervalBoundaryPanelChangeToRows(rows, selectedCell, state, stagedValue);
  }

  if (selectedCell.cell.validationType === "duplicates") {
    return applyDuplicatesPanelChangeToRows(rows, selectedCell, state, stagedValue);
  }

  const scope = applyScope ?? "cell";
  const selectedInvalidValue = getMatchingErrorValue(selectedCell.cell);
  const currentPanelState = selectedCell.cell.panelState ?? "editable";
  const action = getApplyAction(currentPanelState, state);
  const columnId = selectedCell.columnId;

  // Hole scope: update every matching cell in selected drill holes for this column.
  if (scope === "holes") {
    const holes = new Set(selectedHoles ?? []);

    return rows.map((row) => {
      const rowHole = getHoleNumberValue(row.cells.holeNumber);
      if (!rowHole || !holes.has(rowHole)) {
        return row;
      }

      const cell = row.cells[columnId];
      if (typeof cell !== "object") {
        return row;
      }

      if (!shouldUpdateCellForHolesScope(cell, selectedInvalidValue, action)) {
        return row;
      }

      const cellUpdates = buildCellUpdates(cell, state, stagedValue, applyScope, selectedHoles);

      return {
        ...row,
        cells: {
          ...row.cells,
          [columnId]: {
            ...cell,
            ...cellUpdates,
          },
        },
      };
    });
  }

  return rows.map((row) => {
    if (row.id !== selectedCell.rowId) {
      return row;
    }

    const cell = row.cells[columnId];
    if (typeof cell !== "object") {
      return row;
    }

    const cellUpdates = buildCellUpdates(cell, state, stagedValue, applyScope, selectedHoles);

    return {
      ...row,
      cells: {
        ...row.cells,
        [columnId]: {
          ...cell,
          ...cellUpdates,
        },
      },
    };
  });
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
    (
      row: DataTableRow,
      column: DataTableColumn,
      cell: DataTableCellValue,
      button: HTMLButtonElement,
    ) => {
      onCellSelect?.({
        rowId: row.id,
        columnId: column.id,
        cell,
      });
      button.blur();
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
          <tr
            key={row.id}
            className={[styles.bodyRow, row.pendingDeletion && styles.bodyRowPendingDeletion]
              .filter(Boolean)
              .join(" ")}
          >
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
                      onClick={(event) =>
                        handleCellClick(row, column, config, event.currentTarget)
                      }
                      aria-pressed={isSelected}
                    >
                      <DataTableCellText text={text} />
                    </button>
                  </td>
                );
              }

              return (
                <td key={column.id} className={getCellClassName(undefined, false, false)}>
                  <DataTableCellText text={text} />
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
  // Ref keeps handlePanelStateChange stable while always reading latest selection.
  const selectedCellRef = useRef<SelectedTableCell | null>(null);
  selectedCellRef.current = selectedCell;

  const handleCellSelect = useCallback(
    (selection: SelectedTableCell) => {
      const row = rows.find((item) => item.id === selection.rowId);
      const cell = row?.cells[selection.columnId];
      setSelectedCell(
        typeof cell === "object" ? { ...selection, cell } : selection,
      );
      setPanelCollapsed(false);
    },
    [rows],
  );

  const handlePanelClose = useCallback(() => {
    setPanelCollapsed(true);
  }, []);

  const handlePanelStateChange = useCallback(
    (
      state: SummaryPanelState,
      stagedValue?: string,
      applyScope?: SummaryApplyScope,
      selectedHoles?: string[],
    ) => {
      const current = selectedCellRef.current;
      if (!current) return;

      setRows((currentRows) => {
        const nextRows = applyPanelChangeToRows(
          currentRows,
          current,
          state,
          stagedValue,
          applyScope,
          selectedHoles,
        );

        const updatedRow = nextRows.find((row) => row.id === current.rowId);
        const updatedCell = updatedRow?.cells[current.columnId];
        if (typeof updatedCell === "object") {
          setSelectedCell({
            ...current,
            cell: updatedCell,
          });
        }

        return nextRows;
      });
    },
    [],
  );

  const errorOccurrenceStats = useMemo(() => {
    if (!selectedCell) return null;
    return getErrorOccurrenceStats(rows, selectedCell);
  }, [rows, selectedCell]);

  const getApplyImpact = useCallback(
    (
      applyScope: SummaryApplyScope,
      selectedHoles: string[],
      panelState: SummaryPanelState,
    ) => {
      if (!selectedCell) return null;
      return getApplyImpactStats(
        rows,
        selectedCell,
        applyScope,
        selectedHoles,
        panelState,
      );
    },
    [rows, selectedCell],
  );

  const holeOptions = useMemo(() => {
    if (!selectedCell) return [];
    return getMatchingErrorHoleOptions(rows, selectedCell);
  }, [rows, selectedCell]);

  const defaultApplyScope = selectedCell?.cell.applyScope ?? "cell";

  const defaultSelectedHoles = useMemo(() => {
    if (!selectedCell) return undefined;

    if (selectedCell.cell.appliedHoles?.length) {
      return selectedCell.cell.appliedHoles.filter((hole) =>
        holeOptions.some((option) => option.value === hole),
      );
    }

    const row = rows.find((item) => item.id === selectedCell.rowId);
    const holeNumber = getHoleNumberValue(row?.cells.holeNumber);
    if (!holeNumber) return undefined;

    const isAvailable = holeOptions.some((option) => option.value === holeNumber);
    return isAvailable ? [holeNumber] : undefined;
  }, [rows, selectedCell, holeOptions]);

  const gapsSummaryContext = useMemo(() => {
    if (!selectedCell || selectedCell.cell.validationType !== "gaps") {
      return null;
    }

    return getGapsSummaryContext(rows, selectedCell);
  }, [rows, selectedCell]);

  const duplicatesSummaryContext = useMemo(() => {
    if (!selectedCell || selectedCell.cell.validationType !== "duplicates") {
      return null;
    }

    return getDuplicatesSummaryContext(rows, selectedCell);
  }, [rows, selectedCell]);

  const overlapsSummaryContext = useMemo(() => {
    if (!selectedCell || selectedCell.cell.validationType !== "overlaps") {
      return null;
    }

    return getOverlapsSummaryContext(rows, selectedCell);
  }, [rows, selectedCell]);

  // Remount SummaryPanel when the selected cell changes so workflow state resets cleanly.
  const panelKey = useMemo(() => {
    if (!selectedCell) return "summary-panel-empty";
    if (
      selectedCell.cell.validationType === "gaps" ||
      selectedCell.cell.validationType === "overlaps"
    ) {
      const pair = getIntervalBoundaryPairLocations(selectedCell);
      if (pair) {
        return `${selectedCell.cell.validationType}:${pair.toRowId}:${pair.fromRowId}`;
      }
    }
    if (selectedCell.cell.validationType === "duplicates") {
      return `duplicates:${selectedCell.rowId}`;
    }
    return `${selectedCell.rowId}:${selectedCell.columnId}`;
  }, [selectedCell, rows]);

  const summaryProps = selectedCell
    ? {
        validationType: selectedCell.cell.validationType ?? "list",
        errorType: selectedCell.cell.errorType ?? "invalid-value",
        invalidValue: selectedCell.cell.invalidValue ?? selectedCell.cell.value,
        cellCount:
          gapsSummaryContext?.cellCount ??
          overlapsSummaryContext?.cellCount ??
          duplicatesSummaryContext?.cellCount ??
          errorOccurrenceStats?.cellCount ??
          selectedCell.cell.cellCount ??
          1,
        holeCount:
          gapsSummaryContext?.holeCount ??
          overlapsSummaryContext?.holeCount ??
          duplicatesSummaryContext?.holeCount ??
          errorOccurrenceStats?.holeCount ??
          selectedCell.cell.holeCount ??
          0,
        defaultPanelState:
          gapsSummaryContext?.defaultPanelState ??
          overlapsSummaryContext?.defaultPanelState ??
          duplicatesSummaryContext?.defaultPanelState ??
          selectedCell.cell.panelState ??
          "editable",
        initialStagedValue:
          gapsSummaryContext?.initialStagedValue ??
          overlapsSummaryContext?.initialStagedValue ??
          duplicatesSummaryContext?.initialStagedValue ??
          selectedCell.cell.initialStagedValue,
        holeOptions,
        defaultSelectedHoles,
        defaultApplyScope:
          selectedCell.cell.validationType === "gaps" ||
          selectedCell.cell.validationType === "overlaps" ||
          selectedCell.cell.validationType === "duplicates"
            ? "cell"
            : defaultApplyScope,
        getApplyImpact,
        ...selectedCell.cell.panelProps,
        ...gapsSummaryContext,
        ...overlapsSummaryContext,
        ...duplicatesSummaryContext,
        ...(selectedCell.cell.validationType === "gaps" ||
        selectedCell.cell.validationType === "overlaps" ||
        selectedCell.cell.validationType === "duplicates"
          ? {
              gapsSelectedField:
                selectedCell.columnId === "to" ? ("to" as const) : ("from" as const),
            }
          : {}),
      }
    : {
        holeOptions,
      };

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
