import { useState } from "react";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { SegmentedControlOption } from "../../components/SegmentedControl";
import { UsageCodePanel } from "../UsageCodePanel";
import { segmentedControlUsage } from "../usageSnippets";
import styles from "./SegmentedControlPage.module.css";

const BUTTON_OPTIONS: SegmentedControlOption[] = [
  { value: "first", label: "Button 1" },
  { value: "second", label: "Button 2" },
];

const STATES: {
  label: string;
  value: string;
  options: SegmentedControlOption[];
}[] = [
  {
    label: "Both enabled",
    value: "first",
    options: BUTTON_OPTIONS,
  },
  {
    label: "Button 1 disabled",
    value: "second",
    options: [
      { value: "first", label: "Button 1", disabled: true },
      { value: "second", label: "Button 2" },
    ],
  },
  {
    label: "Button 2 disabled",
    value: "first",
    options: [
      { value: "first", label: "Button 1" },
      { value: "second", label: "Button 2", disabled: true },
    ],
  },
];

export function SegmentedControlPage() {
  const [value, setValue] = useState<string>("first");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Segmented Control</h2>
        <p className={styles.description}>
          Two-segment control from Figma with a sliding white indicator. Selection
          uses the same 200ms ease-in-out transition as the Switch.
        </p>
      </header>

      <section className={styles.stage} aria-label="Segmented control preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <SegmentedControl
            value={value}
            options={BUTTON_OPTIONS}
            onChange={setValue}
            aria-label="View mode"
          />
        </div>

        <div className={styles.stateGrid}>
          {STATES.map((state) => (
            <div key={state.label} className={styles.stateItem}>
              <p className={styles.stateLabel}>{state.label}</p>
              <SegmentedControl
                value={state.value}
                options={state.options}
                aria-label={state.label}
              />
            </div>
          ))}
        </div>
      </section>

      <UsageCodePanel {...segmentedControlUsage} />
    </div>
  );
}
