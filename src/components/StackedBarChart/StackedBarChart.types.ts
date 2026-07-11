export type StackedBarChartCounts = {
  errors: number;
  staged: number;
  approved: number;
};

export type StackedBarChartProps = {
  counts: StackedBarChartCounts;
  className?: string;
  "aria-label"?: string;
};

export type ChartSegment = {
  key: keyof StackedBarChartCounts;
  label: string;
  value: number;
  widthPx: number;
};
