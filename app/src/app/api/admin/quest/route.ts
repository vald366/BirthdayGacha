import { isAdmin } from "@/lib/auth";
import { mutateState } from "@/lib/storage";
import type { QuestStatus } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | { questId?: string; status?: QuestStatus }
    | null;
  const questId = body?.questId;
  const status = body?.status;

  if (!questId || !status) {
    return Response.json({ error: "Missing questId or status" }, { status: 400 });
  }
  if (!["locked", "active", "claimed"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const state = await mutateState((s) => {
      const quest = s.quests.find((q) => q.id === questId);
      if (quest) quest.status = status;
      return s;
    });
    return Response.json(state);
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
