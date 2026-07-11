import { useState } from "react";
import { FilterBar, type FilterBarValue } from "../../components/FilterBar";
import { UsageCodePanel } from "../UsageCodePanel";
import { filterBarUsage } from "../usageSnippets";
import styles from "./FilterBarPage.module.css";

export function FilterBarPage() {
  const [filters, setFilters] = useState<FilterBarValue>({ mode: "all" });
  const counts = { errors: 3, staged: 1, approved: 1 };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Filter Bar</h2>
        <p className={styles.description}>
          Status filters for validation views. All is exclusive; Errors, Staged,
          and Approved combine as AND filters.
        </p>
      </header>

      <section className={styles.stage} aria-label="Filter bar preview">
        <FilterBar value={filters} onChange={setFilters} counts={counts} />
      </section>

      <UsageCodePanel {...filterBarUsage} />
    </div>
  );
}
