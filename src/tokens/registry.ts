import registry from "./registry.json";
import type { FlatToken } from "./parseTokens";

export const tokenRegistry = registry as FlatToken[];

export function getTokensByCategory() {
  return tokenRegistry.reduce<Record<string, FlatToken[]>>((groups, token) => {
    if (!groups[token.category]) {
      groups[token.category] = [];
    }
    groups[token.category].push(token);
    return groups;
  }, {});
}
