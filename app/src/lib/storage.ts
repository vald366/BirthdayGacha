import { Redis } from "@upstash/redis";
import { DEFAULT_STATE, type GameState } from "./state";

const STATE_KEY = process.env.STATE_KEY ?? "gacha:state";

let client: Redis | null = null;
function redis(): Redis {
  if (!client) client = Redis.fromEnv();
  return client;
}

export async function loadState(): Promise<GameState> {
  const raw = await redis().get<GameState>(STATE_KEY);
  if (!raw) {
    await redis().set(STATE_KEY, DEFAULT_STATE);
    return DEFAULT_STATE;
  }
  return raw;
}

export async function saveState(state: GameState): Promise<void> {
  await redis().set(STATE_KEY, state);
}

export async function mutateState(
  fn: (state: GameState) => GameState | Promise<GameState>
): Promise<GameState> {
  const current = await loadState();
  const next = await fn(current);
  await saveState(next);
  return next;
}
