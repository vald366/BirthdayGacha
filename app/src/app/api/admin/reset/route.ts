import { isAdmin } from "@/lib/auth";
import { saveState } from "@/lib/storage";
import { DEFAULT_STATE } from "@/lib/state";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await saveState(DEFAULT_STATE);
    return Response.json(DEFAULT_STATE);
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
