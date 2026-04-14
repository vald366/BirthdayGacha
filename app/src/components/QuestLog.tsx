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
    <div className="w-full h-full flex flex-col text-[#1b120a]">
      <header className="flex items-baseline justify-between mb-2 shrink-0">
        <h2
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(14px, 1.8vw, 26px)",
            lineHeight: 1,
            color: "#2a1608",
          }}
        >
          Журнал заданий
        </h2>
        <span
          style={{
            fontSize: "clamp(10px, 1vw, 14px)",
            fontWeight: 600,
            color: "#4a2a10",
          }}
        >
          Спинов: {state.spins}
        </span>
      </header>

      <ul className="space-y-1.5 flex-1 overflow-y-auto pr-1 quest-scroll">
        {state.quests.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-2 py-1"
            style={{
              borderBottom: "1px dashed rgba(74, 42, 16, 0.25)",
              fontSize: "clamp(11px, 1.1vw, 15px)",
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate" style={{ letterSpacing: "0.01em" }}>
                {q.title}
              </div>
              <div style={{ fontSize: "0.8em", opacity: 0.7 }}>
                +{q.reward} спин · {STATUS_LABEL[q.status]}
              </div>
            </div>
            <div className="shrink-0">
              {q.status === "active" ? (
                <button
                  onClick={() => claim(q.id)}
                  disabled={claimingId === q.id}
                  className="rounded disabled:opacity-50 transition-colors hover:brightness-95"
                  style={{
                    background: "#3e2712",
                    color: "#f5e6c8",
                    fontFamily: "var(--font-script), cursive",
                    padding: "0.25em 0.8em",
                    fontSize: "0.9em",
                    border: "1px solid #2a1608",
                  }}
                >
                  {claimingId === q.id ? "..." : "Забрать"}
                </button>
              ) : q.status === "claimed" ? (
                <span style={{ color: "#2a6a2a", fontSize: "1.1em" }}>✓</span>
              ) : (
                <span style={{ opacity: 0.35 }}>✦</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="mt-1" style={{ fontSize: "0.8em", color: "#8b1e1e" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
