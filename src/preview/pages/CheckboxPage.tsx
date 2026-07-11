import { useState } from "react";
import { Checkbox } from "../../components/Checkbox";
import { UsageCodePanel } from "../UsageCodePanel";
import { checkboxUsage } from "../usageSnippets";
import styles from "./CheckboxPage.module.css";

const STATES = [
  { label: "Default", checked: false, indeterminate: false, disabled: false },
  {
    label: "Default (disabled)",
    checked: false,
    indeterminate: false,
    disabled: true,
  },
  { label: "Checked", checked: true, indeterminate: false, disabled: false },
  {
    label: "Checked (disabled)",
    checked: true,
    indeterminate: false,
    disabled: true,
  },
  {
    label: "Indeterminate",
    checked: false,
    indeterminate: true,
    disabled: false,
  },
  {
    label: "Indeterminate (disabled)",
    checked: false,
    indeterminate: true,
    disabled: true,
  },
] as const;

export function CheckboxPage() {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Checkbox</h2>
        <p className={styles.description}>
          Six states from Figma: Default, Checked, and Indeterminate — each with
          enabled and disabled variants.
        </p>
      </header>

      <section className={styles.stage} aria-label="Checkbox preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            label="Toggle me"
            onCheckedChange={(next) => {
              setIndeterminate(false);
              setChecked(next);
            }}
          />
        </div>

        <div className={styles.stateGrid}>
          {STATES.map((state) => (
            <div key={state.label} className={styles.stateItem}>
              <Checkbox
                checked={state.checked}
                indeterminate={state.indeterminate}
                disabled={state.disabled}
                label={state.label}
              />
            </div>
          ))}
        </div>
      </section>

      <UsageCodePanel {...checkboxUsage} />
    </div>
  );
}
