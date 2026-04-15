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
    <main
      className="min-h-screen p-8 max-w-4xl mx-auto space-y-8 font-mono"
      style={{ color: "#f5e6c8" }}
    >
      <h1 className="text-3xl font-bold">Admin</h1>

      <section className="space-y-3">
        <label className="block text-base font-semibold">Admin password</label>
        <div className="flex gap-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/15 border border-white/40 rounded text-base"
          />
          <button
            onClick={savePw}
            className="px-4 py-3 text-base rounded bg-white text-black font-semibold"
          >
            Save
          </button>
          {saved ? (
            <button
              onClick={clearPw}
              className="px-4 py-3 text-base rounded border border-white/40"
            >
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {error ? <p className="text-sm text-red-400">State error: {error}</p> : null}
      {opError ? <p className="text-sm text-red-400">Op error: {opError}</p> : null}

      {state ? (
        <>
          <section className="space-y-3">
            <h2 className="text-xl font-bold">Quests</h2>
            <ul className="space-y-3">
              {state.quests.map((q) => (
                <li
                  key={q.id}
                  className="flex items-center gap-4 p-4 border border-white/30 rounded bg-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold">{q.title}</div>
                    <div className="text-sm opacity-80 mt-1">
                      {q.id} · status: <span className="font-semibold">{q.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(["locked", "active", "claimed"] as QuestStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuestStatus(q.id, s)}
                        disabled={busyId === q.id || q.status === s}
                        className={`px-3 py-2 text-sm rounded border font-semibold ${
                          q.status === s
                            ? "bg-white text-black border-white"
                            : "border-white/50 hover:bg-white/10"
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
              className="px-4 py-3 text-base font-semibold rounded border-2 border-red-400 text-red-400 hover:bg-red-400/10"
            >
              Reset state
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold">Raw state</h2>
            <pre className="text-sm p-4 bg-black/60 border border-white/20 rounded overflow-auto">
              {JSON.stringify(state, null, 2)}
            </pre>
          </section>
        </>
      ) : (
        <p className="text-base">Loading...</p>
      )}
    </main>
  );
}
