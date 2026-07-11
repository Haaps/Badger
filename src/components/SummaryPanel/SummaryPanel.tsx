import { useMemo, useState } from "react";
import { Button } from "../Button";
import { MultiSelectMenu } from "../MultiSelectMenu";
import { SegmentedControl } from "../SegmentedControl";
import { SingleSelect } from "../SingleSelect";
import { TextField } from "../TextField";
import closeIcon from "./assets/close.svg";
import sidebarChevronIcon from "./assets/sidebar-chevron.svg";
import {
  DEMO_CELL_COUNT,
  DEMO_DEFAULT_SELECTED_HOLES,
  DEMO_HOLE_COUNT,
  DEMO_HOLE_OPTIONS,
  DEMO_INVALID_VALUE,
  DEMO_VALUE_OPTIONS,
  DEMO_AFFECTED_ROWS,
} from "./SummaryPanel.demoData";
import type { SelectMenuOption } from "../SelectMenu";
import type { SummaryApplyScope, SummaryPanelProps, SummaryPanelState } from "./SummaryPanel.types";
import styles from "./SummaryPanel.module.css";

const APPLY_SCOPE_OPTIONS = [
  { value: "cell", label: "This cell only" },
  { value: "holes", label: "Apply to drill holes" },
] as const;

type ValueInputMode = "select" | "custom";

function StagedIcon() {
  return (
    <svg
      className={styles.stagedClockIcon}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 7C0 5.14348 0.737498 3.36301 2.05025 2.05025C3.36301 0.737498 5.14348 0 7 0C8.85652 0 10.637 0.737498 11.9497 2.05025C13.2625 3.36301 14 5.14348 14 7C14 8.85652 13.2625 10.637 11.9497 11.9497C10.637 13.2625 8.85652 14 7 14C5.14348 14 3.36301 13.2625 2.05025 11.9497C0.737498 10.637 0 8.85652 0 7ZM7.875 3.5266C7.875 3.29454 7.78281 3.07198 7.61872 2.90788C7.45462 2.74379 7.23206 2.6516 7 2.6516C6.76794 2.6516 6.54538 2.74379 6.38128 2.90788C6.21719 3.07198 6.125 3.29454 6.125 3.5266V7C6.125 7.483 6.517 7.875 7 7.875H9.8C10.0321 7.875 10.2546 7.78281 10.4187 7.61872C10.5828 7.45462 10.675 7.23206 10.675 7C10.675 6.76794 10.5828 6.54538 10.4187 6.38128C10.2546 6.21719 10.0321 6.125 9.8 6.125H7.875V3.5266Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ApprovedIcon() {
  return (
    <svg
      className={styles.approvedCheckIcon}
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM10.5028 5.21852C10.7615 4.87262 10.7093 4.37878 10.3856 4.09346C10.0619 3.80814 9.56808 3.86035 9.28276 4.18403L6.00765 8.04716L4.70078 6.76111C4.36841 6.43469 3.87664 6.43814 3.54844 6.76877C3.22024 7.0994 3.22369 7.59117 3.55606 7.91759L5.46622 9.79433C5.75154 10.0715 6.20549 10.0681 6.48714 9.7864L10.5028 5.21852Z"
        fill="currentColor"
      />
    </svg>
  );
}

function getFooterNote(
  applyScope: SummaryApplyScope,
  panelState: SummaryPanelState,
  selectedHoleCount: number,
) {
  if (panelState === "approved" || applyScope === "cell") {
    return "Change will affect this cell only.";
  }

  return `Change will affect ${DEMO_AFFECTED_ROWS} rows across ${selectedHoleCount} holes.`;
}

function getTitle(panelState: SummaryPanelState) {
  switch (panelState) {
    case "staged":
      return "Staged update";
    case "approved":
      return "Approved update";
    default:
      return "Invalid list value";
  }
}

function resolveDisplayValue(value: string, options: SelectMenuOption[]) {
  if (!value) return "";
  const option = options.find((item) => item.value === value);
  if (option && typeof option.label === "string") {
    return option.label;
  }
  return value;
}

type StatusDetailsBannerProps = {
  variant: "staged" | "approved";
  expanded: boolean;
  onToggle: () => void;
  currentHeading: string;
  currentValue: string;
  previousValue: string;
};

function StatusDetailsBanner({
  variant,
  expanded,
  onToggle,
  currentHeading,
  currentValue,
  previousValue,
}: StatusDetailsBannerProps) {
  const isStaged = variant === "staged";
  const bannerClassName = isStaged
    ? `${styles.statusBanner} ${styles.statusBannerStaged}`
    : `${styles.statusBanner} ${styles.statusBannerApproved}`;
  const iconClassName = isStaged
    ? `${styles.statusIcon} ${styles.statusIconStaged}`
    : `${styles.statusIcon} ${styles.statusIconApproved}`;
  const toggleLabel = expanded
    ? isStaged
      ? "Hide staged details"
      : "Hide approved details"
    : isStaged
      ? "Show staged details"
      : "Show approved details";

  return (
    <div className={bannerClassName}>
      <span className={iconClassName}>{isStaged ? <StagedIcon /> : <ApprovedIcon />}</span>
      <div className={styles.statusBannerBody}>
        <button type="button" className={styles.statusLink} onClick={onToggle}>
          {toggleLabel}
        </button>
        {expanded && (
          <div className={styles.statusDetails}>
            <div>
              <p className={styles.statusDetailsHeading}>{currentHeading}</p>
              <p className={styles.statusDetailsValue}>&ldquo;{currentValue}&rdquo;</p>
            </div>
            <div>
              <p className={styles.statusDetailsHeading}>PREVIOUSLY</p>
              <p className={styles.statusDetailsValue}>&ldquo;{previousValue}&rdquo;</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SummaryPanel({
  invalidValue = DEMO_INVALID_VALUE,
  cellCount = DEMO_CELL_COUNT,
  holeCount = DEMO_HOLE_COUNT,
  valueOptions = DEMO_VALUE_OPTIONS,
  holeOptions = DEMO_HOLE_OPTIONS,
  defaultSelectedHoles = DEMO_DEFAULT_SELECTED_HOLES,
  onClose,
  className,
}: SummaryPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [panelState, setPanelState] = useState<SummaryPanelState>("editable");
  const [valueInputMode, setValueInputMode] = useState<ValueInputMode>("select");
  const [selectedValue, setSelectedValue] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [stagedValue, setStagedValue] = useState("");
  const [stagedApplyScope, setStagedApplyScope] = useState<SummaryApplyScope>("cell");
  const [applyScope, setApplyScope] = useState<SummaryApplyScope>("cell");
  const [selectedHoles, setSelectedHoles] = useState<string[]>(defaultSelectedHoles);
  const [stagedDetailsExpanded, setStagedDetailsExpanded] = useState(false);
  const [approvedDetailsExpanded, setApprovedDetailsExpanded] = useState(false);

  const isApproved = panelState === "approved";
  const isStaged = panelState === "staged";
  const isEditable = panelState === "editable";
  const showHoleMenu = applyScope === "holes";
  const isCustomValueMode = valueInputMode === "custom";

  const currentValue = isCustomValueMode ? customValue.trim() : selectedValue;

  const canStageChange = isEditable && currentValue !== "";
  const hasStagedChanges =
    currentValue !== stagedValue || applyScope !== stagedApplyScope;
  const canUpdateStaged = isStaged && currentValue !== "" && hasStagedChanges;

  const committedValueLabel = resolveDisplayValue(stagedValue, valueOptions);

  const segmentedOptions = useMemo(() => {
    if (!isApproved) {
      return APPLY_SCOPE_OPTIONS.map((option) => ({ ...option }));
    }

    return APPLY_SCOPE_OPTIONS.map((option) => ({
      ...option,
      disabled: option.value !== applyScope,
    }));
  }, [applyScope, isApproved]);

  const panelClassNames = [
    styles.panel,
    collapsed && styles.panelCollapsed,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const titleClassNames = [styles.title, isEditable && styles.titleError]
    .filter(Boolean)
    .join(" ");
  const chevronClassNames = [
    styles.sidebarChevron,
    collapsed ? styles.sidebarChevronCollapsed : styles.sidebarChevronExpanded,
  ]
    .filter(Boolean)
    .join(" ");
  const applySectionClassNames = [
    styles.applySection,
    showHoleMenu && styles.applySectionWithMenu,
  ]
    .filter(Boolean)
    .join(" ");

  const handleStageChange = () => {
    if (!canStageChange) return;
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
    setStagedDetailsExpanded(false);
    setPanelState("staged");
  };

  const handleUpdateStaged = () => {
    if (!canUpdateStaged) return;
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
  };

  const handleApprove = () => {
    setStagedValue(currentValue);
    setStagedApplyScope(applyScope);
    setStagedDetailsExpanded(false);
    setApprovedDetailsExpanded(false);
    setPanelState("approved");
  };

  const handleRevertToStaged = () => {
    setApprovedDetailsExpanded(false);
    setPanelState("staged");
  };

  const handleApplyScopeChange = (nextScope: string) => {
    if (isApproved) return;
    setApplyScope(nextScope as SummaryApplyScope);
  };

  const handleAddNewValue = () => {
    if (isApproved) return;
    setValueInputMode("custom");
  };

  const handleChooseExistingValue = () => {
    if (isApproved) return;
    setValueInputMode("select");
  };

  const handleClose = () => {
    setCollapsed(true);
    onClose?.();
  };

  const renderValueField = () => {
    if (isCustomValueMode) {
      return (
        <TextField
          className={styles.valueField}
          label="Add New List Value"
          linkText={isApproved ? undefined : "Choose existing value"}
          onLinkClick={handleChooseExistingValue}
          placeholder=""
          value={customValue}
          onChange={(event) => setCustomValue(event.target.value)}
          disabled={isApproved}
          aria-label="New list value"
        />
      );
    }

    return (
      <SingleSelect
        className={styles.valueField}
        value={selectedValue}
        options={valueOptions}
        onChange={setSelectedValue}
        label="Select Value"
        linkText={isApproved ? undefined : "Add new value"}
        onLinkClick={handleAddNewValue}
        placeholder="Select Value"
        disabled={isApproved}
        aria-label="Replacement value"
      />
    );
  };

  return (
    <aside className={panelClassNames} aria-label="Summary panel">
      <button
        type="button"
        className={styles.sidebar}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand summary panel" : "Collapse summary panel"}
        onClick={() => setCollapsed((current) => !current)}
      >
        <div className={styles.sidebarInner}>
          <img
            src={sidebarChevronIcon}
            alt=""
            className={chevronClassNames}
            aria-hidden="true"
          />
          <p className={styles.sidebarLabel}>SUMMARY</p>
        </div>
      </button>

      {!collapsed && (
        <div className={styles.content}>
          <div className={styles.body}>
            <div className={styles.bodyMain}>
              <div className={styles.headerRow}>
                <h2 className={titleClassNames}>{getTitle(panelState)}</h2>
                <button
                  type="button"
                  className={styles.closeButton}
                  aria-label="Close summary panel"
                  onClick={handleClose}
                >
                  <img src={closeIcon} alt="" className={styles.closeIcon} aria-hidden="true" />
                </button>
              </div>

              {isEditable && (
                <div className={styles.messageBlock}>
                  <p className={styles.summaryText}>
                    &ldquo;{invalidValue}&rdquo; appears in {cellCount} cells across {holeCount}{" "}
                    holes.
                  </p>
                  <p className={styles.helperText}>
                    Choose or create a valid value to replace it.
                  </p>
                </div>
              )}

              {isStaged && (
                <StatusDetailsBanner
                  variant="staged"
                  expanded={stagedDetailsExpanded}
                  onToggle={() => setStagedDetailsExpanded((current) => !current)}
                  currentHeading="STAGED AS"
                  currentValue={committedValueLabel}
                  previousValue={invalidValue}
                />
              )}

              {isApproved && (
                <StatusDetailsBanner
                  variant="approved"
                  expanded={approvedDetailsExpanded}
                  onToggle={() => setApprovedDetailsExpanded((current) => !current)}
                  currentHeading="APPROVED AS"
                  currentValue={committedValueLabel}
                  previousValue={invalidValue}
                />
              )}

              {renderValueField()}
            </div>

            <div className={applySectionClassNames}>
              <SegmentedControl
                className={styles.segmentedControl}
                value={applyScope}
                options={segmentedOptions}
                onChange={handleApplyScopeChange}
                aria-label="Apply change scope"
              />

              {showHoleMenu && (
                <div
                  className={[
                    styles.holeMenuWrapper,
                    isApproved ? styles.holeMenuDisabled : undefined,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <MultiSelectMenu
                    className={styles.holeMenu}
                    fillHeight
                    value={selectedHoles}
                    options={holeOptions}
                    onChange={setSelectedHoles}
                    aria-label="Drill hole selection"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.footer}>
            {isEditable && (
              <>
                <div className={styles.actionRow}>
                  <Button
                    variant="primary"
                    className={styles.fullWidthButton}
                    disabled={!canStageChange}
                    onClick={handleStageChange}
                  >
                    Stage Change
                  </Button>
                </div>
                <p className={styles.footerNote}>
                  {getFooterNote(applyScope, panelState, selectedHoles.length)}
                </p>
              </>
            )}

            {isStaged && (
              <>
                <div className={styles.actionRow}>
                  <Button
                    variant="primary"
                    className={styles.fullWidthButton}
                    disabled={!canUpdateStaged}
                    onClick={handleUpdateStaged}
                  >
                    Update Staged Value
                  </Button>
                  <Button
                    variant="approval"
                    className={styles.fullWidthButton}
                    onClick={handleApprove}
                  >
                    Approve Update
                  </Button>
                </div>
                <p className={styles.footerNote}>
                  {getFooterNote(applyScope, panelState, selectedHoles.length)}
                </p>
              </>
            )}

            {isApproved && (
              <div className={styles.actionRow}>
                <Button
                  variant="primary"
                  className={styles.fullWidthButton}
                  onClick={handleRevertToStaged}
                >
                  Revert to Staged
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

export type {
  SummaryApplyScope,
  SummaryPanelProps,
  SummaryPanelState,
} from "./SummaryPanel.types";
export {
  DEMO_CELL_COUNT,
  DEMO_DEFAULT_SELECTED_HOLES,
  DEMO_HOLE_COUNT,
  DEMO_HOLE_OPTIONS,
  DEMO_INVALID_VALUE,
  DEMO_VALUE_OPTIONS,
} from "./SummaryPanel.demoData";
