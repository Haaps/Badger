import { useState } from "react";
import { Button } from "../../components/Button";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { SegmentedControlOption } from "../../components/SegmentedControl";
import {
  DEMO_CHARACTER_LIMIT,
  DEMO_ENTERED_CHARACTER_COUNT,
  DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
  SummaryPanel,
} from "../../components/SummaryPanel";
import type { SummaryErrorType, SummaryValidationType } from "../../components/SummaryPanel";
import { UsageCodePanel } from "../UsageCodePanel";
import { summaryPanelUsage } from "../usageSnippets";
import styles from "./SummaryPanelPage.module.css";

type SummaryPanelDemoPageProps = {
  validationType: SummaryValidationType;
  errorTypeOptions?: SegmentedControlOption[];
  defaultErrorType?: SummaryErrorType;
  title: string;
  description: string;
  hints: string[];
  panelHeight?: number;
};

function SummaryPanelDemoPage({
  validationType,
  errorTypeOptions = [{ value: "invalid-value", label: "Invalid value" }],
  defaultErrorType = "invalid-value",
  title,
  description,
  hints,
  panelHeight = 840,
}: SummaryPanelDemoPageProps) {
  const [panelKey, setPanelKey] = useState(0);
  const [errorType, setErrorType] = useState<SummaryErrorType>(defaultErrorType);
  const showErrorTypeControl = errorTypeOptions.length > 1;

  const handleReset = () => {
    setPanelKey((current) => current + 1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </header>

      <section className={styles.stage} aria-label="Summary panel preview">
        <div className={styles.interactive}>
          <div className={styles.demoColumn}>
            <div className={styles.demoControls}>
              <div className={styles.interactiveHeader}>
                <p className={styles.sectionLabel}>Interactive</p>
                <Button variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              {showErrorTypeControl && (
                <SegmentedControl
                  className={styles.errorTypeControl}
                  value={errorType}
                  options={errorTypeOptions}
                  onChange={(value) => setErrorType(value as SummaryErrorType)}
                  aria-label="Error type"
                />
              )}
            </div>

            <SummaryPanel
              key={`${panelKey}-${errorType}`}
              validationType={validationType}
              errorType={errorType}
              {...(validationType === "text"
                ? {
                    characterLimit: DEMO_CHARACTER_LIMIT,
                    enteredCharacterCount: DEMO_ENTERED_CHARACTER_COUNT,
                    exceededLimitCellText: DEMO_EXCEEDED_CHARACTER_LIMIT_TEXT,
                  }
                : {})}
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
      title="List validation"
      description="Summary panel for list validation errors. Switch between invalid and missing value error types, then pick an existing list value or add a new one before staging and approving."
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
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
      title="Text validation"
      description="Summary panel for text validation errors. Switch between exceeded character limit and value required error types, then choose a resolution or enter a corrected value before staging and approving."
      hints={[
        "Use the error type control to switch between Exceeded character limit and Value Required.",
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
      title="Boolean validation"
      description="Summary panel for boolean validation errors. Switch between invalid and missing value error types, then choose True or False before staging and approving."
      panelHeight={824}
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
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
      title="Date validation"
      description="Summary panel for date validation errors. Switch between invalid and missing value error types, then enter a date in the required format before staging and approving."
      panelHeight={824}
      hints={[
        "Use the error type control to switch between Invalid value and Missing value.",
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
