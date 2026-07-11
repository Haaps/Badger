import type { StackedBarChartCounts, ChartSegment } from "./StackedBarChart.types";

export const BAR_WIDTH_PX = 225;
export const BAR_HEIGHT_PX = 8;

const SEGMENT_ORDER: (keyof StackedBarChartCounts)[] = [
  "errors",
  "staged",
  "approved",
];

const SEGMENT_LABELS: Record<keyof StackedBarChartCounts, string> = {
  errors: "errors",
  staged: "staged",
  approved: "approved",
};

export function formatChartCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function getSegments(counts: StackedBarChartCounts): ChartSegment[] {
  const total = counts.errors + counts.staged + counts.approved;

  if (total === 0) {
    return SEGMENT_ORDER.map((key) => ({
      key,
      label: SEGMENT_LABELS[key],
      value: counts[key],
      widthPx: 0,
    }));
  }

  return SEGMENT_ORDER.map((key) => ({
    key,
    label: SEGMENT_LABELS[key],
    value: counts[key],
    widthPx: counts[key] > 0 ? (counts[key] / total) * BAR_WIDTH_PX : 0,
  }));
}

export function randomSplit(total: number): StackedBarChartCounts {
  const first = Math.floor(Math.random() * (total + 1));
  const second = Math.floor(Math.random() * (total - first + 1));

  return {
    errors: first,
    staged: second,
    approved: total - first - second,
  };
}
