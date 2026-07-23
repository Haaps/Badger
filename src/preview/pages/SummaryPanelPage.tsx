import { useState, type ReactNode } from "react";
import { Button } from "../../components/Button";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { SegmentedControlOption } from "../../components/SegmentedControl";
import { SingleSelect } from "../../components/SingleSelect";
import type { SelectMenuOption } from "../../components/SelectMenu";
import {
  DEMO_CHARACTER_LIMIT,
  DEMO_DATE_FORMAT,
  DEMO_DATE_TIME_FORMAT,
  DEMO_DECIMAL_MAX,
  DEMO_ENTERED_CHARACTER_COUNT,
  DEMO_ENTERED_DECIMAL_COUNT,
  DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
  DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
  DEMO_NUMERIC_ABOVE_MAX_VALUE,
  DEMO_NUMERIC_BELOW_MIN_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_VALUE,
  DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_VALUE,
  DEMO_NUMERIC_MAX_VALUE,
  DEMO_NUMERIC_MIN_VALUE,
  SummaryPanel,
} from "../../components/SummaryPanel";
import type { SummaryErrorType, SummaryPanelProps, SummaryValidationType } from "../../components/SummaryPanel";
import { UsageCodePanel } from "../UsageCodePanel";
import { summaryPanelUsage } from "../usageSnippets";
import styles from "./SummaryPanelPage.module.css";

type SummaryPanelDemoPageProps = {
  validationType: SummaryValidationType;
  errorTypeOptions?: SegmentedControlOption[];
  errorTypeSelectOptions?: SelectMenuOption[];
  defaultErrorType?: SummaryErrorType;
  title: string;
  description: string;
  hints: string[];
  panelHeight?: number;
  getPanelProps?: (errorType: SummaryErrorType) => Partial<SummaryPanelProps>;
  renderExtraControls?: (errorType: SummaryErrorType) => ReactNode;
  extraPanelKey?: string;
  demoColumnClassName?: string;
};

function SummaryPanelCellCountControls({
  cellCountMode,
  onCellCountModeChange,
}: {
  cellCountMode: string;
  onCellCountModeChange: (value: string) => void;
}) {
  return (
    <SegmentedControl
      className={styles.cellCountControl}
      value={cellCountMode}
      options={CELL_COUNT_MODE_OPTIONS}
      onChange={onCellCountModeChange}
      aria-label="Cell count variant"
    />
  );
}

function SummaryPanelDemoPage({
  validationType,
  errorTypeOptions = [{ value: "invalid-value", label: "Invalid value" }],
  errorTypeSelectOptions,
  defaultErrorType = "invalid-value",
  title,
  description,
  hints,
  panelHeight = 840,
  getPanelProps,
  renderExtraControls,
  extraPanelKey = "",
  demoColumnClassName,
}: SummaryPanelDemoPageProps) {
  const [panelKey, setPanelKey] = useState(0);
  const [errorType, setErrorType] = useState<SummaryErrorType>(defaultErrorType);
  const [cellCountMode, setCellCountMode] = useState("multiple");
  const demoCellCount = cellCountMode === "single" ? 1 : undefined;
  const showCellCountControl = validationType !== "gaps";
  const showSegmentedErrorTypeControl =
    !errorTypeSelectOptions && errorTypeOptions.length > 1;
  const showSelectErrorTypeControl =
    errorTypeSelectOptions !== undefined && errorTypeSelectOptions.length > 0;

  const handleReset = () => {
    setPanelKey((current) => current + 1);
  };

  const panelPropsFromDemo = getPanelProps?.(errorType) ?? {};

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </header>

      <section className={styles.stage} aria-label="Summary panel preview">
        <div className={styles.interactive}>
          <div
            className={[styles.demoColumn, demoColumnClassName].filter(Boolean).join(" ")}
          >
            <div className={styles.demoControls}>
              <div className={styles.interactiveHeader}>
                <p className={styles.sectionLabel}>Interactive</p>
                <Button variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              {showSegmentedErrorTypeControl && (
                <SegmentedControl
                  className={styles.errorTypeControl}
                  value={errorType}
                  options={errorTypeOptions}
                  onChange={(value) => setErrorType(value as SummaryErrorType)}
                  aria-label="Error type"
                />
              )}

              {showSelectErrorTypeControl && (
                <SingleSelect
                  className={styles.errorTypeSelect}
                  label="Validation scenario"
                  value={errorType}
                  options={errorTypeSelectOptions}
                  onChange={(value) => setErrorType(value as SummaryErrorType)}
                  placeholder="Select a scenario"
                  aria-label="Validation scenario"
                />
              )}

              {renderExtraControls?.(errorType)}

              {showCellCountControl && (
                <SummaryPanelCellCountControls
                  cellCountMode={cellCountMode}
                  onCellCountModeChange={setCellCountMode}
                />
              )}
            </div>

            <SummaryPanel
              key={`${panelKey}-${errorType}-${extraPanelKey}-${cellCountMode}`}
              validationType={validationType}
              errorType={errorType}
              {...(validationType === "text"
                ? {
                    characterLimit: DEMO_CHARACTER_LIMIT,
                    enteredCharacterCount: DEMO_ENTERED_CHARACTER_COUNT,
                    exceededLimitCellText: DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
                  }
                : validationType === "date"
                  ? { dateFormat: DEMO_DATE_FORMAT }
                  : validationType === "date-time"
                    ? { dateTimeFormat: DEMO_DATE_TIME_FORMAT }
                    : {})}
              {...panelPropsFromDemo}
              {...(demoCellCount !== undefined ? { cellCount: demoCellCount } : {})}
              defaultCollapsed={false}
              panelHeight={panelHeight}
              onClose={() => undefined}
            />

            <p className={styles.hint}>
              Try this flow:
              <ol className={styles.hintList}>
                {hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ol>
            </p>
          </div>
        </div>
      </section>

      <UsageCodePanel {...summaryPanelUsage} />
    </div>
  );
}

const LIST_ERROR_TYPE_OPTIONS: SegmentedControlOption[] = [
  { value: "invalid-value", label: "Invalid value" },
  { value: "missing-value", label: "Missing value" },
];

const TEXT_ERROR_TYPE_OPTIONS: SegmentedControlOption[] = [
  { value: "exceeded-character-limit", label: "Exceeded character limit" },
  { value: "value-required", label: "Value Required" },
];

const NUMERIC_ERROR_TYPE_SELECT_OPTIONS: SelectMenuOption[] = [
  { value: "exceeded-decimal-limit", label: "Exceeded decimal limit" },
  { value: "exceeded-decimal-below-min", label: "Exceeded decimal limit and below min" },
  { value: "exceeded-decimal-above-max", label: "Exceeded decimal limit and above max" },
  { value: "missing-value", label: "Missing value" },
  { value: "invalid-value", label: "Invalid value" },
  { value: "below-min-value", label: "Below min value" },
  { value: "above-max-value", label: "Above max value" },
];

const CELL_COUNT_MODE_OPTIONS: SegmentedControlOption[] = [
  { value: "multiple", label: "Multiple cells" },
  { value: "single", label: "Single cell" },
];

const CELL_COUNT_HINT =
  "Switch between Multiple cells and Single cell to preview plural and singular summary copy. Single cell disables Apply to drill holes.";

const SHARED_HINTS = [
  "Select or enter a value — Stage Change enables.",
  "Switch to Apply to drill holes — the hole multi-select fills the remaining space and scrolls.",
  "Click the SUMMARY bar to collapse and expand the panel.",
  "In staged state, change the value or apply scope — Update Staged Value enables.",
  "In staged or approved state, use Show/Hide details to compare the new value with the previous invalid value.",
];

export function SummaryPanelListPage() {
  return (
    <SummaryPanelDemoPage
      validationType="list"
      errorTypeOptions={LIST_ERROR_TYPE_OPTIONS}
      title="List"
      description="Summary panel for list validation errors. Switch between invalid and missing value error types, then pick an existing list value or add a new one before staging and approving."
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
        CELL_COUNT_HINT,
        "Select a list value — Stage Change enables.",
        "Click Add new value to type a custom value, or Choose existing value to switch back.",
        ...SHARED_HINTS.slice(1),
      ]}
    />
  );
}

export function SummaryPanelTextPage() {
  return (
    <SummaryPanelDemoPage
      validationType="text"
      errorTypeOptions={TEXT_ERROR_TYPE_OPTIONS}
      defaultErrorType="exceeded-character-limit"
      title="Text"
      description="Summary panel for text validation errors. Switch between exceeded character limit and value required error types, then choose a resolution or enter a corrected value before staging and approving."
      hints={[
        "Use the error type control to switch between Exceeded character limit and Value Required.",
        CELL_COUNT_HINT,
        "For exceeded character limit, choose Trim to existing character limit or Increase character limit manually.",
        "When increasing the limit manually, enter a new character limit — Stage Change enables.",
        "With Apply to drill holes selected, a warning appears if the new limit is still below some selected cell lengths.",
        "For value required, enter a value in the text area — Stage Change enables.",
        ...SHARED_HINTS.slice(1),
      ]}
    />
  );
}

export function SummaryPanelBooleanPage() {
  return (
    <SummaryPanelDemoPage
      validationType="boolean"
      errorTypeOptions={LIST_ERROR_TYPE_OPTIONS}
      title="Boolean"
      description="Summary panel for boolean validation errors. Switch between invalid and missing value error types, then choose True or False before staging and approving."
      panelHeight={824}
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
        CELL_COUNT_HINT,
        "Choose True or False — Stage Change enables.",
        "Switch to Apply to drill holes — the hole multi-select fills the remaining space and scrolls.",
        "Click the SUMMARY bar to collapse and expand the panel.",
        "In staged state, change the value or apply scope — Update Staged Value enables.",
        "In staged or approved state, use Show/Hide details to compare the new value with the previous invalid value.",
      ]}
    />
  );
}

export function SummaryPanelDatePage() {
  return (
    <SummaryPanelDemoPage
      validationType="date"
      errorTypeOptions={LIST_ERROR_TYPE_OPTIONS}
      title="Date"
      description="Summary panel for date validation errors. Switch between invalid and missing value error types, then enter a date in the required format before staging and approving."
      panelHeight={824}
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
        CELL_COUNT_HINT,
        "Enter a date in the required format — Stage Change enables when the value is valid.",
        "Invalid dates show a field error and keep Stage Change disabled.",
        "The format hint beside the Date label comes from your column schema (demo: yyyy/mm/dd).",
        "Switch to Apply to drill holes — the hole multi-select fills the remaining space and scrolls.",
        "Click the SUMMARY bar to collapse and expand the panel.",
        "In staged state, change the value or apply scope — Update Staged Value enables.",
        "In staged or approved state, use Show/Hide details to compare the new value with the previous invalid value.",
      ]}
    />
  );
}

export function SummaryPanelDateTimePage() {
  return (
    <SummaryPanelDemoPage
      validationType="date-time"
      errorTypeOptions={LIST_ERROR_TYPE_OPTIONS}
      title="Date/Time"
      description="Summary panel for date/time validation errors. Switch between invalid and missing value error types, then enter a date and time in the required format before staging and approving."
      panelHeight={824}
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
        CELL_COUNT_HINT,
        "Enter a date and time in the required format — Stage Change enables when the value is valid.",
        "Invalid values show a field error and keep Stage Change disabled.",
        "The format hint beside the Date Time label comes from your column schema (demo: yyyy/mm/dd hh:mm:ss).",
        "Switch to Apply to drill holes — the hole multi-select fills the remaining space and scrolls.",
        "Click the SUMMARY bar to collapse and expand the panel.",
        "In staged state, change the value or apply scope — Update Staged Value enables.",
        "In staged or approved state, use Show/Hide details to compare the new value with the previous invalid value.",
      ]}
    />
  );
}

export function SummaryPanelNumericPage() {
  return (
    <SummaryPanelDemoPage
      validationType="numeric"
      errorTypeSelectOptions={NUMERIC_ERROR_TYPE_SELECT_OPTIONS}
      defaultErrorType="exceeded-decimal-limit"
      title="Numeric"
      description="Summary panel for numeric validation errors. Choose a validation scenario, then choose a resolution or enter a corrected value before staging and approving."
      panelHeight={880}
      getPanelProps={(errorType) => {
        const shared = { decimalMax: DEMO_DECIMAL_MAX };

        if (errorType === "exceeded-decimal-limit") {
          return {
            ...shared,
            enteredDecimalCount: DEMO_ENTERED_DECIMAL_COUNT,
            invalidValue: DEMO_NUMERIC_EXCEEDED_DECIMAL_VALUE,
            maxEnteredDecimalCountInSelection: DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
          };
        }

        if (errorType === "exceeded-decimal-below-min") {
          return {
            ...shared,
            enteredDecimalCount: DEMO_ENTERED_DECIMAL_COUNT,
            invalidValue: DEMO_NUMERIC_EXCEEDED_DECIMAL_BELOW_MIN_VALUE,
            minValue: DEMO_NUMERIC_MIN_VALUE,
            maxEnteredDecimalCountInSelection: DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
          };
        }

        if (errorType === "exceeded-decimal-above-max") {
          return {
            ...shared,
            enteredDecimalCount: DEMO_ENTERED_DECIMAL_COUNT,
            invalidValue: DEMO_NUMERIC_EXCEEDED_DECIMAL_ABOVE_MAX_VALUE,
            maxValue: DEMO_NUMERIC_MAX_VALUE,
            maxEnteredDecimalCountInSelection: DEMO_MAX_ENTERED_DECIMAL_COUNT_IN_SELECTION,
          };
        }

        if (errorType === "below-min-value") {
          return {
            ...shared,
            invalidValue: DEMO_NUMERIC_BELOW_MIN_VALUE,
            minValue: DEMO_NUMERIC_MIN_VALUE,
          };
        }

        if (errorType === "above-max-value") {
          return {
            ...shared,
            invalidValue: DEMO_NUMERIC_ABOVE_MAX_VALUE,
            maxValue: DEMO_NUMERIC_MAX_VALUE,
          };
        }

        return shared;
      }}
      hints={[
        "Use the validation scenario dropdown to switch between all seven numeric error types.",
        CELL_COUNT_HINT,
        "For exceeded decimal limit, choose Round to current decimal limit, Increase max decimal limit, or Adjust value manually.",
        "Dual-error scenarios (decimal limit + min/max) use a single Enter Updated Value field validated against all constraints.",
        "When increasing the decimal limit, enter a new limit — Stage Change enables when valid.",
        "With Apply to drill holes selected, a warning appears if the new limit is still below some selected cell decimal counts.",
        "Enter a valid numeric value — Stage Change enables when input passes validation.",
        "All numeric entry fields enforce the column decimal limit (demo: 2 decimal places).",
        ...SHARED_HINTS.slice(1),
      ]}
    />
  );
}

export function SummaryPanelGapsPage() {
  return (
    <SummaryPanelDemoPage
      validationType="gaps"
      defaultErrorType="gaps-not-allowed"
      title="Gaps"
      description="Summary panel for gaps validation errors. The To value in the row above must match the From value in the row below — adjust one or both so they are equal before staging and approving."
      panelHeight={880}
      hints={[
        "A gap exists when the To value in one row does not match the From value in the next row (demo: 30.0 vs 40.0 = gap of 10.0).",
        "Click the To or From error cell — summary copy reflects which cell you selected.",
        "Enter matching numeric values in both fields — Stage Change enables when they are equal.",
        "Field errors appear for invalid numbers or when the values still do not match.",
        "Click the SUMMARY bar to collapse and expand the panel.",
        "In staged state, change the values — Update Staged Value enables.",
        "In staged or approved state, use Show/Hide details to compare the new values with the previous gap.",
      ]}
    />
  );
}
