import { useEffect, useState } from "react";

/** Ticks every `ms` once mounted (client only, SSR-safe). */
export function useTick(ms = 5000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
  return tick;
}

/** Deterministic pseudo-random drift in [-1, 1] for a given seed + tick. */
function noise(seed: number, tick: number) {
  const x = Math.sin(seed * 12.9898 + tick * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** Drift a base value by up to `pct` of itself (or `abs` units when given). */
export function drift(
  base: number,
  tick: number,
  seed: number,
  { pct = 0.01, abs, decimals = 0 }: { pct?: number; abs?: number; decimals?: number } = {},
) {
  if (tick === 0) return base;
  const amount = abs ?? Math.max(1, Math.abs(base) * pct);
  const next = base + noise(seed, tick) * amount;
  const f = 10 ** decimals;
  return Math.round(next * f) / f;
}
