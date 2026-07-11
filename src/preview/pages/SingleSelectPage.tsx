import { useState } from "react";
import {
  SingleSelect,
  createHoleOptions,
} from "../../components/SingleSelect";
import { UsageCodePanel } from "../UsageCodePanel";
import { singleSelectUsage } from "../usageSnippets";
import styles from "./SingleSelectPage.module.css";

const SELECT_OPTIONS = createHoleOptions(20);

export function SingleSelectPage() {
  const [value, setValue] = useState("abc-00-003");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Single Select</h2>
        <p className={styles.description}>
          Dropdown single-select from Figma with a field trigger and a menu panel
          derived from the multi-select list — same item styling, no checkboxes,
          no All row. The label row accepts an optional link; omit{" "}
          <code>linkText</code> when you do not need one.
        </p>
      </header>

      <section className={styles.stage} aria-label="Single select preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <SingleSelect
            value={value}
            options={SELECT_OPTIONS}
            onChange={setValue}
            label="Field Label"
            placeholder="Placeholder text"
            aria-label="Hole selection"
          />
        </div>

        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>With optional link</p>
          <SingleSelect
            value={value}
            options={SELECT_OPTIONS}
            onChange={setValue}
            label="Field Label"
            linkText="Text Link"
            linkHref="#"
            placeholder="Placeholder text"
            aria-label="Hole selection"
          />
        </div>
      </section>

      <UsageCodePanel {...singleSelectUsage} />
    </div>
  );
}
