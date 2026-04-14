import { loadState } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await loadState();
    return Response.json(state, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
