"use client";

import { useState } from "react";
import type { GameState } from "@/lib/state";

type Props = {
  state: GameState;
  onAfterClaim?: () => void;
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
            fontSize: "clamp(26px, 3.6vw, 56px)",
            lineHeight: 1,
            color: "#2a1608",
          }}
        >
          Журнал заданий
        </h2>
        <span
          style={{
            fontSize: "clamp(16px, 1.8vw, 28px)",
            fontWeight: 600,
            color: "#4a2a10",
            whiteSpace: "nowrap",
          }}
        >
          Круток: {state.spins}
        </span>
      </header>

      <ul className="flex-1 overflow-y-auto pr-1 quest-scroll flex flex-col">
        {state.quests.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-2 flex-1 min-h-0"
            style={{
              borderBottom: "1px dashed rgba(74, 42, 16, 0.25)",
              fontSize: "clamp(18px, 2vw, 32px)",
              padding: "0.6em 0",
            }}
          >
            <div
              className="flex-1 min-w-0"
              style={{
                fontSize: "0.72em",
                lineHeight: 1.2,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                wordBreak: "break-word",
              }}
            >
              {q.status === "locked" ? "???" : q.description ?? q.title}
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
                    padding: "0.15em 0.55em",
                    fontSize: "0.6em",
                    border: "1px solid #2a1608",
                  }}
                >
                  {claimingId === q.id ? "..." : "Забрать"}
                </button>
              ) : q.status === "claimed" ? (
                <span style={{ color: "#2a6a2a", fontSize: "0.9em" }}>✓</span>
              ) : (
                <span style={{ opacity: 0.35, fontSize: "0.8em" }}>✦</span>
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
