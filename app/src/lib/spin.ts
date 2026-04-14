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

export function buildStrip(prizes: Prize[], winner: Prize): string[] {
  const strip: string[] = [];
  for (let i = 0; i < STRIP_LENGTH; i++) {
    if (i === WINNER_INDEX) {
      strip.push(winner.id);
    } else {
      strip.push(pickWeighted(prizes).id);
    }
  }
  return strip;
}
