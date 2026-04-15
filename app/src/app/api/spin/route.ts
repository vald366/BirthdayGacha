import { mutateState } from "@/lib/storage";
import { buildStrip, pickWeighted, WINNER_INDEX } from "@/lib/spin";
import { REGULAR_PULLS, type Prize } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    let chosen: Prize | null = null;
    let strip: string[] = [];

    const state = await mutateState((s) => {
      if (s.spins <= 0) throw new Error("no-spins");

      const pullNumber = s.pullCount + 1;
      const inventorySet = new Set(s.inventory);
      let winner: Prize;

      if (pullNumber > REGULAR_PULLS) {
        const finalPool = s.prizes.filter(
          (p) => p.finalOnly && !inventorySet.has(p.id)
        );
        if (finalPool.length === 0) throw new Error("empty-pool");
        winner = finalPool[0];
      } else {
        const regularPool = s.prizes.filter(
          (p) => !p.finalOnly && !(p.unique && inventorySet.has(p.id))
        );
        if (regularPool.length === 0) throw new Error("empty-pool");

        const duePity = s.prizes.find(
          (p) =>
            p.guaranteedByPull !== undefined &&
            !p.finalOnly &&
            !inventorySet.has(p.id) &&
            pullNumber >= p.guaranteedByPull
        );

        if (duePity) {
          winner = duePity;
        } else {
          winner = pickWeighted(regularPool);
        }
      }

      chosen = winner;
      strip = buildStrip(s.prizes, winner);

      s.spins -= 1;
      s.pullCount = pullNumber;
      s.inventory.push(winner.id);
      return s;
    });

    return Response.json({
      prize: chosen,
      strip,
      winnerIndex: WINNER_INDEX,
      state,
    });
  } catch (err) {
    const msg = (err as Error).message;
    const status = msg === "no-spins" || msg === "empty-pool" ? 409 : 500;
    return Response.json({ error: msg }, { status });
  }
}
