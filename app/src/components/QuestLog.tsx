"use client";

import { useState } from "react";
import type { GameState, Quest } from "@/lib/state";

type Props = {
  state: GameState;
  onAfterClaim?: () => void;
};

const STATUS_LABEL: Record<Quest["status"], string> = {
  locked: "Заблокировано",
  active: "Активный",
  claimed: "Завершено",
};

export function QuestLog({ state, onAfterClaim }: Props) {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function claim(questId: string) {
    setClaimingId(questId);
    setError(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      onAfterClaim?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div className="w-full">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Журнал заданий</h2>
        <span className="text-xs opacity-70">
          Доступно спинов: <span className="font-semibold">{state.spins}</span>
        </span>
      </header>

      <ul className="space-y-2">
        {state.quests.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-3 p-3 rounded border border-white/15 bg-white/5"
          >
            <div className="w-16 aspect-[4/3] bg-white/10 rounded shrink-0 overflow-hidden">
              {q.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={q.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{q.title}</div>
              {q.description ? (
                <div className="text-xs opacity-70 truncate">{q.description}</div>
              ) : null}
              <div className="text-xs opacity-60 mt-1">
                Награда: +{q.reward} Спин · {STATUS_LABEL[q.status]}
              </div>
            </div>
            <div className="shrink-0">
              {q.status === "active" ? (
                <button
                  onClick={() => claim(q.id)}
                  disabled={claimingId === q.id}
                  className="px-3 py-1.5 text-sm rounded bg-white text-black font-semibold disabled:opacity-50"
                >
                  {claimingId === q.id ? "..." : "Получить спин"}
                </button>
              ) : q.status === "claimed" ? (
                <span className="text-xs opacity-50">✓</span>
              ) : (
                <span className="text-xs opacity-30">—</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {error ? <p className="mt-2 text-xs text-red-400">Ошибка: {error}</p> : null}
    </div>
  );
}
