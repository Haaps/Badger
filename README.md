# Badger Components

Reusable React components from the [Badger Figma design](https://www.figma.com/design/dzi8MHeplDajcKXuboYVyP/Badger). Includes a local gallery to preview everything together.

## Project structure

```
src/
├── tokens/              ← hand off with components
│   ├── json/            ← drop Figma JSON exports here
│   ├── global.css       ← generated CSS variables
│   └── README.md
├── components/          ← hand off this folder
│   ├── FilterBar/
│   ├── StackedBarChart/
│   └── Checkbox/
└── preview/             ← gallery app (not for handoff)
    ├── App.tsx
    ├── catalog.ts
    ├── PreviewLayout.tsx
    └── pages/
        └── FilterBarPage.tsx
```

## Quick start (gallery)

```bash
cd /Users/haaps/Projects/badger-filter-component
npm install
npm run dev
```

If `npm` is not on your PATH:

```bash
./scripts/dev.sh
```

Open the URL Vite prints (usually `http://localhost:5173`). The sidebar lists all components; each has its own preview page.

## Adding a new component

1. Create a self-contained folder under `src/components/YourComponent/`
2. Add a preview page at `src/preview/pages/YourComponentPage.tsx`
3. Register it in `src/preview/catalog.ts`
4. Add a usage snippet in `src/preview/usageSnippets.ts` and render `<UsageCodePanel />` on the preview page

```ts
{
  path: "your-component",
  label: "Your Component",
  Page: YourComponentPage,
}
```

## Hand off to another app

Copy `src/components/` (or individual component folders) into the target project. Do not copy `src/preview/`.

### Filter Bar example

```tsx
import { useState } from "react";
import { FilterBar, type FilterBarValue } from "@/components/FilterBar";

function MyPage() {
  const [filters, setFilters] = useState<FilterBarValue>({ mode: "all" });

  return (
    <FilterBar
      value={filters}
      onChange={setFilters}
      counts={{ errors: 3, staged: 1, approved: 1 }}
    />
  );
}
```

### Filter Bar behavior

- **All** is exclusive — selecting it clears Errors, Staged, and Approved.
- **Errors / Staged / Approved** are AND filters and can be combined.
- When **All** is active, the other three look deactivated (gray) but remain clickable.
- When any status filter is active, **All** looks deactivated but stays clickable.
- **Hover** shows each chip's accent color, including on visually deactivated chips.
- Turning off the last status filter falls back to **All**.

### Stacked Bar Chart example

```tsx
import { StackedBarChart } from "@/components/StackedBarChart";

<StackedBarChart counts={{ errors: 804, staged: 370, approved: 20 }} />
```

Bar is fixed at **225×8px**. Segments are proportional to the total of all three counts. Legend always shows all three labels with comma-formatted numbers and can extend wider than the bar.

## Requirements for target apps

- React 18+
- CSS Modules (`*.module.css`)
- SVG imports as URLs
- Inter font (or override tokens in `tokens.css`)
