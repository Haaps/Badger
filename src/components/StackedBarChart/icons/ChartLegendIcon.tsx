import errorIcon from "../assets/error.svg";
import stagedIcon from "../assets/staged.svg";
import approvedIcon from "../assets/approved.svg";
import type { StackedBarChartCounts } from "../StackedBarChart.types";

const ICONS: Record<keyof StackedBarChartCounts, string> = {
  errors: errorIcon,
  staged: stagedIcon,
  approved: approvedIcon,
};

type ChartLegendIconProps = {
  variant: keyof StackedBarChartCounts;
  className?: string;
};

export function ChartLegendIcon({ variant, className }: ChartLegendIconProps) {
  return (
    <img
      src={ICONS[variant]}
      alt=""
      aria-hidden="true"
      className={className}
      width={12}
      height={12}
    />
  );
}
