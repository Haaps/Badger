import { useState } from "react";
import { TextAreaField } from "../../components/TextAreaField";
import { UsageCodePanel } from "../UsageCodePanel";
import { textAreaFieldUsage } from "../usageSnippets";
import styles from "./TextAreaFieldPage.module.css";

const DEMO_LONG_TEXT =
  "Long form entry text that wraps across multiple lines and scrolls vertically. ".repeat(12);

export function TextAreaFieldPage() {
  const [value, setValue] = useState("");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Text Area Field</h2>
        <p className={styles.description}>
          Multiline text input with character counter, max length enforcement,
          and full-height scrollbar aligned to the right edge.
        </p>
      </header>
      <section className={styles.stage} aria-label="Text area field preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <TextAreaField
            label="Enter Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={500}
          />
        </div>
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>With scrollable content</p>
          <TextAreaField
            label="Enter Value"
            defaultValue={DEMO_LONG_TEXT}
            maxLength={500}
            readOnly
          />
        </div>
      </section>
      <UsageCodePanel {...textAreaFieldUsage} />
    </div>
  );
}
