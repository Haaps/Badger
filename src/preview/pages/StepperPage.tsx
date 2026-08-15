import { useState } from "react";
import { SingleSelect } from "../../components/SingleSelect";
import { Stepper } from "../../components/Stepper";
import type { StepperStep } from "../../components/Stepper";
import { UsageCodePanel } from "../UsageCodePanel";
import { stepperUsage } from "../usageSnippets";
import styles from "./StepperPage.module.css";

const WORKFLOW_STEPS: StepperStep[] = [
  { label: "Upload" },
  { label: "Configure" },
  { label: "Map" },
  { label: "Validate & Export" },
];

const STATE_SHOWCASE_STEPS: StepperStep[] = [
  { label: "Upload", previewState: "selected" },
  { label: "Configure", previewState: "hover" },
  { label: "Map", previewState: "disabled" },
  { label: "Validate & Export", previewState: "default" },
];

const ENABLED_THROUGH_OPTIONS = [
  { value: "-1", label: "None enabled beyond first" },
  { value: "0", label: "Through Upload" },
  { value: "1", label: "Through Configure" },
  { value: "2", label: "Through Map" },
  { value: "3", label: "Through Validate & Export" },
];

const ACTIVE_OPTIONS = WORKFLOW_STEPS.map((step, index) => ({
  value: String(index),
  label: step.label,
}));

export function StepperPage() {
  const [enabledThroughStepIndex, setEnabledThroughStepIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleEnabledThroughChange = (value: string) => {
    const nextEnabledThrough = Number.parseInt(value, 10);
    setEnabledThroughStepIndex(nextEnabledThrough);
    setCurrentStepIndex((current) => Math.min(current, nextEnabledThrough + 1));
  };

  const selectableActiveOptions = ACTIVE_OPTIONS.filter(
    (_, index) => index <= enabledThroughStepIndex + 1,
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Stepper</h2>
        <p className={styles.description}>
          Horizontal workflow stepper from Figma. Each step uses the Streamline
          number-circle icon. A step is only enabled once the previous step is
          finished — use <code>enabledThroughStepIndex</code> and{" "}
          <code>currentStepIndex</code> to drive state. There is no separate
          completed visual; finished steps return to the default outline style.
        </p>
      </header>

      <section className={styles.stage} aria-label="Stepper preview">
        <div className={styles.interactive}>
          <p className={styles.sectionLabel}>Interactive</p>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <p className={styles.controlLabel}>Enabled through step</p>
              <SingleSelect
                value={String(enabledThroughStepIndex)}
                options={ENABLED_THROUGH_OPTIONS}
                onChange={handleEnabledThroughChange}
                aria-label="Enabled through step"
              />
            </div>

            <div className={styles.controlGroup}>
              <p className={styles.controlLabel}>Active step</p>
              <SingleSelect
                value={String(currentStepIndex)}
                options={selectableActiveOptions}
                onChange={(value) => setCurrentStepIndex(Number.parseInt(value, 10))}
                aria-label="Active step"
              />
            </div>
          </div>

          <div className={styles.stepperFrame}>
            <Stepper
              steps={WORKFLOW_STEPS}
              enabledThroughStepIndex={enabledThroughStepIndex}
              currentStepIndex={currentStepIndex}
              onStepChange={setCurrentStepIndex}
              aria-label="Workflow progress"
            />
          </div>
        </div>

        <div className={styles.stateGrid}>
          <div className={styles.stateItem}>
            <p className={styles.stateLabel}>
              Figma states — selected, hover, disabled, default
            </p>
            <Stepper
              steps={STATE_SHOWCASE_STEPS}
              enabledThroughStepIndex={-1}
              currentStepIndex={0}
              aria-label="Stepper visual states"
            />
          </div>
        </div>
      </section>

      <UsageCodePanel {...stepperUsage} />
    </div>
  );
}
