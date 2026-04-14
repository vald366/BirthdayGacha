"use client";

import { RARITY_COLOR, type Prize } from "@/lib/state";

type Props = {
  prizes: Prize[];
  inventory: string[];
};

export function Inventory({ prizes, inventory }: Props) {
  const counts = new Map<string, number>();
  for (const id of inventory) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  if (inventory.length === 0) {
    return (
      <div className="text-xs opacity-50 text-center py-4">
        Инвентарь пуст
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 opacity-80">Инвентарь</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {prizes.map((p) => {
          const count = counts.get(p.id) ?? 0;
          if (count === 0) return null;
          const color = RARITY_COLOR[p.rarity];
          return (
            <div
              key={p.id}
              className="relative rounded overflow-hidden bg-white/5"
              style={{
                aspectRatio: "4 / 3",
                borderBottom: `3px solid ${color}`,
              }}
              title={`${p.name} × ${count}`}
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] opacity-70 px-1 text-center">
                  {p.name}
                </div>
              )}
              {count > 1 ? (
                <span className="absolute top-1 right-1 text-[10px] bg-black/70 px-1.5 py-0.5 rounded">
                  ×{count}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
