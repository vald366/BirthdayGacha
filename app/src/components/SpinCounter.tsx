"use client";

type Props = { spins: number };

export function SpinCounter({ spins }: Props) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/20 text-sm">
      <span className="opacity-70">Доступно спинов:</span>
      <span className="font-semibold">{spins}</span>
    </div>
  );
}
