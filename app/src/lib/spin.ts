import type { Prize } from "./state";

export const STRIP_LENGTH = 60;
export const WINNER_INDEX = 50;

export function pickWeighted(prizes: Prize[]): Prize {
  const total = prizes.reduce((s, p) => s + Math.max(0, p.weight), 0);
  if (total <= 0) throw new Error("Prize pool has zero total weight");
  let r = Math.random() * total;
  for (const p of prizes) {
    const w = Math.max(0, p.weight);
    if (r < w) return p;
    r -= w;
  }
  return prizes[prizes.length - 1];
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildShuffledSequence(ids: string[], length: number): string[] {
  if (ids.length === 0) return [];
  const out: string[] = [];
  while (out.length < length) {
    let chunk = shuffle(ids);
    if (ids.length > 1 && out.length > 0 && chunk[0] === out[out.length - 1]) {
      const swapIdx = 1 + Math.floor(Math.random() * (chunk.length - 1));
      [chunk[0], chunk[swapIdx]] = [chunk[swapIdx], chunk[0]];
    }
    for (const id of chunk) {
      out.push(id);
      if (out.length >= length) break;
    }
  }
  return out;
}

export function buildStrip(prizes: Prize[], winner: Prize): string[] {
  const regularIds = prizes.filter((p) => !p.finalOnly).map((p) => p.id);
  const poolIds = regularIds.length > 0 ? regularIds : prizes.map((p) => p.id);
  const strip = buildShuffledSequence(poolIds, STRIP_LENGTH);
  strip[WINNER_INDEX] = winner.id;

  if (poolIds.length > 1) {
    for (const n of [WINNER_INDEX - 1, WINNER_INDEX + 1]) {
      if (n < 0 || n >= strip.length) continue;
      if (strip[n] !== winner.id) continue;
      const outer = n < WINNER_INDEX ? strip[n - 1] : strip[n + 1];
      const replacement = poolIds.find((id) => id !== winner.id && id !== outer);
      if (replacement) strip[n] = replacement;
    }
  }

  return strip;
}
