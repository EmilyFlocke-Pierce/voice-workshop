// One observation per line. A line that names two features, or joins two findings with
// "and" or "also", becomes two lines with their own quotes. When a split would leave a line
// without a quote, the line stays whole and goes to the layout flags.
import type { Observation } from "../types.ts";

const FEATURE_JOIN = /\s+(?:and|&|\/)\s+/i;
const FINDING_JOIN = /;\s*|,?\s+and also\s+|\.\s+also,?\s+|,?\s+also\s+/i;

export interface SplitResult {
  lines: Observation[];
  keptWhole: Observation[];
}

export function bundled(o: Observation): boolean {
  const pattern = o.pattern.replace(/"[^"]*"/g, '""');
  const feature = o.feature.replace(/"[^"]*"/g, '""');
  return FEATURE_JOIN.test(feature) || FINDING_JOIN.test(pattern);
}

export function splitLine(o: Observation): SplitResult {
  if (!bundled(o)) return { lines: [o], keptWhole: [] };
  const featureParts = o.feature.split(FEATURE_JOIN).map((s) => s.trim()).filter(Boolean);
  const patternParts = o.pattern.split(FINDING_JOIN).map((s) => s.trim().replace(/\.?$/, ".")).filter((s) => s.length > 1);
  const n = Math.max(featureParts.length, patternParts.length);
  if (n < 2 || o.quotes.length < n) return { lines: [], keptWhole: [o] };
  const per = Math.floor(o.quotes.length / n);
  const lines: Observation[] = [];
  for (let i = 0; i < n; i++) {
    const quotes = o.quotes.slice(i * per, i === n - 1 ? undefined : (i + 1) * per);
    lines.push({
      feature: featureParts[i] ?? featureParts[featureParts.length - 1],
      where: o.where,
      quotes,
      pattern: patternParts[i] ?? patternParts[patternParts.length - 1],
    });
  }
  return { lines, keptWhole: [] };
}
