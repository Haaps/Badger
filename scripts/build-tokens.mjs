import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const jsonDir = path.join(root, "src/tokens/json");
const outFile = path.join(root, "src/tokens/global.css");
const registryFile = path.join(root, "src/tokens/registry.json");

const CATEGORY_PREFIX = new Set(["typography"]);

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function isTokenNode(node) {
  return (
    typeof node === "object" &&
    node !== null &&
    ("$value" in node || "value" in node)
  );
}

function readTokenValue(node) {
  if ("value" in node && !("$value" in node)) {
    return String(node.value);
  }

  const raw = node.$value;

  if (typeof raw === "number") {
    return `${raw}px`;
  }

  if (typeof raw === "string") {
    return raw;
  }

  if (raw && typeof raw === "object" && typeof raw.hex === "string") {
    return raw.hex;
  }

  throw new Error(`Unsupported token value: ${JSON.stringify(raw)}`);
}

function toCssVar(category, pathSegments) {
  const parts = CATEGORY_PREFIX.has(category)
    ? [category, ...pathSegments]
    : pathSegments;

  return `--${parts.join("-")}`;
}

function flattenGroup(category, group, prefixKeys = []) {
  const tokens = [];

  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith("$")) continue;

    const segment = slugify(key);
    const pathSegments = [
      ...(prefixKeys.length ? prefixKeys.map(slugify) : []),
      segment,
    ];

    if (isTokenNode(node)) {
      tokens.push({
        category,
        name: pathSegments.join("-"),
        cssVar: toCssVar(category, pathSegments),
        value: readTokenValue(node),
        figma: node.figma ?? [...prefixKeys, key].join("/"),
        type: node.$type ?? node.type,
      });
      continue;
    }

    if (typeof node === "object" && node !== null) {
      tokens.push(...flattenGroup(category, node, [...prefixKeys, key]));
    }
  }

  return tokens;
}

const files = fs
  .readdirSync(jsonDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

const allTokens = files.flatMap((file) => {
  const category = file.replace(/\.json$/, "");
  const contents = JSON.parse(
    fs.readFileSync(path.join(jsonDir, category + ".json"), "utf8"),
  );

  return flattenGroup(category, contents);
});

const css = `:root {\n${allTokens
  .map((token) => `  ${token.cssVar}: ${token.value};`)
  .join("\n")}\n}\n`;

fs.writeFileSync(
  outFile,
  `/* Generated from src/tokens/json/*.json — run npm run tokens:build after editing */\n${css}`,
);
fs.writeFileSync(registryFile, JSON.stringify(allTokens, null, 2));

console.log(`Built ${allTokens.length} tokens into src/tokens/global.css`);
