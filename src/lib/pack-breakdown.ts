// Pure helper: given an ordered weight in grams and the pack sizes the store
// stocks, compute the optimal (greedy largest-first) breakdown of physical packs
// the picker needs to assemble. Customer never sees this — admin only.

export type PackLine = {
  size: number;   // grams
  count: number;  // how many packs of this size
  padded?: boolean; // true if added to cover a leftover remainder
};

export type Breakdown = {
  lines: PackLine[];
  totalPacked: number; // grams actually packed (>= ordered when padded)
  remainder: number;   // 0 if exact, otherwise grams that needed padding
};

const WEIGHT_TO_GRAMS: Record<string, number> = {
  "100g": 100,
  "250g": 250,
  "500g": 500,
  "1kg": 1000,
};

export function weightToGrams(w: string): number {
  return WEIGHT_TO_GRAMS[w] ?? parseInt(w, 10) || 0;
}

export function formatGrams(g: number): string {
  if (g >= 1000 && g % 1000 === 0) return `${g / 1000}kg`;
  return `${g}g`;
}

export function computeBreakdown(orderedGrams: number, packSizes: number[]): Breakdown {
  if (!packSizes || packSizes.length === 0 || orderedGrams <= 0) {
    return { lines: [], totalPacked: 0, remainder: orderedGrams };
  }
  const sizes = [...new Set(packSizes)].sort((a, b) => b - a);
  const lines: PackLine[] = [];
  let remaining = orderedGrams;
  let packed = 0;

  for (const size of sizes) {
    const count = Math.floor(remaining / size);
    if (count > 0) {
      lines.push({ size, count });
      remaining -= count * size;
      packed += count * size;
    }
  }

  let remainder = remaining;
  if (remainder > 0) {
    const smallest = Math.min(...sizes);
    lines.push({ size: smallest, count: 1, padded: true });
    packed += smallest;
    remainder = 0; // covered by padding
  }

  return { lines, totalPacked: packed, remainder };
}

export function formatBreakdown(b: Breakdown): string {
  if (b.lines.length === 0) return "—";
  return b.lines
    .map((l) => `${l.count} × ${formatGrams(l.size)}${l.padded ? " (padded)" : ""}`)
    .join(" + ");
}
