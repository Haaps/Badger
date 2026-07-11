import { useState } from "react";
import {
  StackedBarChart,
  randomSplit,
  type StackedBarChartCounts,
} from "../../components/StackedBarChart";
import { UsageCodePanel } from "../UsageCodePanel";
import { getStackedBarChartUsage } from "../usageSnippets";
import styles from "./StackedBarChartPage.module.css";

const DEFAULT_TOTAL = 1346;

function parseCount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function StackedBarChartPage() {
  const [counts, setCounts] = useState<StackedBarChartCounts>(() =>
    randomSplit(DEFAULT_TOTAL),
  );

  const updateCount = (key: keyof StackedBarChartCounts, raw: string) => {
    setCounts((current) => ({ ...current, [key]: parseCount(raw) }));
  };

  const reshuffle = () => setCounts(randomSplit(DEFAULT_TOTAL));

  const total = counts.errors + counts.staged + counts.approved;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Stacked Bar Chart</h2>
        <p className={styles.description}>
          Horizontal status breakdown. Bar segments are proportional to each
          count; legend labels hug their content and can extend past the bar.
        </p>
      </header>

      <p className={styles.instructions}>
        Use the controls below to adjust counts and preview different chart
        states.
      </p>

      <section className={styles.controls} aria-label="Chart controls">
        <label className={styles.control}>
          <span className={styles.controlLabel}>Errors</span>
          <input
            className={styles.input}
            type="number"
            min={0}
            value={counts.errors}
            onChange={(event) => updateCount("errors", event.target.value)}
          />
        </label>
        <label className={styles.control}>
          <span className={styles.controlLabel}>Staged</span>
          <input
            className={styles.input}
            type="number"
            min={0}
            value={counts.staged}
            onChange={(event) => updateCount("staged", event.target.value)}
          />
        </label>
        <label className={styles.control}>
          <span className={styles.controlLabel}>Approved</span>
          <input
            className={styles.input}
            type="number"
            min={0}
            value={counts.approved}
            onChange={(event) => updateCount("approved", event.target.value)}
          />
        </label>
        <button type="button" className={styles.button} onClick={reshuffle}>
          Randomize ({DEFAULT_TOTAL.toLocaleString("en-US")} total)
        </button>
        <p className={styles.total}>Total: {total.toLocaleString("en-US")}</p>
      </section>

      <section className={styles.stage} aria-label="Stacked bar chart preview">
        <StackedBarChart counts={counts} />
      </section>

      <UsageCodePanel {...getStackedBarChartUsage(counts)} />
    </div>
  );
}
