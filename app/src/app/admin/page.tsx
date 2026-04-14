"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import type { QuestStatus } from "@/lib/state";

const PW_KEY = "gacha.adminpw";

export default function AdminPage() {
  const { state, error, refresh } = useGameState();
  const [pw, setPw] = useState<string>("");
  const [saved, setSaved] = useState<boolean>(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  useEffect(() => {
    const existing = sessionStorage.getItem(PW_KEY);
    if (existing) {
      setPw(existing);
      setSaved(true);
    }
  }, []);

  function savePw() {
    sessionStorage.setItem(PW_KEY, pw);
    setSaved(true);
  }

  function clearPw() {
    sessionStorage.removeItem(PW_KEY);
    setPw("");
    setSaved(false);
  }

  async function setQuestStatus(questId: string, status: QuestStatus) {
    setBusyId(questId);
    setOpError(null);
    try {
      const res = await fetch("/api/admin/quest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pw,
        },
        body: JSON.stringify({ questId, status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      refresh();
    } catch (err) {
      setOpError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function reset() {
    if (!confirm("Сбросить всё состояние?")) return;
    setOpError(null);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "x-admin-password": pw },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      refresh();
    } catch (err) {
      setOpError((err as Error).message);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto space-y-6 font-mono">
      <h1 className="text-xl font-bold">Admin</h1>

      <section className="space-y-2">
        <label className="block text-sm opacity-70">Admin password</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm"
          />
          <button
            onClick={savePw}
            className="px-3 py-2 text-sm rounded bg-white text-black font-semibold"
          >
            Save
          </button>
          {saved ? (
            <button
              onClick={clearPw}
              className="px-3 py-2 text-sm rounded border border-white/20"
            >
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {error ? <p className="text-xs text-red-400">State error: {error}</p> : null}
      {opError ? <p className="text-xs text-red-400">Op error: {opError}</p> : null}

      {state ? (
        <>
          <section className="space-y-2">
            <h2 className="font-semibold">Quests</h2>
            <ul className="space-y-2">
              {state.quests.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center gap-3 p-2 border border-white/15 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{q.title}</div>
                    <div className="text-xs opacity-60">
                      {q.id} · status: {q.status}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(["locked", "active", "claimed"] as QuestStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuestStatus(q.id, s)}
                        disabled={busyId === q.id || q.status === s}
                        className={`px-2 py-1 text-xs rounded border ${
                          q.status === s
                            ? "bg-white text-black border-white"
                            : "border-white/30"
                        } disabled:opacity-40`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <button
              onClick={reset}
              className="px-3 py-2 text-sm rounded border border-red-400 text-red-400"
            >
              Reset state
            </button>
          </section>

          <section>
            <h2 className="font-semibold text-sm opacity-70">Raw</h2>
            <pre className="text-xs p-2 bg-black/40 rounded overflow-auto">
              {JSON.stringify(state, null, 2)}
            </pre>
          </section>
        </>
      ) : (
        <p className="text-sm opacity-60">Loading...</p>
      )}
    </main>
  );
}
