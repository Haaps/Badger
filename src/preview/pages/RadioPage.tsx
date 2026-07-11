import { useState } from "react";
import { Radio } from "../../components/Radio";
import { getRadioIcon } from "../../components/Radio/radioIcons";
import radioStyles from "../../components/Radio/Radio.module.css";
import { UsageCodePanel } from "../UsageCodePanel";
import { radioUsage } from "../usageSnippets";
import styles from "./RadioPage.module.css";

const STATES = [
  { label: "Default", checked: false, disabled: false, hovered: false },
  { label: "Default hover", checked: false, disabled: false, hovered: true },
  { label: "Default (disabled)", checked: false, disabled: true, hovered: false },
  { label: "Selected", checked: true, disabled: false, hovered: false },
  { label: "Selected hover", checked: true, disabled: false, hovered: true },
  {
    label: "Selected (disabled)",
    checked: true,
    disabled: true,
    hovered: false,
  },
] as const;

function StaticRadio({
  checked,
  disabled,
  hovered,
  label,
}: (typeof STATES)[number]) {
  return (
    <span className={radioStyles.root}>
      <span className={radioStyles.control}>
        <span className={radioStyles.visual} aria-hidden="true">
          <img
            src={getRadioIcon(checked, disabled, hovered)}
            alt=""
            className={radioStyles.icon}
          />
        </span>
      </span>
      <span className={radioStyles.label}>{label}</span>
    </span>
  );
}

export function RadioPage() {
  const [selected, setSelected] = useState("weekly");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Radio</h2>
        <p className={styles.description}>
          Six states from Figma: Default and Selected, each with hover and
          disabled variants.
        </p>
      </header>

      <section className={styles.stage} aria-label="Radio preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <div className={styles.radioGroup} role="radiogroup" aria-label="Frequency">
            <Radio
              name="frequency"
              value="daily"
              checked={selected === "daily"}
              onCheckedChange={() => setSelected("daily")}
              label="Daily"
            />
            <Radio
              name="frequency"
              value="weekly"
              checked={selected === "weekly"}
              onCheckedChange={() => setSelected("weekly")}
              label="Weekly"
            />
            <Radio
              name="frequency"
              value="monthly"
              checked={selected === "monthly"}
              onCheckedChange={() => setSelected("monthly")}
              label="Monthly"
            />
          </div>
        </div>

        <div className={styles.stateGrid}>
          {STATES.map((state) => (
            <div key={state.label} className={styles.stateItem}>
              <StaticRadio {...state} />
            </div>
          ))}
        </div>
      </section>

      <UsageCodePanel {...radioUsage} />
    </div>
  );
}
