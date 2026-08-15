export type StepperStepPreviewState = "default" | "hover" | "selected" | "disabled";

export type StepperStep = {
  label: string;
  /** When true, the step cannot be selected even if it would otherwise be enabled. */
  disabled?: boolean;
  /** Gallery-only: force a visual state for static previews. */
  previewState?: StepperStepPreviewState;
};

export type StepperProps = {
  steps: StepperStep[];
  /** Index of the active step (0-based). */
  currentStepIndex: number;
  /**
   * Index of the last step the user has finished (0-based), or -1 when none are finished.
   * Step `i` is enabled when `i === 0` or `i <= enabledThroughStepIndex + 1`.
   */
  enabledThroughStepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
  className?: string;
  "aria-label"?: string;
};

export type ResolvedStepperStepState = "selected" | "hover" | "default" | "disabled";
