"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { RARITY_COLOR, type Prize } from "@/lib/state";
import { buildShuffledSequence } from "@/lib/spin";

const ITEM_ASPECT = 140 / 105;
const GAP = 8;
const SPIN_DURATION = 6;

type Props = {
  prizes: Prize[];
  spins: number;
  inventory: string[];
  onAfterSpin?: () => void;
};

type Stage = "idle" | "spinning" | "revealed";

type SpinResponse = {
  prize: Prize;
  strip: string[];
  winnerIndex: number;
  error?: string;
};

function buildIdleStrip(prizes: Prize[], length = 24): string[] {
  const regularIds = prizes.filter((p) => !p.finalOnly).map((p) => p.id);
  const poolIds = regularIds.length > 0 ? regularIds : prizes.map((p) => p.id);
  return buildShuffledSequence(poolIds, length);
}

export function Reel({ prizes, spins, inventory, onAfterSpin }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const idleStrip = useMemo(() => buildIdleStrip(prizes), [prizes]);
  const [strip, setStrip] = useState<string[]>(idleStrip);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();

  const [tile, setTile] = useState({ w: 140, h: 105 });

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function measure() {
      const h = (el as HTMLDivElement).clientHeight;
      if (h > 0) {
        setTile({ h, w: Math.round(h * ITEM_ASPECT) });
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prizeById = useMemo(() => {
    const map = new Map<string, Prize>();
    for (const p of prizes) map.set(p.id, p);
    return map;
  }, [prizes]);

  const pitch = tile.w + GAP;

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
      const winnerCenter = data.winnerIndex * pitch + tile.w / 2;
      const jitter = (Math.random() - 0.5) * (tile.w - 20);
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
        className="relative w-full flex-1 min-h-0 overflow-hidden rounded-sm flex items-center"
        style={{
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
          className="flex items-center"
          style={{ gap: `${GAP}px`, willChange: "transform" }}
        >
          {strip.map((id, idx) => {
            const p = prizeById.get(id);
            if (!p) return null;
            const masked = !!p.finalOnly && !inventory.includes(p.id);
            return (
              <PrizeTile
                key={`${id}-${idx}`}
                prize={p}
                width={tile.w}
                height={tile.h}
                masked={masked}
              />
            );
          })}
        </motion.div>
      </div>

      <div className="relative flex items-center justify-center shrink-0" style={{ paddingLeft: "4%", paddingRight: "4%" }}>
        <div
          className="absolute"
          style={{
            left: "15%",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(11px, 1.25vw, 19px)",
            color: "#2a1608",
          }}
        >
          Осталось круток: <span style={{ fontWeight: 700 }}>{spins}</span>
        </div>
        <button
          onClick={spin}
          disabled={buttonDisabled}
          className="rounded-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:brightness-105"
          style={{
            background: "linear-gradient(#5a3418, #3e2712)",
            color: "#f5e6c8",
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(11px, 1.2vw, 18px)",
            padding: "0.3em 1em",
            border: "1px solid #2a1608",
            letterSpacing: "0.02em",
          }}
        >
          {stage === "spinning"
            ? "Крутится..."
            : spins <= 0
            ? "Нет круток"
            : "Крутить!"}
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

function PrizeTile({
  prize,
  width,
  height,
  masked,
}: {
  prize: Prize;
  width: number;
  height: number;
  masked?: boolean;
}) {
  const color = RARITY_COLOR[prize.rarity];
  return (
    <div
      className="shrink-0 rounded-sm overflow-hidden relative"
      style={{
        width,
        height,
        borderBottom: `3px solid ${color}`,
        background: "rgba(58, 36, 16, 0.12)",
        boxShadow: "inset 0 0 0 1px rgba(58, 36, 16, 0.3)",
      }}
    >
      {masked ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            fontFamily: "var(--font-script), cursive",
            fontSize: `${Math.round(height * 0.6)}px`,
            color: "#3a2410",
            fontWeight: 700,
          }}
        >
          ?
        </div>
      ) : prize.image ? (
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
