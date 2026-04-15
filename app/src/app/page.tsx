"use client";

import { useGameState } from "@/hooks/useGameState";
import { QuestLog } from "@/components/QuestLog";
import { Reel } from "@/components/Reel";
import { CoinPath } from "@/components/CoinPath";

export default function HomePage() {
  const { state, error, refresh } = useGameState();

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-2">
      <div
        className="relative w-full max-w-[1920px] max-h-[98vh] aspect-[2752/1536] bg-center bg-no-repeat bg-contain shadow-2xl rounded-sm"
        style={{ backgroundImage: "url(/bg.jfif)" }}
      >
        <CoinPath
          revealLast={
            !!state && state.inventory.length >= state.prizes.length
          }
        />

        {/* Photo pinned to top-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "4%",
            right: "3%",
            width: "14%",
            aspectRatio: "610 / 410",
            transform: "rotate(6deg)",
            transformOrigin: "center",
          }}
        >
          <img
            src="/Border.png"
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: "fill" }}
          />
          <div
            className="absolute inset-0"
            style={{
              padding: "11.5%",
            }}
          >
            <div
              className="w-full h-full overflow-hidden"
              style={{ borderRadius: "6%" }}
            >
              <img
                src="/photo1.png"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <h1
          className="absolute left-[18%] right-[18%] text-center whitespace-nowrap"
          style={{
            top: "8%",
            fontFamily: "var(--font-script), cursive",
            fontSize: "clamp(24px, 4.7vw, 88px)",
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
            bottom: "0",
            left: "0",
            width: "27%",
            aspectRatio: "1696 / 2528",
            backgroundImage: "url(/questbg.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            padding: "3% 4%",
          }}
        >
          {state ? (
            <QuestLog state={state} onAfterClaim={refresh} />
          ) : null}
        </div>

        {/* Reel panel */}
        <div
          className="absolute"
          style={{
            bottom: "3%",
            left: "31%",
            width: "66%",
            height: "32%",
            backgroundImage: "url(/roulettebg.png)",
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            padding: "3% 6%",
          }}
        >
          {state ? (
            <Reel
              prizes={state.prizes}
              spins={state.spins}
              inventory={state.inventory}
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
