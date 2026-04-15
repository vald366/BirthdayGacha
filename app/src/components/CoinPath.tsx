"use client";

type Coin = { x: number; y: number };

// Placeholder waypoints — tweak these %s to line up with the map's path.
const COINS: Coin[] = [
  { x: 8, y: 32 },
  { x: 18, y: 26 },
  { x: 27, y: 34 },
  { x: 36, y: 30 },
  { x: 46, y: 36 },
  { x: 56, y: 30 },
  { x: 66, y: 34 },
  { x: 76, y: 28 },
  { x: 86, y: 34 },
];

const COIN_SIZE_PCT = 4;

export function CoinPath() {
  const pathD = COINS.map(
    (c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`
  ).join(" ");

  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke="#3a2410"
          strokeWidth="0.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1.2 1.4"
          opacity="0.75"
        />
      </svg>
      {COINS.map((c, i) => (
        <img
          key={i}
          src="/coin.png"
          alt=""
          className="absolute pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${COIN_SIZE_PCT}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
}
