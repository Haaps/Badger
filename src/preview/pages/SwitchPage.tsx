import { useState } from "react";
import { Switch } from "../../components/Switch";
import { HandleOnHoverIcon, HandleOnIcon } from "../../components/Switch/icons";
import switchStyles from "../../components/Switch/Switch.module.css";
import { UsageCodePanel } from "../UsageCodePanel";
import { switchUsage } from "../usageSnippets";
import styles from "./SwitchPage.module.css";

const STATES = [
  { label: "Off", checked: false, hovered: false },
  { label: "Off hover", checked: false, hovered: true },
  { label: "On", checked: true, hovered: false },
  { label: "On hover", checked: true, hovered: true },
] as const;

function StaticSwitch({
  checked,
  hovered,
  label,
}: (typeof STATES)[number]) {
  const trackClassNames = [
    switchStyles.track,
    checked ? switchStyles.trackOn : switchStyles.trackOff,
    hovered && (checked ? switchStyles.trackOnHover : switchStyles.trackOffHover),
  ]
    .filter(Boolean)
    .join(" ");

  const handleClassNames = [
    switchStyles.handle,
    checked && switchStyles.handleOn,
  ]
    .filter(Boolean)
    .join(" ");

  const HandleIcon = hovered ? HandleOnHoverIcon : HandleOnIcon;

  return (
    <span className={switchStyles.root}>
      <span className={switchStyles.control}>
        <span className={trackClassNames} aria-hidden="true">
          <span className={handleClassNames}>
            {checked && <HandleIcon className={switchStyles.handleIcon} />}
          </span>
        </span>
      </span>
      <span className={switchStyles.label}>{label}</span>
    </span>
  );
}

export function SwitchPage() {
  const [checked, setChecked] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Switch</h2>
        <p className={styles.description}>
          Toggle with animated handle. Track and thumb use ease-in-out transitions
          matching the Figma Off, Off hover, On, and On hover states.
        </p>
      </header>

      <section className={styles.stage} aria-label="Switch preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>
          <Switch
            checked={checked}
            onCheckedChange={setChecked}
            label="Enable notifications"
          />
        </div>

        <div className={styles.stateGrid}>
          {STATES.map((state) => (
            <div key={state.label} className={styles.stateItem}>
              <StaticSwitch {...state} />
            </div>
          ))}
        </div>
      </section>

      <UsageCodePanel {...switchUsage} />
    </div>
  );
}
