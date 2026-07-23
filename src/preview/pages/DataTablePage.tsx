import { useState } from "react";
import { Button } from "../../components/Button";
import { DataTableWithSummary } from "../../components/DataTable";
import { UsageCodePanel } from "../UsageCodePanel";
import { dataTableUsage } from "../usageSnippets";
import styles from "./DataTablePage.module.css";

export function DataTablePage() {
  const [tableKey, setTableKey] = useState(0);

  const handleReset = () => {
    setTableKey((current) => current + 1);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Data Table</h2>
        <p className={styles.description}>
          Scrollable validation table integrated with the Summary Panel. Colored
          cells at the top demonstrate each validation category — click one to
          open the matching correction workflow. Only colored cells are selectable.
        </p>
      </header>

      <section className={styles.stage} aria-label="Data table preview">
        <div className={styles.controls}>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <DataTableWithSummary key={tableKey} className={styles.workspace} />
        <p className={styles.hint}>
          Try this flow:
          <ol className={styles.hintList}>
            <li>Scroll the table within the container.</li>
            <li>
              Click a colored cell — the Summary Panel opens for that validation
              type and error scenario.
            </li>
            <li>Click another colored cell — the panel content swaps.</li>
            <li>
              Collapse the panel with the X or SUMMARY bar — the table expands
              back.
            </li>
            <li>Hover rows to see the neutral/50 highlight on white cells.</li>
            <li>
              From/To intervals run 0→10, 10→20, 20→30, then a gap (To 30.0 vs
              next From 40.0). Click either red cell to fix the gap.
            </li>
            <li>Use Reset to restore the original error-only table.</li>
          </ol>
        </p>
      </section>

      <UsageCodePanel {...dataTableUsage} />
    </div>
  );
}
