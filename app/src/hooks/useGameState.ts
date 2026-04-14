"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState } from "@/lib/state";

const POLL_MS = 2000;

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as GameState;
      if (mountedRef.current) {
        setState(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchState();
    const id = setInterval(fetchState, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchState]);

  return { state, error, refresh: fetchState, setState };
}
