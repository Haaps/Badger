import { Button } from "../../components/Button";
import { UsageCodePanel } from "../UsageCodePanel";
import { buttonUsage } from "../usageSnippets";
import styles from "./ButtonPage.module.css";

type TextButtonRow = {
  label: string;
  withIcon?: boolean;
  previewState?: "hover";
  disabled?: boolean;
  loading?: boolean;
};

const PRIMARY_ROWS: TextButtonRow[] = [
  { label: "Default" },
  { label: "Default", withIcon: true },
  { label: "Hover", previewState: "hover" },
  { label: "Hover", withIcon: true, previewState: "hover" },
  { label: "Disabled", disabled: true },
  { label: "Disabled", withIcon: true, disabled: true },
  { label: "Loading", loading: true },
];

const SECONDARY_ROWS: TextButtonRow[] = PRIMARY_ROWS;

const DESTRUCTIVE_ROWS: TextButtonRow[] = [
  { label: "Default" },
  { label: "Default", withIcon: true },
  { label: "Hover", previewState: "hover" },
  { label: "Hover", withIcon: true, previewState: "hover" },
  { label: "Disabled", disabled: true },
  { label: "Disabled", withIcon: true, disabled: true },
];

function TextButtonGrid({
  variant,
  rows,
}: {
  variant: "primary" | "secondary" | "destructive";
  rows: TextButtonRow[];
}) {
  return (
    <div className={styles.grid}>
      {rows.map((row) => (
        <div
          key={`${variant}-${row.label}-${row.withIcon ?? false}-${row.previewState ?? "default"}`}
          className={styles.stateItem}
        >
          <span className={styles.stateLabel}>
            {row.label}
            {row.withIcon ? " + icon" : ""}
          </span>
          <Button
            variant={variant}
            icon={row.withIcon ? true : undefined}
            previewState={row.previewState}
            disabled={row.disabled}
            loading={row.loading}
          >
            Button Text
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ButtonPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Button</h2>
        <p className={styles.description}>
          Primary, secondary, destructive, and icon-only buttons from Figma. Text
          buttons accept an optional leading icon via the <code>icon</code> prop.
        </p>
      </header>

      <section className={styles.stage} aria-label="Button preview">
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Interactive</p>
          <div className={styles.interactiveRow}>
            <Button variant="primary">Button Text</Button>
            <Button variant="primary" icon>
              Button Text
            </Button>
            <Button variant="secondary">Button Text</Button>
            <Button variant="secondary" icon>
              Button Text
            </Button>
            <Button variant="destructive">Button Text</Button>
            <Button variant="destructive" icon>
              Button Text
            </Button>
            <Button variant="icon" aria-label="Add" />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.variantTitle}>Primary</h3>
          <TextButtonGrid variant="primary" rows={PRIMARY_ROWS} />
        </div>

        <div className={styles.section}>
          <h3 className={styles.variantTitle}>Secondary</h3>
          <TextButtonGrid variant="secondary" rows={SECONDARY_ROWS} />
        </div>

        <div className={styles.section}>
          <h3 className={styles.variantTitle}>Destructive</h3>
          <TextButtonGrid variant="destructive" rows={DESTRUCTIVE_ROWS} />
        </div>

        <div className={styles.section}>
          <h3 className={styles.variantTitle}>Icon only</h3>
          <div className={styles.grid}>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Default</span>
              <Button variant="icon" aria-label="Add" />
            </div>
            <div className={styles.stateItem}>
              <span className={styles.stateLabel}>Hover</span>
              <Button variant="icon" previewState="hover" aria-label="Add" />
            </div>
          </div>
        </div>
      </section>

      <UsageCodePanel {...buttonUsage} />
    </div>
  );
}
