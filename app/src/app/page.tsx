"use client";

import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { QuestLog } from "@/components/QuestLog";
import { Reel } from "@/components/Reel";
import { Inventory } from "@/components/Inventory";
import { CoinPath } from "@/components/CoinPath";
import { CoinPlacer } from "@/components/CoinPlacer";

type PanelView = "reel" | "inventory";

export default function HomePage() {
  const { state, error, refresh } = useGameState();
  const [view, setView] = useState<PanelView>("reel");

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-2">
      <div
        className="relative w-full max-w-[1920px] max-h-[98vh] aspect-[2752/1536] bg-center bg-no-repeat bg-contain shadow-2xl rounded-sm"
        style={{ backgroundImage: "url(/bg.jfif)" }}
      >
        <CoinPath />
        <CoinPlacer />

        <h1
          className="absolute left-[12%] right-[12%] text-center whitespace-nowrap"
          style={{
            top: "1.5%",
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(32px, 6.5vw, 120px)",
            lineHeight: 1,
            color: "#2a1608",
            letterSpacing: "0.02em",
            textShadow: "0 1px 0 rgba(245, 230, 200, 0.4)",
          }}
        >
          С днём рождения, Дарина!
        </h1>

        {/* Quest journal panel */}
        <div
          className="absolute"
          style={{
            top: "22%",
            left: "2%",
            width: "16%",
            aspectRatio: "1696 / 2528",
            backgroundImage: "url(/questbg.jfif)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            padding: "6% 7%",
          }}
        >
          {state ? (
            <QuestLog state={state} onAfterClaim={refresh} />
          ) : null}
        </div>

        {/* Reel / Inventory panel (toggleable) */}
        <div
          className="absolute"
          style={{
            bottom: "3%",
            left: "18%",
            width: "64%",
            height: "32%",
            backgroundImage: "url(/rouletebg.jfif)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            padding: "3% 6%",
          }}
        >
          {state ? (
            <div className="relative w-full h-full">
              <button
                type="button"
                onClick={() =>
                  setView((v) => (v === "reel" ? "inventory" : "reel"))
                }
                aria-label={
                  view === "reel"
                    ? "Показать сундук"
                    : "Показать рулетку"
                }
                title={
                  view === "reel" ? "Показать сундук" : "Показать рулетку"
                }
                className="absolute top-0 right-0 z-20 rounded-sm hover:brightness-110 transition-colors"
                style={{
                  background: "linear-gradient(#5a3418, #3e2712)",
                  color: "#f5e6c8",
                  border: "1px solid #2a1608",
                  padding: "0.25em 0.55em",
                  lineHeight: 1,
                  fontSize: "clamp(14px, 1.2vw, 20px)",
                }}
              >
                <svg
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 7h13M7 7l4-4M7 7l4 4" />
                  <path d="M17 17H4M17 17l-4-4M17 17l-4 4" />
                </svg>
              </button>
              {view === "reel" ? (
                <Reel
                  prizes={state.prizes}
                  spins={state.spins}
                  onAfterSpin={refresh}
                />
              ) : (
                <Inventory
                  prizes={state.prizes}
                  inventory={state.inventory}
                />
              )}
            </div>
          ) : null}
        </div>

        {!state ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              fontFamily: "var(--font-script), cursive",
              fontSize: "clamp(18px, 2vw, 32px)",
              color: "#3a2410",
            }}
          >
            Загрузка...
          </div>
        ) : null}

        {error ? (
          <p
            className="absolute top-2 right-2 text-xs"
            style={{ color: "#8b1e1e" }}
          >
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
