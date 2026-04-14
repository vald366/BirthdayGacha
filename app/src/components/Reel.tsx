"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { RARITY_COLOR, type Prize } from "@/lib/state";

const ITEM_WIDTH = 110;
const ITEM_HEIGHT = 82;
const GAP = 6;
const SPIN_DURATION = 6;

type Props = {
  prizes: Prize[];
  spins: number;
  onAfterSpin?: () => void;
};

type Stage = "idle" | "spinning" | "revealed";

type SpinResponse = {
  prize: Prize;
  strip: string[];
  winnerIndex: number;
  error?: string;
};

export function Reel({ prizes, spins, onAfterSpin }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [strip, setStrip] = useState<string[]>([]);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  const prizeById = useMemo(() => {
    const map = new Map<string, Prize>();
    for (const p of prizes) map.set(p.id, p);
    return map;
  }, [prizes]);

  const pitch = ITEM_WIDTH + GAP;

  async function spin() {
    if (stage !== "idle") return;
    if (spins <= 0) return;

    setError(null);

    try {
      const res = await fetch("/api/spin", { method: "POST" });
      const data = (await res.json()) as SpinResponse;
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStrip(data.strip);
      setWinner(data.prize);
      setStage("spinning");

      await controls.set({ x: 0 });
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const viewport = viewportRef.current?.clientWidth ?? 0;
      const winnerCenter = data.winnerIndex * pitch + ITEM_WIDTH / 2;
      const jitter = (Math.random() - 0.5) * (ITEM_WIDTH - 20);
      const offset = winnerCenter - viewport / 2 + jitter;

      await controls.start({
        x: -offset,
        transition: {
          duration: SPIN_DURATION,
          ease: [0.05, 0.7, 0.1, 1],
        },
      });

      setStage("revealed");
      onAfterSpin?.();
    } catch (err) {
      setError((err as Error).message);
      setStage("idle");
    }
  }

  function dismiss() {
    setStage("idle");
    setWinner(null);
  }

  const buttonDisabled = stage !== "idle" || spins <= 0;

  return (
    <div className="w-full h-full flex flex-col gap-1.5">
      <div
        ref={viewportRef}
        className="relative w-full flex-1 overflow-hidden rounded-sm"
        style={{
          minHeight: ITEM_HEIGHT + 12,
          background: "rgba(58, 36, 16, 0.08)",
          boxShadow: "inset 0 0 0 1px rgba(58, 36, 16, 0.3)",
        }}
      >
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            width: "2px",
            background: "#8b1e1e",
            boxShadow: "0 0 8px rgba(139, 30, 30, 0.6)",
          }}
        />
        <motion.div
          animate={controls}
          className="absolute top-1.5 left-0 flex"
          style={{ gap: `${GAP}px`, willChange: "transform" }}
        >
          {strip.map((id, idx) => {
            const p = prizeById.get(id);
            if (!p) return null;
            return <PrizeTile key={`${id}-${idx}`} prize={p} />;
          })}
          {strip.length === 0
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="shrink-0 rounded-sm"
                  style={{
                    width: ITEM_WIDTH,
                    height: ITEM_HEIGHT,
                    background: "rgba(58, 36, 16, 0.08)",
                    border: "1px dashed rgba(58, 36, 16, 0.3)",
                  }}
                />
              ))
            : null}
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-2 shrink-0">
        <div
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(12px, 1.3vw, 20px)",
            color: "#2a1608",
          }}
        >
          Осталось спинов: <span style={{ fontWeight: 700 }}>{spins}</span>
        </div>
        <button
          onClick={spin}
          disabled={buttonDisabled}
          className="rounded-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:brightness-105"
          style={{
            background: "linear-gradient(#5a3418, #3e2712)",
            color: "#f5e6c8",
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(13px, 1.4vw, 22px)",
            padding: "0.35em 1.2em",
            border: "1px solid #2a1608",
            letterSpacing: "0.02em",
          }}
        >
          {stage === "spinning"
            ? "Крутится..."
            : spins <= 0
            ? "Нет спинов"
            : "Крутить рулетку"}
        </button>
      </div>

      {error ? (
        <p style={{ fontSize: "0.75em", color: "#8b1e1e" }}>Ошибка: {error}</p>
      ) : null}

      {stage === "revealed" && winner ? (
        <RevealOverlay prize={winner} onDismiss={dismiss} />
      ) : null}
    </div>
  );
}

function PrizeTile({ prize }: { prize: Prize }) {
  const color = RARITY_COLOR[prize.rarity];
  return (
    <div
      className="shrink-0 rounded-sm overflow-hidden relative"
      style={{
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderBottom: `3px solid ${color}`,
        background: "rgba(58, 36, 16, 0.12)",
        boxShadow: "inset 0 0 0 1px rgba(58, 36, 16, 0.3)",
      }}
    >
      {prize.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={prize.image}
          alt={prize.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-center px-1"
          style={{
            fontSize: "11px",
            color: "#3a2410",
            fontWeight: 500,
          }}
        >
          {prize.name}
        </div>
      )}
    </div>
  );
}

function RevealOverlay({
  prize,
  onDismiss,
}: {
  prize: Prize;
  onDismiss: () => void;
}) {
  const color = RARITY_COLOR[prize.rarity];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(11, 8, 5, 0.82)", backdropFilter: "blur(6px)" }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative rounded p-6 min-w-[300px] text-center"
        style={{
          background: "linear-gradient(#f4e1b8, #e4c98a)",
          boxShadow: `0 0 60px ${color}, inset 0 0 0 2px #3e2712`,
          color: "#1b120a",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 rounded-sm overflow-hidden"
          style={{
            width: 220,
            height: 165,
            background: "rgba(58, 36, 16, 0.1)",
            borderBottom: `6px solid ${color}`,
            boxShadow: "inset 0 0 0 1px rgba(58, 36, 16, 0.4)",
          }}
        >
          {prize.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={prize.image}
              alt={prize.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm opacity-70">
              {prize.name}
            </div>
          )}
        </div>
        <div
          className="uppercase mb-1"
          style={{
            color,
            fontSize: "0.75em",
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          {prize.rarity}
        </div>
        <div
          className="mb-4"
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: "28px",
            lineHeight: 1.1,
          }}
        >
          {prize.name}
        </div>
        <button
          onClick={onDismiss}
          className="rounded-sm hover:brightness-105"
          style={{
            background: "linear-gradient(#5a3418, #3e2712)",
            color: "#f5e6c8",
            fontFamily: "var(--font-script), cursive",
            fontSize: "18px",
            padding: "0.35em 1.5em",
            border: "1px solid #2a1608",
          }}
        >
          Продолжить
        </button>
      </motion.div>
    </motion.div>
  );
}
