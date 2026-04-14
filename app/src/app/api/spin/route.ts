import { mutateState } from "@/lib/storage";
import { buildStrip, pickWeighted, WINNER_INDEX } from "@/lib/spin";
import type { Prize } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    let chosen: Prize | null = null;
    let strip: string[] = [];

    const state = await mutateState((s) => {
      if (s.spins <= 0) throw new Error("no-spins");
      if (s.prizes.length === 0) throw new Error("empty-pool");

      const winner = pickWeighted(s.prizes);
      chosen = winner;
      strip = buildStrip(s.prizes, winner);

      s.spins -= 1;
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
