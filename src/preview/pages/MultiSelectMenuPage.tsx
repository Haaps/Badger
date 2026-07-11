import { useState } from "react";
import {
  MultiSelectMenu,
  createHoleOptions,
} from "../../components/MultiSelectMenu";
import { UsageCodePanel } from "../UsageCodePanel";
import { multiSelectMenuUsage } from "../usageSnippets";
import styles from "./MultiSelectMenuPage.module.css";

const MENU_OPTIONS = createHoleOptions(20);

export function MultiSelectMenuPage() {
  const [value, setValue] = useState<string[]>(["abc-00-003"]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Multi Select Menu</h2>
        <p className={styles.description}>
          Dropdown multi-select from Figma with a working All header. Select
          none, one, multiple, or all items. All shows indeterminate when
          partially selected. Hover uses the same teal background without
          checking the box.
        </p>
      </header>

      <section className={styles.stage} aria-label="Multi select menu preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <MultiSelectMenu
            value={value}
            options={MENU_OPTIONS}
            onChange={setValue}
            aria-label="Hole selection"
          />
        </div>
      </section>

      <UsageCodePanel {...multiSelectMenuUsage} />
    </div>
  );
}
