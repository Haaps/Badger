import type { ComponentType } from "react";
import {
  ApprovedActiveIcon,
  ApprovedInactiveIcon,
  ErrorActiveIcon,
  ErrorInactiveIcon,
  StagedActiveIcon,
  StagedInactiveIcon,
} from "../icons";
import type { StatusFilter } from "../FilterBar.types";

type IconComponent = ComponentType<{ className?: string }>;

/** Active/inactive SVG pairs per status — copy FilterBar/icons/ with the component. */
const ICONS: Record<
  StatusFilter,
  { inactive: IconComponent; active: IconComponent }
> = {
  errors: { inactive: ErrorInactiveIcon, active: ErrorActiveIcon },
  staged: { inactive: StagedInactiveIcon, active: StagedActiveIcon },
  approved: { inactive: ApprovedInactiveIcon, active: ApprovedActiveIcon },
};

type StatusIconProps = {
  variant: StatusFilter;
  active: boolean;
  className?: string;
};

export function StatusIcon({ variant, active, className }: StatusIconProps) {
  const Icon = active ? ICONS[variant].active : ICONS[variant].inactive;

  return <Icon className={className} />;
}
