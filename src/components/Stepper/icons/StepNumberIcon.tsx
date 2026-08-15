export type StepNumberIconVariant = "selected" | "default" | "disabled";

type StepNumberIconProps = {
  stepNumber: number;
  variant: StepNumberIconVariant;
  className?: string;
};

const STROKE_WIDTH = 1.71;

const CIRCLE_PATH =
  "M1.64277 15.1643C1.12268 13.9087 0.855 12.563 0.855 11.2039C0.855 8.45922 1.94533 5.82693 3.88613 3.88613C5.82693 1.94533 8.45922 0.855 11.2039 0.855C13.9486 0.855 16.5809 1.94533 18.5217 3.88613C20.4625 5.82693 21.5529 8.45922 21.5529 11.2039C21.5529 12.563 21.2852 13.9087 20.7651 15.1643C20.245 16.4199 19.4827 17.5607 18.5217 18.5217C17.5607 19.4827 16.4199 20.245 15.1643 20.7651C13.9087 21.2852 12.563 21.5529 11.2039 21.5529C9.84489 21.5529 8.49916 21.2852 7.24357 20.7651C5.98798 20.245 4.84712 19.4827 3.88613 18.5217C2.92514 17.5607 2.16285 16.4199 1.64277 15.1643Z";

function StepOneSelectedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37259 18.6274 0 12 0C5.37259 0 0 5.37259 0 12C0 18.6274 5.37259 24 12 24ZM13.0714 6.85714C13.0714 6.26541 12.5917 5.78571 12 5.78571C11.4083 5.78571 10.9286 6.26541 10.9286 6.85714C10.9286 7.68557 10.257 8.35714 9.42857 8.35714H8.57143C7.97969 8.35714 7.5 8.83683 7.5 9.42857C7.5 10.0203 7.97969 10.5 8.57143 10.5H9.42857C9.96331 10.5 10.4711 10.3848 10.9286 10.1778V16.0714H8.57143C7.97969 16.0714 7.5 16.5511 7.5 17.1429C7.5 17.7346 7.97969 18.2143 8.57143 18.2143H15.4286C16.0203 18.2143 16.5 17.7346 16.5 17.1429C16.5 16.5511 16.0203 16.0714 15.4286 16.0714H13.0714V6.85714Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StepOneOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="translate(0.796, 0.796)">
        <path
          d="M11.2039 6.4275V15.9804"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={CIRCLE_PATH}
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function StepTwoOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="translate(0.8, 0.8)">
        <path
          d="M14.3821 15.9736H8.01643V14.6172C8.01643 13.6688 8.57787 12.8103 9.44676 12.4302L12.9889 10.8805C13.8353 10.5102 14.3821 9.67401 14.3821 8.75022C14.3821 7.46603 13.3411 6.425 12.0569 6.425H10.4036C9.36419 6.425 8.47996 7.08926 8.15226 8.01643"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.64241 15.1579C1.12256 13.9028 0.855 12.5577 0.855 11.1993C0.855 9.84085 1.12256 8.49573 1.64241 7.2407C2.16226 5.98567 2.92422 4.84533 3.88477 3.88477C4.84533 2.92422 5.98567 2.16226 7.2407 1.64241C8.49573 1.12256 9.84085 0.855 11.1993 0.855C12.5577 0.855 13.9028 1.12256 15.1579 1.64241C16.4129 2.16226 17.5532 2.92422 18.5138 3.88477C19.4744 4.84533 20.2363 5.98567 20.7562 7.2407C21.276 8.49573 21.5436 9.84085 21.5436 11.1993C21.5436 12.5577 21.276 13.9028 20.7562 15.1579C20.2363 16.4129 19.4744 17.5532 18.5138 18.5138C17.5532 19.4744 16.4129 20.2363 15.1579 20.7562C13.9028 21.276 12.5577 21.5436 11.1993 21.5436C9.84085 21.5436 8.49573 21.276 7.2407 20.7562C5.98567 20.2363 4.84533 19.4744 3.88477 18.5138C2.92422 17.5532 2.16226 16.4129 1.64241 15.1579Z"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function StepThreeOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="translate(0.796, 0.796)">
        <path
          d="M8.08806 14.3882C8.4159 15.3158 9.30054 15.9804 10.3404 15.9804H11.9325C13.2515 15.9804 14.3207 14.9111 14.3207 13.5922V13.1941C14.3207 11.8751 13.2515 10.8059 11.9325 10.8059H11.1365H11.7335C12.9426 10.8059 13.9227 9.82575 13.9227 8.6167C13.9227 7.40762 12.9426 6.42748 11.7335 6.4275L10.5394 6.42752C9.53732 6.42752 8.69251 7.10079 8.43261 8.01964"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={CIRCLE_PATH}
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function StepFourOutlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g transform="translate(0.796, 0.796)">
        <path
          d="M15.1843 13.5921H7.80222C7.48264 13.5921 7.22357 13.3331 7.22357 13.0135C7.22357 12.8733 7.27444 12.7379 7.36674 12.6324L12.6324 6.6145C12.7364 6.49566 12.8866 6.4275 13.0446 6.4275C13.347 6.4275 13.5921 6.67266 13.5921 6.97509V15.9803"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={CIRCLE_PATH}
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function getOutlineIcon(stepNumber: number) {
  switch (stepNumber) {
    case 1:
      return StepOneOutlineIcon;
    case 2:
      return StepTwoOutlineIcon;
    case 3:
      return StepThreeOutlineIcon;
    case 4:
      return StepFourOutlineIcon;
    default:
      return StepOneOutlineIcon;
  }
}

export function StepNumberIcon({ stepNumber, variant, className }: StepNumberIconProps) {
  if (variant === "selected" && stepNumber === 1) {
    return <StepOneSelectedIcon className={className} />;
  }

  const Outline = getOutlineIcon(stepNumber);
  return <Outline className={className} />;
}
