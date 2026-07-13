import type { ComponentType } from "react";
import { ApprovedIcon, ErrorIcon, StagedIcon } from "../icons";
import type { StackedBarChartCounts } from "../StackedBarChart.types";

type IconComponent = ComponentType<{ className?: string }>;

const ICONS: Record<keyof StackedBarChartCounts, IconComponent> = {
  errors: ErrorIcon,
  staged: StagedIcon,
  approved: ApprovedIcon,
};

type ChartLegendIconProps = {
  variant: keyof StackedBarChartCounts;
  className?: string;
};

export function ChartLegendIcon({ variant, className }: ChartLegendIconProps) {
  const Icon = ICONS[variant];

  return <Icon className={className} />;
}
