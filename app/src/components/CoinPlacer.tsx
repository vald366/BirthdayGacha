"use client";

import { useEffect, useState, type MouseEvent } from "react";

type Point = { x: number; y: number };

export function CoinPlacer() {
  const [enabled, setEnabled] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    setEnabled(
      typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("coins") === "edit"
    );
  }, []);

  if (!enabled) return null;

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPoints((p) => [...p, { x, y }]);
  }

  function undo() {
    setPoints((p) => p.slice(0, -1));
  }

  function clear() {
    setPoints([]);
  }

  async function copy() {
    const text = points
      .map((p) => `  { x: ${p.x.toFixed(1)}, y: ${p.y.toFixed(1)} },`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <div
        className="absolute inset-0 z-40 cursor-crosshair"
        onClick={handleClick}
      >
        {points.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              width: "1.2rem",
              height: "1.2rem",
              borderRadius: "50%",
              background: "rgba(255, 80, 80, 0.85)",
              border: "2px solid #fff",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
              color: "#fff",
              fontSize: "0.65rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              fontWeight: 700,
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div
        className="absolute z-50 rounded"
        style={{
          top: 8,
          right: 8,
          background: "rgba(27, 18, 10, 0.9)",
          color: "#f5e6c8",
          padding: "8px 10px",
          fontSize: 12,
          maxWidth: 280,
          fontFamily: "monospace",
        }}
      >
        <div style={{ marginBottom: 6, fontWeight: 700 }}>
          Coin placer ({points.length})
        </div>
        <div className="flex gap-1 mb-2">
          <button
            onClick={undo}
            style={{ background: "#3e2712", padding: "2px 6px", borderRadius: 3 }}
          >
            undo
          </button>
          <button
            onClick={clear}
            style={{ background: "#3e2712", padding: "2px 6px", borderRadius: 3 }}
          >
            clear
          </button>
          <button
            onClick={copy}
            style={{ background: "#3e2712", padding: "2px 6px", borderRadius: 3 }}
          >
            copy
          </button>
        </div>
        <pre
          style={{
            maxHeight: 200,
            overflow: "auto",
            margin: 0,
            fontSize: 11,
            whiteSpace: "pre-wrap",
          }}
        >
          {points
            .map((p) => `  { x: ${p.x.toFixed(1)}, y: ${p.y.toFixed(1)} },`)
            .join("\n") || "(click on the map)"}
        </pre>
      </div>
    </>
  );
}
