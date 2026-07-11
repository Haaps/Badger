import { useState } from "react";
import { TextField } from "../../components/TextField";
import { UsageCodePanel } from "../UsageCodePanel";
import { textFieldUsage } from "../usageSnippets";
import styles from "./TextFieldPage.module.css";

const STATIC_STATES = [
  { label: "Default", props: {} },
  {
    label: "Filled",
    props: { defaultValue: "Placeholder text" },
  },
  {
    label: "Active",
    props: { previewState: "focus" as const },
  },
  {
    label: "Error",
    props: {
      defaultValue: "Placeholder text",
      error: true,
      errorMessage: "Supporting text",
    },
  },
  {
    label: "Disabled",
    props: { defaultValue: "Placeholder text", disabled: true },
  },
] as const;

export function TextFieldPage() {
  const [value, setValue] = useState("");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Text Field</h2>
        <p className={styles.description}>
          Text input from Figma with an optional label-row link, placeholder and
          filled states, focus ring, error icon with supporting text, and
          disabled styling. Omit <code>linkText</code> when you do not need a
          link.
        </p>
      </header>

      <section className={styles.stage} aria-label="Text field preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <TextField
            label="Field Label"
            placeholder="Placeholder text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>With optional link</p>
          <TextField
            label="Field Label"
            linkText="Text Link"
            linkHref="#"
            placeholder="Placeholder text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>

        <div className={styles.stateGrid}>
          {STATIC_STATES.map((state) => (
            <div key={state.label} className={styles.stateItem}>
              <p className={styles.stateName}>{state.label}</p>
              <TextField
                label="Field Label"
                linkText="Text Link"
                linkHref="#"
                placeholder="Placeholder text"
                {...state.props}
              />
            </div>
          ))}
        </div>
      </section>

      <UsageCodePanel {...textFieldUsage} />
    </div>
  );
}
