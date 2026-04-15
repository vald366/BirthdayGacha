import { mutateState } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { questId?: string } | null;
  const questId = body?.questId;
  if (!questId) {
    return Response.json({ error: "Missing questId" }, { status: 400 });
  }

  try {
    type Outcome = "claimed" | "not-active" | "already-claimed" | "unknown";
    let outcome: Outcome = "unknown" as Outcome;
    const state = await mutateState((s) => {
      const quest = s.quests.find((q) => q.id === questId);
      if (!quest) return s;
      if (quest.status === "claimed") {
        outcome = "already-claimed";
        return s;
      }
      if (quest.status !== "active") {
        outcome = "not-active";
        return s;
      }
      quest.status = "claimed";
      s.spins += quest.reward;
      outcome = "claimed";

      const hidden = s.quests.find((q) => q.id === "q9");
      if (hidden && hidden.status === "locked") {
        const allOthersDone = s.quests
          .filter((q) => q.id !== "q9")
          .every((q) => q.status === "claimed");
        if (allOthersDone) hidden.status = "active";
      }
      return s;
    });

    if (outcome !== "claimed") {
      return Response.json({ error: outcome }, { status: 409 });
    }
    return Response.json(state);
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
