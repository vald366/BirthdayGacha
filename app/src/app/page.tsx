"use client";

import { useGameState } from "@/hooks/useGameState";
import { QuestLog } from "@/components/QuestLog";
import { SpinCounter } from "@/components/SpinCounter";
import { Reel } from "@/components/Reel";
import { Inventory } from "@/components/Inventory";

export default function HomePage() {
  const { state, error, refresh } = useGameState();

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          С ДР, {state?.friendName ?? "[ИМЯ]"}!
        </h1>
        {state ? <SpinCounter spins={state.spins} /> : null}
      </header>

      <section className="aspect-[2/1] rounded border border-dashed border-white/20 flex items-center justify-center text-sm opacity-50">
        [ КАРТА ] — заглушка
      </section>

      {error ? (
        <p className="text-xs text-red-400">Ошибка соединения: {error}</p>
      ) : null}

      {state ? (
        <>
          <QuestLog state={state} onAfterClaim={refresh} />
          <Reel
            prizes={state.prizes}
            spins={state.spins}
            onAfterSpin={refresh}
          />
          <Inventory prizes={state.prizes} inventory={state.inventory} />
        </>
      ) : (
        <p className="text-sm opacity-60">Загрузка...</p>
      )}
    </main>
  );
}
