"use client";

type Coin = { x: number; y: number; icon: string };

const COINS: Coin[] = [
  { x: 29.0, y: 59.2, icon: "/1.jfif" },
  { x: 41.9, y: 42.9, icon: "/2.jpg" },
  { x: 47.8, y: 52.9, icon: "/3.jfif" },
  { x: 64.6, y: 45.2, icon: "/4.png" },
  { x: 67.3, y: 62.6, icon: "/5.png" },
  { x: 86.2, y: 45.0, icon: "/6.jpg" },
  { x: 93.4, y: 60.3, icon: "/7.jfif" },
];

const ICON_INSET_PCT = 24;

const COIN_SIZE_PCT = 6;

type Props = {
  revealLast?: boolean;
};

export function CoinPath({ revealLast = false }: Props) {
  const pathD = COINS.map(
    (c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`
  ).join(" ");

  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke="#2a1608"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1.6 1.8"
          opacity="0.95"
        />
      </svg>
      {COINS.map((c, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-10 flex items-center justify-center"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${COIN_SIZE_PCT}%`,
            aspectRatio: "1 / 1",
            transform: "translate(-50%, -50%)",
          }}
        >
          <img
            src="/coin.png"
            alt=""
            className="absolute inset-0 w-full h-full"
          />
          <div
            className="absolute overflow-hidden flex items-center justify-center"
            style={{
              top: `${ICON_INSET_PCT}%`,
              left: `${ICON_INSET_PCT}%`,
              right: `${ICON_INSET_PCT}%`,
              bottom: `${ICON_INSET_PCT}%`,
              borderRadius: "50%",
            }}
          >
            {i === COINS.length - 1 && !revealLast ? (
              <span
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "clamp(14px, 2vw, 40px)",
                  fontWeight: 900,
                  color: "#2a1608",
                  lineHeight: 1,
                }}
              >
                ?
              </span>
            ) : (
              <img
                src={c.icon}
                alt=""
                className="w-full h-full object-cover"
                style={{ transform: "translate(-1px, 1px)" }}
              />
            )}
          </div>
          {i === 0 ? (
            <span
              className="absolute whitespace-nowrap"
              style={{
                top: "94%",
                left: "50%",
                transform: "translate(-50%, 0)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "clamp(12px, 1.2vw, 22px)",
                fontWeight: 800,
                color: "#f5e6c8",
                letterSpacing: "0.1em",
                WebkitTextStroke: "3px #2a1608",
                paintOrder: "stroke fill",
              }}
            >
              START
            </span>
          ) : null}
        </div>
      ))}
    </>
  );
}
