import { Redis } from "@upstash/redis";
import { DEFAULT_STATE, type GameState } from "./state";

const STATE_KEY = process.env.STATE_KEY ?? "gacha:state:v19";

function envUrl(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
}
function envToken(): string | undefined {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
}

let client: Redis | null = null;
function redis(): Redis | null {
  if (client) return client;
  const url = envUrl();
  const token = envToken();
  if (!url || !token) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing Upstash/KV REST URL or token in env (expected UPSTASH_REDIS_REST_* or KV_REST_API_*)"
      );
    }
    return null;
  }
  client = new Redis({ url, token });
  return client;
}

type MemoryStore = { state: GameState | null };
const globalForMemory = globalThis as unknown as { __gachaMemory?: MemoryStore };
function memory(): MemoryStore {
  if (!globalForMemory.__gachaMemory) {
    globalForMemory.__gachaMemory = { state: null };
  }
  return globalForMemory.__gachaMemory;
}

export async function loadState(): Promise<GameState> {
  const r = redis();
  if (!r) {
    const m = memory();
    if (!m.state) m.state = structuredClone(DEFAULT_STATE);
    return m.state;
  }
  const raw = await r.get<GameState>(STATE_KEY);
  if (!raw) {
    await r.set(STATE_KEY, DEFAULT_STATE);
    return DEFAULT_STATE;
  }
  return raw;
}

export async function saveState(state: GameState): Promise<void> {
  const r = redis();
  if (!r) {
    memory().state = state;
    return;
  }
  await r.set(STATE_KEY, state);
}

export async function mutateState(
  fn: (state: GameState) => GameState | Promise<GameState>
): Promise<GameState> {
  const current = await loadState();
  const next = await fn(current);
  await saveState(next);
  return next;
}
