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

  return (
    <div className="w-full text-[#1b120a]">
      <h3
        className="mb-2"
        style={{
          fontFamily: "var(--font-script), cursive",
          fontSize: "clamp(14px, 1.8vw, 26px)",
          lineHeight: 1,
          color: "#2a1608",
        }}
      >
        Сундук
      </h3>

      {inventory.length === 0 ? (
        <div
          style={{
            fontSize: "clamp(11px, 1.1vw, 15px)",
            opacity: 0.5,
            fontStyle: "italic",
          }}
        >
          пусто...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5">
          {prizes.map((p) => {
            const count = counts.get(p.id) ?? 0;
            if (count === 0) return null;
            const color = RARITY_COLOR[p.rarity];
            return (
              <div
                key={p.id}
                className="relative rounded-sm overflow-hidden"
                style={{
                  aspectRatio: "4 / 3",
                  background: "rgba(58, 36, 16, 0.08)",
                  borderBottom: `3px solid ${color}`,
                  boxShadow: "inset 0 0 0 1px rgba(58, 36, 16, 0.25)",
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
                  <div
                    className="w-full h-full flex items-center justify-center text-center px-1"
                    style={{
                      fontSize: "clamp(8px, 0.7vw, 11px)",
                      color: "#3a2410",
                    }}
                  >
                    {p.name}
                  </div>
                )}
                {count > 1 ? (
                  <span
                    className="absolute top-0.5 right-0.5 px-1 rounded"
                    style={{
                      fontSize: "0.65em",
                      background: "rgba(27, 18, 10, 0.85)",
                      color: "#f5e6c8",
                    }}
                  >
                    ×{count}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
