import type { ComponentType } from "react";
import { ButtonPage } from "./pages/ButtonPage";
import { CheckboxPage } from "./pages/CheckboxPage";
import { FilterBarPage } from "./pages/FilterBarPage";
import { RadioPage } from "./pages/RadioPage";
import { StackedBarChartPage } from "./pages/StackedBarChartPage";
import { SegmentedControlPage } from "./pages/SegmentedControlPage";
import { MultiSelectMenuPage } from "./pages/MultiSelectMenuPage";
import { SingleSelectPage } from "./pages/SingleSelectPage";
import { SwitchPage } from "./pages/SwitchPage";
import { TokensPage } from "./pages/TokensPage";

export type ComponentEntry = {
  path: string;
  label: string;
  Page: ComponentType;
};

export const componentCatalog: ComponentEntry[] = [
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
];
