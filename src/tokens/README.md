# Design tokens

Global tokens are generated from Figma JSON exports in `json/`.

## Source files

| File | Figma export |
|------|----------------|
| `colors.json` | Color variables (Mode 1) |
| `dimensions.json` | Padding, corner radius, icon sizes, stroke |
| `typography.json` | Type scale from Product file (node 91:411) |

## Update from Figma

1. Export variables from Figma as JSON
2. Replace the matching file in `json/`
3. Run `npm run tokens:build`

This regenerates `global.css` and the Design Tokens gallery page.

## JSON format

Figma W3C exports are supported directly:

```json
{
  "Neutral": {
    "500": {
      "$type": "color",
      "$value": { "hex": "#141414" }
    }
  },
  "Padding": {
    "X Small": {
      "$type": "number",
      "$value": 8
    }
  }
}
```

Numbers become `px` in CSS. Colors use the `hex` field.

Typography uses a nested style format:

```json
{
  "small": {
    "regular": {
      "font-size": { "value": "14px", "figma": "Small/Regular" },
      "font-weight": { "value": "400" }
    }
  }
}
```

## CSS variable names

Figma groups become dashed names:

- `Neutral/500` → `--neutral-500`
- `Padding/X Small` → `--padding-x-small`
- `Corner Radius/Small` → `--corner-radius-small`
- `Small/Regular/font-size` → `--typography-small-regular-font-size`

Typography tokens are prefixed with `typography-` to avoid name collisions.

## Component-specific values

One-off layout dimensions (e.g. stacked bar width, switch track size) live in the component CSS module, not in global tokens. Use global tokens when a value is shared across the system or exported from Figma variables.

## Handoff

Copy `src/tokens/` with your components. Import once:

```ts
import "@/tokens/global.css";
```
