import { useState } from "react";
import { StepNumberIcon } from "./icons";
import type {
  ResolvedStepperStepState,
  StepperProps,
  StepperStep,
  StepperStepPreviewState,
} from "./Stepper.types";
import styles from "./Stepper.module.css";

function isStepEnabled(
  stepIndex: number,
  enabledThroughStepIndex: number,
  step: StepperStep,
) {
  if (step.disabled) {
    return false;
  }

  return stepIndex === 0 || stepIndex <= enabledThroughStepIndex + 1;
}

function resolveStepState(
  step: StepperStep,
  stepIndex: number,
  currentStepIndex: number,
  enabledThroughStepIndex: number,
): ResolvedStepperStepState {
  if (step.previewState) {
    return step.previewState;
  }

  if (!isStepEnabled(stepIndex, enabledThroughStepIndex, step)) {
    return "disabled";
  }

  if (stepIndex === currentStepIndex) {
    return "selected";
  }

  return "default";
}

export function Stepper({
  steps,
  currentStepIndex,
  enabledThroughStepIndex = -1,
  onStepChange,
  className,
  "aria-label": ariaLabel = "Progress",
}: StepperProps) {
  const rootClassNames = [styles.root, className].filter(Boolean).join(" ");

  return (
    <nav className={rootClassNames} aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;
        const state = resolveStepState(step, index, currentStepIndex, enabledThroughStepIndex);
        const previewState = step.previewState;
        const enabled = isStepEnabled(index, enabledThroughStepIndex, step);

        return (
          <StepperItem
            key={`${step.label}-${index}`}
            step={step}
            stepIndex={index}
            stepNumber={index + 1}
            state={state}
            previewState={previewState}
            enabled={enabled}
            isFirst={isFirst}
            isLast={isLast}
            onStepChange={onStepChange}
          />
        );
      })}
    </nav>
  );
}

type StepperItemProps = {
  step: StepperStep;
  stepIndex: number;
  stepNumber: number;
  state: ResolvedStepperStepState;
  previewState?: StepperStepPreviewState;
  enabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  onStepChange?: (stepIndex: number) => void;
};

function StepperItem({
  step,
  stepIndex,
  stepNumber,
  state,
  previewState,
  enabled,
  isFirst,
  isLast,
  onStepChange,
}: StepperItemProps) {
  const [hovered, setHovered] = useState(false);
  const isDisabled = state === "disabled" || previewState === "disabled";
  const isSelected = state === "selected" || previewState === "selected";
  const showHover =
    previewState === "hover" || (hovered && enabled && !isSelected && !isDisabled);
  const showActiveRegion = isSelected || showHover;

  const iconVariant = isSelected
    ? "selected"
    : isDisabled
      ? "disabled"
      : "default";

  const iconClassNames = [
    styles.icon,
    iconVariant === "selected" && styles.iconSelected,
    iconVariant === "default" && stepNumber === 1 && styles.iconDefaultStepOne,
    iconVariant === "default" && stepNumber !== 1 && styles.iconDefault,
    iconVariant === "disabled" && styles.iconDisabled,
  ]
    .filter(Boolean)
    .join(" ");

  const labelClassNames = [
    styles.label,
    isSelected && styles.labelSelected,
    isDisabled && styles.labelDisabled,
  ]
    .filter(Boolean)
    .join(" ");

  const stepClassNames = [
    styles.step,
    isFirst && styles.stepFirst,
    isLast && styles.stepLast,
    showActiveRegion && styles.stepActiveRegion,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = () => {
    if (enabled && onStepChange) {
      onStepChange(stepIndex);
    }
  };

  return (
    <div className={stepClassNames}>
      <button
        type="button"
        className={styles.stepButton}
        disabled={!enabled || !onStepChange}
        aria-current={isSelected ? "step" : undefined}
        aria-disabled={isDisabled || undefined}
        data-preview-state={previewState}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <StepNumberIcon
          stepNumber={Math.min(stepNumber, 4)}
          variant={iconVariant}
          className={iconClassNames}
        />
        <span className={labelClassNames}>{step.label}</span>
      </button>
    </div>
  );
}

export type {
  StepperProps,
  StepperStep,
  StepperStepPreviewState,
  ResolvedStepperStepState,
} from "./Stepper.types";
