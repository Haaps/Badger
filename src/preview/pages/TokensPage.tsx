import { useCallback, useMemo, useState, type ReactNode } from "react";
import { getTokensByCategory, tokenRegistry } from "../../tokens/registry";
import type { FlatToken } from "../../tokens/parseTokens";
import { tokensToCssSnippet } from "../../tokens/parseTokens";
import styles from "./TokensPage.module.css";

const TYPOGRAPHY_SIZE_ORDER = ["xs", "small", "base", "large", "xl", "2xl"] as const;
const TYPOGRAPHY_SIZE_MATCH_ORDER = ["2xl", "xl", "large", "base", "small", "xs"] as const;
const TYPOGRAPHY_PROPERTIES = [
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
] as const;

const SIZE_LABELS: Record<string, string> = {
  xs: "XS",
  small: "Small",
  base: "Base",
  large: "Large",
  xl: "XL",
  "2xl": "2XL",
};

const VARIANT_LABELS: Record<string, string> = {
  regular: "Regular",
  medium: "Medium",
  "semi-bold": "Semi-Bold",
  bold: "Bold",
};

function typographyPropertyLabel(name: string) {
  if (name.endsWith("font-size")) return "Font size";
  if (name.endsWith("font-weight")) return "Font weight";
  if (name.endsWith("line-height")) return "Line height";
  if (name.endsWith("letter-spacing")) return "Letter spacing";
  return name;
}

function isColorValue(value: string) {
  return value.startsWith("#") || value.startsWith("rgb");
}

function getDimensionPreviewKind(token: FlatToken) {
  if (token.name.startsWith("padding-")) return "padding";
  if (token.name.startsWith("corner-radius-")) return "corner-radius";
  if (token.name.startsWith("icon-sizes-")) return "icon-size";
  return null;
}

function parseTypographyToken(name: string) {
  for (const property of TYPOGRAPHY_PROPERTIES) {
    if (!name.endsWith(`-${property}`)) continue;

    const withoutProperty = name.slice(0, -(property.length + 1));

    for (const size of TYPOGRAPHY_SIZE_MATCH_ORDER) {
      if (!withoutProperty.startsWith(`${size}-`)) continue;

      return {
        size,
        variant: withoutProperty.slice(size.length + 1),
        property,
      };
    }
  }

  return null;
}

type TypographyVariant = {
  variant: string;
  label: string;
  figma?: string;
  tokens: FlatToken[];
};

type TypographySizeGroup = {
  size: string;
  label: string;
  variants: TypographyVariant[];
};

function groupTypographyBySize(tokens: FlatToken[]) {
  const fontFamily = tokens.find((token) => token.name === "font-family");
  const nested = new Map<string, Map<string, FlatToken[]>>();

  for (const token of tokens) {
    if (token.name === "font-family") continue;

    const parsed = parseTypographyToken(token.name);
    if (!parsed) continue;

    if (!nested.has(parsed.size)) {
      nested.set(parsed.size, new Map());
    }

    const variants = nested.get(parsed.size)!;

    if (!variants.has(parsed.variant)) {
      variants.set(parsed.variant, []);
    }

    variants.get(parsed.variant)!.push(token);
  }

  const sizeGroups: TypographySizeGroup[] = TYPOGRAPHY_SIZE_ORDER.filter((size) =>
    nested.has(size),
  ).map((size) => {
    const variants = nested.get(size)!;

    return {
      size,
      label: SIZE_LABELS[size] ?? size,
      variants: [...variants.entries()].map(([variant, variantTokens]) => ({
        variant,
        label: VARIANT_LABELS[variant] ?? variant,
        figma: variantTokens.find((token) => token.figma)?.figma,
        tokens: variantTokens.sort((a, b) => a.name.localeCompare(b.name)),
      })),
    };
  });

  return { fontFamily, sizeGroups };
}

function groupDimensionTokens(tokens: FlatToken[]) {
  const visible = tokens.filter((token) => !token.name.startsWith("stroke-"));

  return [
    { title: "Padding", tokens: visible.filter((token) => token.name.startsWith("padding-")) },
    {
      title: "Corner radius",
      tokens: visible.filter((token) => token.name.startsWith("corner-radius-")),
    },
    {
      title: "Icon sizes",
      tokens: visible.filter((token) => token.name.startsWith("icon-sizes-")),
    },
  ].filter((group) => group.tokens.length > 0);
}

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={styles.group}>
      <button
        type="button"
        className={styles.groupHeader}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className={styles.groupHeaderMain}>
          <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true">
            ›
          </span>
          <span className={styles.groupTitle}>{title}</span>
          {count !== undefined && <span className={styles.groupCount}>{count}</span>}
        </span>
      </button>
      {open && <div className={styles.groupBody}>{children}</div>}
    </section>
  );
}

function TypographyVariantBlock({ variant }: { variant: TypographyVariant }) {
  const fontSize =
    variant.tokens.find((token) => token.name.endsWith("font-size"))?.value ?? "14px";
  const fontWeight =
    variant.tokens.find((token) => token.name.endsWith("font-weight"))?.value ?? "400";
  const lineHeight =
    variant.tokens.find((token) => token.name.endsWith("line-height"))?.value ?? "normal";
  const letterSpacing =
    variant.tokens.find((token) => token.name.endsWith("letter-spacing"))?.value ?? "0";

  return (
    <div className={styles.typographyVariant}>
      <div className={styles.typographyVariantHeader}>
        <span className={styles.typographyVariantName}>{variant.label}</span>
        {variant.figma && <span className={styles.typographyFigma}>{variant.figma}</span>}
      </div>

      <p
        className={styles.typographySample}
        style={{
          fontFamily: "var(--typography-font-family)",
          fontSize,
          fontWeight,
          lineHeight,
          letterSpacing,
        }}
      >
        The quick brown fox jumps over the lazy dog
      </p>

      <dl className={styles.typographyDetails}>
        {variant.tokens.map((token) => (
          <div key={token.cssVar} className={styles.typographyDetailRow}>
            <dt className={styles.typographyDetailLabel}>
              {typographyPropertyLabel(token.name)}
            </dt>
            <dd className={styles.typographyDetailValue}>
              <span>{token.value}</span>
              <code className={styles.typographyDetailVar}>{token.cssVar}</code>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TokenRow({ token }: { token: FlatToken }) {
  const [copied, setCopied] = useState(false);
  const dimensionKind = getDimensionPreviewKind(token);

  const copyVar = useCallback(async () => {
    await navigator.clipboard.writeText(`var(${token.cssVar})`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [token.cssVar]);

  return (
    <div className={styles.row}>
      <div className={styles.preview}>
        {isColorValue(token.value) && (
          <span
            className={styles.swatch}
            style={{ backgroundColor: token.value }}
            aria-hidden="true"
          />
        )}
        {dimensionKind === "padding" && (
          <span
            className={styles.spacingBar}
            style={{ width: token.value }}
            aria-hidden="true"
          />
        )}
        {dimensionKind === "corner-radius" && (
          <span
            className={styles.radiusSquare}
            style={{ borderRadius: token.value }}
            aria-hidden="true"
          />
        )}
        {dimensionKind === "icon-size" && (
          <span
            className={styles.iconSquare}
            style={{ width: token.value, height: token.value }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className={styles.meta}>
        <code className={styles.varName}>{token.cssVar}</code>
        <span className={styles.value}>{token.value}</span>
        {token.figma && <span className={styles.figma}>{token.figma}</span>}
      </div>
      <button type="button" className={styles.copyButton} onClick={copyVar}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function TokensPage() {
  const groups = getTokensByCategory();
  const [copiedAll, setCopiedAll] = useState(false);

  const typography = useMemo(
    () => groupTypographyBySize(groups.typography ?? []),
    [groups.typography],
  );

  const dimensionGroups = useMemo(
    () => groupDimensionTokens(groups.dimensions ?? []),
    [groups.dimensions],
  );

  const copyAll = useCallback(async () => {
    await navigator.clipboard.writeText(tokensToCssSnippet(tokenRegistry));
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 2000);
  }, []);

  const categoryOrder = ["colors", "dimensions", "typography"];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.name}>Design Tokens</h2>
        <p className={styles.description}>
          Global tokens loaded from Figma JSON exports in{" "}
          <code>src/tokens/json/</code>. Drop updated exports, then run{" "}
          <code>npm run tokens:build</code>.
        </p>
        <button type="button" className={styles.copyAllButton} onClick={copyAll}>
          {copiedAll ? "Copied all CSS" : "Copy all CSS variables"}
        </button>
      </header>

      <div className={styles.groups}>
        {categoryOrder.map((category) => {
          const tokens = groups[category];
          if (!tokens?.length) return null;

          if (category === "typography") {
            const visibleCount =
              typography.sizeGroups.reduce(
                (total, group) => total + group.variants.length,
                0,
              ) + (typography.fontFamily ? 1 : 0);

            return (
              <CollapsibleSection
                key={category}
                title="Typography"
                count={visibleCount}
              >
                {typography.fontFamily && (
                  <div className={styles.subsection}>
                    <TokenRow token={typography.fontFamily} />
                  </div>
                )}

                {typography.sizeGroups.map((sizeGroup) => (
                  <div key={sizeGroup.size} className={styles.subsection}>
                    <h4 className={styles.subsectionTitle}>{sizeGroup.label}</h4>
                    <div className={styles.typographySizeGroup}>
                      {sizeGroup.variants.map((variant) => (
                        <TypographyVariantBlock
                          key={`${sizeGroup.size}-${variant.variant}`}
                          variant={variant}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            );
          }

          if (category === "dimensions") {
            const visibleCount = dimensionGroups.reduce(
              (total, group) => total + group.tokens.length,
              0,
            );

            return (
              <CollapsibleSection
                key={category}
                title="Dimensions"
                count={visibleCount}
              >
                {dimensionGroups.map((subgroup) => (
                  <div key={subgroup.title} className={styles.subsection}>
                    <h4 className={styles.subsectionTitle}>{subgroup.title}</h4>
                    <div className={styles.table}>
                      {subgroup.tokens.map((token) => (
                        <TokenRow key={token.cssVar} token={token} />
                      ))}
                    </div>
                  </div>
                ))}
              </CollapsibleSection>
            );
          }

          return (
            <CollapsibleSection key={category} title={category} count={tokens.length}>
              <div className={styles.table}>
                {tokens.map((token) => (
                  <TokenRow key={token.cssVar} token={token} />
                ))}
              </div>
            </CollapsibleSection>
          );
        })}
      </div>
    </div>
  );
}
