import type { StackedBarChartProps } from "./StackedBarChart.types";
import { ChartLegendIcon } from "./icons/ChartLegendIcon";
import { formatChartCount, getSegments } from "./utils";
import styles from "./StackedBarChart.module.css";

export function StackedBarChart({
  counts,
  className,
  "aria-label": ariaLabel = "Status breakdown",
}: StackedBarChartProps) {
  const segments = getSegments(counts);
  const visibleBarSegments = segments.filter((segment) => segment.widthPx > 0);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={ariaLabel}
    >
      <div className={styles.bar} aria-hidden="true">
        {visibleBarSegments.map((segment) => (
          <div
            key={segment.key}
            className={[styles.segment, styles[segment.key]].join(" ")}
            style={{ width: `${segment.widthPx}px` }}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {segments.map((segment) => (
          <div key={segment.key} className={styles.legendItem}>
            <ChartLegendIcon variant={segment.key} className={styles.legendIcon} />
            <span className={styles.legendLabel}>
              {formatChartCount(segment.value)} {segment.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { StackedBarChartProps, StackedBarChartCounts } from "./StackedBarChart.types";
