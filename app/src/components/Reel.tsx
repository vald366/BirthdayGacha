"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { RARITY_COLOR, type Prize } from "@/lib/state";

const ITEM_WIDTH = 128;
const ITEM_HEIGHT = 96;
const GAP = 8;
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
    <div className="space-y-3">
      <div
        ref={viewportRef}
        className="relative w-full overflow-hidden rounded border border-white/15 bg-white/5"
        style={{ height: ITEM_HEIGHT + 16 }}
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-yellow-400/80 z-10 pointer-events-none" />
        <motion.div
          animate={controls}
          className="absolute top-2 left-0 flex"
          style={{ gap: `${GAP}px`, willChange: "transform" }}
        >
          {strip.map((id, idx) => {
            const p = prizeById.get(id);
            if (!p) return null;
            return (
              <PrizeTile key={`${id}-${idx}`} prize={p} />
            );
          })}
          {strip.length === 0
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={`ph-${i}`}
                  className="shrink-0 rounded bg-white/5 border border-white/10"
                  style={{ width: ITEM_WIDTH, height: ITEM_HEIGHT }}
                />
              ))
            : null}
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs opacity-70">
          Доступно спинов: <span className="font-semibold">{spins}</span>
        </div>
        <button
          onClick={spin}
          disabled={buttonDisabled}
          className="px-4 py-2 rounded bg-yellow-500 text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stage === "spinning"
            ? "Крутится..."
            : spins <= 0
            ? "Нет спинов"
            : "Крутить рулетку (−1 спин)"}
        </button>
      </div>

      {error ? <p className="text-xs text-red-400">Ошибка: {error}</p> : null}

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
      className="shrink-0 rounded overflow-hidden relative"
      style={{
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderBottom: `4px solid ${color}`,
        background: "rgba(255,255,255,0.05)",
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
        <div className="w-full h-full flex items-center justify-center text-xs opacity-70">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="relative bg-neutral-900 rounded-lg p-6 min-w-[280px] text-center"
        style={{ boxShadow: `0 0 40px ${color}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 rounded overflow-hidden"
          style={{
            width: 200,
            height: 150,
            background: "rgba(255,255,255,0.05)",
            borderBottom: `6px solid ${color}`,
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
        <div className="text-xs uppercase opacity-60 mb-1" style={{ color }}>
          {prize.rarity}
        </div>
        <div className="text-lg font-semibold mb-4">{prize.name}</div>
        <button
          onClick={onDismiss}
          className="px-4 py-2 rounded bg-white text-black text-sm font-semibold"
        >
          Продолжить
        </button>
      </motion.div>
    </motion.div>
  );
}
