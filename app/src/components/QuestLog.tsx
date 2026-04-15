"use client";

import { useState, useLayoutEffect, useRef } from "react";
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
              borderBottom: "2px solid rgba(74, 42, 16, 0.35)",
              fontSize: "clamp(18px, 2vw, 32px)",
              padding: "0.35em 0",
            }}
          >
            <QuestText
              text={
                q.hidden && q.status !== "claimed"
                  ? "???"
                  : q.description ?? q.title
              }
            />
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

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ fontWeight: 800 }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function QuestText({ text }: { text: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;

    function fit() {
      if (!box || !inner) return;
      const boxH = box.clientHeight;
      const boxW = box.clientWidth;
      let lo = 0.4;
      let hi = 1.4;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        inner.style.fontSize = `${mid}em`;
        if (inner.scrollHeight <= boxH && inner.scrollWidth <= boxW) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      inner.style.fontSize = `${lo}em`;
      setScale(lo);
    }

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div
      ref={boxRef}
      className="flex-1 min-w-0 h-full flex items-center"
      style={{ overflow: "hidden" }}
    >
      <div
        ref={innerRef}
        style={{
          fontSize: `${scale}em`,
          lineHeight: 1.2,
          wordBreak: "break-word",
          width: "100%",
        }}
      >
        {renderBold(text)}
      </div>
    </div>
  );
}
