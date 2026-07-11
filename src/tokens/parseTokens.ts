export type TokenLeaf = {
  value: string;
  figma?: string;
  type?: string;
};

export type TokenGroup = {
  [key: string]: TokenLeaf | TokenGroup;
};

export type FlatToken = {
  category: string;
  name: string;
  cssVar: string;
  value: string;
  figma?: string;
  type?: string;
};

function isTokenLeaf(node: unknown): node is TokenLeaf {
  return (
    typeof node === "object" &&
    node !== null &&
    "value" in node &&
    typeof (node as TokenLeaf).value === "string"
  );
}

function isW3cToken(node: Record<string, unknown>): boolean {
  return typeof node.$value === "string";
}

function readLeaf(node: Record<string, unknown>): TokenLeaf {
  if (isW3cToken(node)) {
    return {
      value: String(node.$value),
      figma: typeof node.$description === "string" ? node.$description : undefined,
      type: typeof node.$type === "string" ? node.$type : undefined,
    };
  }

  return node as TokenLeaf;
}

function flattenGroup(
  category: string,
  group: TokenGroup,
  prefix = "",
): FlatToken[] {
  const tokens: FlatToken[] = [];

  for (const [key, node] of Object.entries(group)) {
    const path = prefix ? `${prefix}-${key}` : key;

    if (isTokenLeaf(node)) {
      const leaf = readLeaf(node as Record<string, unknown>);
      tokens.push({
        category,
        name: path,
        cssVar: `--${path}`,
        value: leaf.value,
        figma: leaf.figma,
        type: leaf.type,
      });
      continue;
    }

    tokens.push(...flattenGroup(category, node as TokenGroup, path));
  }

  return tokens;
}

export function parseTokenFile(
  category: string,
  contents: TokenGroup,
): FlatToken[] {
  return flattenGroup(category, contents);
}

export function tokensToCss(tokens: FlatToken[]): string {
  const lines = tokens.map(
    (token) => `  ${token.cssVar}: ${token.value};`,
  );

  return `:root {\n${lines.join("\n")}\n}\n`;
}

export function tokensToCssSnippet(tokens: FlatToken[]): string {
  return tokens.map((token) => `${token.cssVar}: ${token.value};`).join("\n");
}
