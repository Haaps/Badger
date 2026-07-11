import { DataTableWithSummary } from "../../components/DataTable";
import { UsageCodePanel } from "../UsageCodePanel";
import { dataTableUsage } from "../usageSnippets";
import styles from "./DataTablePage.module.css";

export function DataTablePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Data Table</h2>
        <p className={styles.description}>
          Scrollable validation table integrated with the Summary Panel, using the
          exact column headers and demo data from Figma. Colored cells match
          error, staged, and approved states. Only those cells are selectable.
        </p>
      </header>

      <section className={styles.stage} aria-label="Data table preview">
        <DataTableWithSummary className={styles.workspace} />
        <p className={styles.hint}>
          Try this flow:
          <ol className={styles.hintList}>
            <li>Scroll the table within the container.</li>
            <li>
              Click a colored cell — the Summary Panel opens with dummy content
              for that cell.
            </li>
            <li>Click another colored cell — the panel content swaps.</li>
            <li>
              Collapse the panel with the X or SUMMARY bar — the table expands
              back.
            </li>
            <li>Hover rows to see the neutral/50 highlight on white cells.</li>
          </ol>
        </p>
      </section>

      <UsageCodePanel {...dataTableUsage} />
    </div>
  );
}
