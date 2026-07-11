import errorInactive from "../assets/error-inactive.svg";
import errorActive from "../assets/error-active.svg";
import stagedInactive from "../assets/staged-inactive.svg";
import stagedActive from "../assets/staged-active.svg";
import approvedInactive from "../assets/approved-inactive.svg";
import approvedActive from "../assets/approved-active.svg";
import type { StatusFilter } from "../FilterBar.types";

const ICONS: Record<
  StatusFilter,
  { inactive: string; active: string; alt: string }
> = {
  errors: { inactive: errorInactive, active: errorActive, alt: "Errors" },
  staged: { inactive: stagedInactive, active: stagedActive, alt: "Staged" },
  approved: {
    inactive: approvedInactive,
    active: approvedActive,
    alt: "Approved",
  },
};

type StatusIconProps = {
  variant: StatusFilter;
  active: boolean;
  className?: string;
};

export function StatusIcon({ variant, active, className }: StatusIconProps) {
  const icon = ICONS[variant];

  return (
    <img
      src={active ? icon.active : icon.inactive}
      alt=""
      aria-hidden="true"
      className={className}
      width={14}
      height={14}
    />
  );
}
