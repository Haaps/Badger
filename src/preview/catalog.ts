import type { ComponentType } from "react";
import { HowToUsePage } from "./pages/HowToUsePage";
import { ButtonPage } from "./pages/ButtonPage";
import { CheckboxPage } from "./pages/CheckboxPage";
import { FilterBarPage } from "./pages/FilterBarPage";
import { RadioPage } from "./pages/RadioPage";
import { StackedBarChartPage } from "./pages/StackedBarChartPage";
import { SegmentedControlPage } from "./pages/SegmentedControlPage";
import { MultiSelectMenuPage } from "./pages/MultiSelectMenuPage";
import { SingleSelectPage } from "./pages/SingleSelectPage";
import { DataTablePage } from "./pages/DataTablePage";
import {
  SummaryPanelListPage,
  SummaryPanelTextPage,
  SummaryPanelBooleanPage,
  SummaryPanelDatePage,
} from "./pages/SummaryPanelPage";
import { SwitchPage } from "./pages/SwitchPage";
import { TextFieldPage } from "./pages/TextFieldPage";
import { TextAreaFieldPage } from "./pages/TextAreaFieldPage";
import { TokensPage } from "./pages/TokensPage";

export type ComponentEntry = {
  path: string;
  label: string;
  Page?: ComponentType;
  children?: ComponentEntry[];
  /** Renders at the top of the nav as a guide link, separated from components. */
  isGuide?: boolean;
};

/** When adding routes or changing integration patterns, also update HowToUsePage.tsx and usageSnippets.ts. */

export const componentCatalog: ComponentEntry[] = [
  {
    path: "how-to-use",
    label: "How to Use",
    Page: HowToUsePage,
    isGuide: true,
  },
  {
    path: "tokens",
    label: "Design Tokens",
    Page: TokensPage,
  },
  {
    path: "filter-bar",
    label: "Filter Bar",
    Page: FilterBarPage,
  },
  {
    path: "stacked-bar-chart",
    label: "Stacked Bar Chart",
    Page: StackedBarChartPage,
  },
  {
    path: "checkbox",
    label: "Checkbox",
    Page: CheckboxPage,
  },
  {
    path: "button",
    label: "Button",
    Page: ButtonPage,
  },
  {
    path: "radio",
    label: "Radio",
    Page: RadioPage,
  },
  {
    path: "switch",
    label: "Switch",
    Page: SwitchPage,
  },
  {
    path: "segmented-control",
    label: "Segmented Control",
    Page: SegmentedControlPage,
  },
  {
    path: "multi-select-menu",
    label: "Multi Select Menu",
    Page: MultiSelectMenuPage,
  },
  {
    path: "single-select",
    label: "Single Select",
    Page: SingleSelectPage,
  },
  {
    path: "text-field",
    label: "Text Field",
    Page: TextFieldPage,
  },
  {
    path: "text-area-field",
    label: "Text Area Field",
    Page: TextAreaFieldPage,
  },
  {
    path: "summary-panel",
    label: "Summary Panel",
    children: [
      {
        path: "summary-panel/list-validation",
        label: "List validation",
        Page: SummaryPanelListPage,
      },
      {
        path: "summary-panel/text-validation",
        label: "Text validation",
        Page: SummaryPanelTextPage,
      },
      {
        path: "summary-panel/boolean-validation",
        label: "Boolean validation",
        Page: SummaryPanelBooleanPage,
      },
      {
        path: "summary-panel/date-validation",
        label: "Date validation",
        Page: SummaryPanelDatePage,
      },
    ],
  },
  {
    path: "data-table",
    label: "Data Table",
    Page: DataTablePage,
  },
];

export function getRoutableEntries(catalog: ComponentEntry[] = componentCatalog) {
  const routes: Array<Required<Pick<ComponentEntry, "path" | "Page">>> = [];

  for (const entry of catalog) {
    if (entry.Page) {
      routes.push({ path: entry.path, Page: entry.Page });
    }

    if (entry.children) {
      routes.push(...getRoutableEntries(entry.children));
    }
  }

  return routes;
}
