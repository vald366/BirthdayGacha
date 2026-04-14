"use client";

import { useGameState } from "@/hooks/useGameState";
import { QuestLog } from "@/components/QuestLog";
import { Reel } from "@/components/Reel";
import { Inventory } from "@/components/Inventory";

export default function HomePage() {
  const { state, error, refresh } = useGameState();

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-[1400px] aspect-[590/340] bg-center bg-no-repeat bg-cover shadow-2xl rounded-sm"
        style={{ backgroundImage: "url(/background.jpg)" }}
      >
        {/* Left parchment scroll — Quest journal */}
        <div
          className="absolute overflow-auto"
          style={{
            top: "23%",
            left: "3.5%",
            width: "27%",
            height: "34%",
            padding: "1.2% 1.8%",
          }}
        >
          {state ? (
            <QuestLog state={state} onAfterClaim={refresh} />
          ) : null}
        </div>

        {/* Right parchment scroll — Inventory */}
        <div
          className="absolute overflow-auto"
          style={{
            top: "23%",
            right: "3.5%",
            width: "27%",
            height: "34%",
            padding: "1.2% 1.8%",
          }}
        >
          {state ? (
            <Inventory prizes={state.prizes} inventory={state.inventory} />
          ) : null}
        </div>

        {/* Bottom parchment strip — Reel */}
        <div
          className="absolute"
          style={{
            bottom: "5%",
            left: "4%",
            width: "92%",
            height: "32%",
            padding: "0.8% 1%",
          }}
        >
          {state ? (
            <Reel
              prizes={state.prizes}
              spins={state.spins}
              onAfterSpin={refresh}
            />
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
