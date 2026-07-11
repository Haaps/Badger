import type { StackedBarChartCounts } from "../components/StackedBarChart";

const SHARED_REQUIREMENTS = [
  "React 18+",
  "CSS Modules (*.module.css)",
  "SVG imports as URLs",
  "Inter font loaded globally",
  "Import src/tokens/global.css once in your app",
];

export const filterBarUsage = {
  filesToCopy: "Copy src/components/FilterBar/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import { FilterBar, type FilterBarValue } from "@/components/FilterBar";

export function MyView() {
  const [filters, setFilters] = useState<FilterBarValue>({ mode: "all" });

  return (
    <FilterBar
      value={filters}
      onChange={setFilters}
      counts={{ errors: 3, staged: 1, approved: 1 }}
    />
  );
}`,
};

export const checkboxUsage = {
  filesToCopy: "Copy src/components/Checkbox/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import { Checkbox } from "@/components/Checkbox";

export function MyView() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={setChecked}
      label="Accept terms"
    />
  );
}`,
};

export const radioUsage = {
  filesToCopy: "Copy src/components/Radio/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import { Radio } from "@/components/Radio";

export function MyView() {
  const [plan, setPlan] = useState("weekly");

  return (
    <Radio
      name="plan"
      value="weekly"
      checked={plan === "weekly"}
      onCheckedChange={() => setPlan("weekly")}
      label="Weekly"
    />
  );
}`,
};

export const switchUsage = {
  filesToCopy: "Copy src/components/Switch/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import { Switch } from "@/components/Switch";

export function MyView() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch
      checked={enabled}
      onCheckedChange={setEnabled}
      label="Enable notifications"
    />
  );
}`,
};

export const segmentedControlUsage = {
  filesToCopy: "Copy src/components/SegmentedControl/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import { SegmentedControl } from "@/components/SegmentedControl";

export function MyView() {
  const [view, setView] = useState("list");

  return (
    <SegmentedControl
      value={view}
      onChange={setView}
      aria-label="View mode"
      options={[
        { value: "list", label: "List" },
        { value: "grid", label: "Grid" },
      ]}
    />
  );
}`,
};

export const buttonUsage = {
  filesToCopy: "Copy src/components/Button/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { Button } from "@/components/Button";

export function MyView() {
  return (
    <>
      <Button variant="primary">Save</Button>
      <Button variant="primary" icon>Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="approval">Approve Update</Button>
      <Button variant="icon" aria-label="Add" />
    </>
  );
}`,
};

export const multiSelectMenuUsage = {
  filesToCopy:
    "Copy src/components/MultiSelectMenu/, src/components/SelectMenu/, and src/components/Checkbox/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import {
  MultiSelectMenu,
  createHoleOptions,
} from "@/components/MultiSelectMenu";

const options = createHoleOptions(20);

export function MyView() {
  const [value, setValue] = useState<string[]>(["abc-00-003"]);

  return (
    <MultiSelectMenu
      value={value}
      options={options}
      onChange={setValue}
      aria-label="Hole selection"
    />
  );
}`,
};

export const singleSelectUsage = {
  filesToCopy:
    "Copy src/components/SingleSelect/, src/components/SelectMenu/, and src/components/Checkbox/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import {
  SingleSelect,
  createHoleOptions,
} from "@/components/SingleSelect";

const options = createHoleOptions(20);

export function MyView() {
  const [value, setValue] = useState("abc-00-003");

  return (
    <SingleSelect
      value={value}
      options={options}
      onChange={setValue}
      label="Field Label"
      placeholder="Placeholder text"
      aria-label="Hole selection"
    />
  );
}

// Optional label-row link — add linkText (and linkHref or onLinkClick) when needed.`,
};

export const textFieldUsage = {
  filesToCopy: "Copy src/components/TextField/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { useState } from "react";
import { TextField } from "@/components/TextField";

export function MyView() {
  const [value, setValue] = useState("");

  return (
    <TextField
      label="Field Label"
      placeholder="Placeholder text"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}

// Optional label-row link — add linkText (and linkHref or onLinkClick) when needed.`,
};

export const summaryPanelUsage = {
  filesToCopy:
    "Copy src/components/SummaryPanel/, src/components/SingleSelect/, src/components/TextField/, src/components/MultiSelectMenu/, src/components/SelectMenu/, src/components/SegmentedControl/, src/components/Button/, and src/components/Checkbox/ into your project.",
  requirements: SHARED_REQUIREMENTS,
  code: `import { SummaryPanel } from "@/components/SummaryPanel";

export function MyView() {
  return (
    <SummaryPanel
      invalidValue="xyz123"
      cellCount={12}
      holeCount={5}
      onClose={() => undefined}
    />
  );
}`,
};

export function getStackedBarChartUsage(counts: StackedBarChartCounts) {
  return {
    filesToCopy: "Copy src/components/StackedBarChart/ into your project.",
    requirements: SHARED_REQUIREMENTS,
    code: `import { StackedBarChart } from "@/components/StackedBarChart";

export function MyView() {
  return (
    <StackedBarChart
      counts={{
        errors: ${counts.errors},
        staged: ${counts.staged},
        approved: ${counts.approved},
      }}
    />
  );
}`,
  };
}
