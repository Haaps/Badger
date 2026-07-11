import { useState } from "react";
import { Button } from "../../components/Button";
import { SummaryPanel } from "../../components/SummaryPanel";
import { UsageCodePanel } from "../UsageCodePanel";
import { summaryPanelUsage } from "../usageSnippets";
import styles from "./SummaryPanelPage.module.css";

export function SummaryPanelPage() {
  const [panelKey, setPanelKey] = useState(0);

  const handleReset = () => {
    setPanelKey((current) => current + 1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Summary Panel</h2>
        <p className={styles.description}>
          Right-hand summary panel from Figma for resolving invalid list values.
          Composes Single Select, Text Field, Segmented Control, Multi Select Menu,
          and Button. Use Add new value to enter a custom list value, or Choose
          existing value to return to the select menu.
        </p>
      </header>

      <section className={styles.stage} aria-label="Summary panel preview">
        <div className={styles.interactive}>
          <div className={styles.demoColumn}>
            <p className={styles.sectionLabel}>Interactive</p>

            <div className={styles.controls}>
              <Button variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <SummaryPanel key={panelKey} onClose={() => undefined} />

            <p className={styles.hint}>
              Try this flow:
              <ol className={styles.hintList}>
                <li>Select a value — Stage Change enables.</li>
                <li>
                  Switch to Apply to drill holes — the hole multi-select fills the
                  remaining space and scrolls.
                </li>
                <li>
                  Click Add new value to type a custom value, or Choose existing
                  value to switch back.
                </li>
                <li>Click the SUMMARY bar to collapse and expand the panel.</li>
                <li>
                  In staged state, change the value or apply scope — Update Staged
                  Value enables.
                </li>
                <li>
                  In staged or approved state, use Show/Hide details to compare the
                  new value with the previous invalid value.
                </li>
              </ol>
            </p>
          </div>
        </div>
      </section>

      <UsageCodePanel {...summaryPanelUsage} />
    </div>
  );
}
