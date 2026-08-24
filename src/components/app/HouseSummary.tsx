import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { houseSummary, polyhouses } from "@/lib/mock-data";
import { Surface } from "@/components/app/ui-kit";
import { drift, useTick } from "@/hooks/use-live-telemetry";

const statTones = {
  leaf: "text-leaf",
  critical: "text-critical",
  muted: "text-muted-foreground",
  saffron: "text-saffron",
  teal: "text-teal",
  foreground: "text-foreground",
} as const;

function Stat({
  value,
  label,
  tone = "foreground",
}: {
  value: string;
  label: string;
  tone?: keyof typeof statTones;
}) {
  return (
    <div className="rounded-xl border border-border bg-cream/60 px-3 py-2.5">
      <p className={cn("text-[17px] font-semibold leading-none", statTones[tone])}>{value}</p>
      <p className="mt-1 truncate text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function HouseSummary({
  id,
  onSelect,
}: {
  id: string;
  onSelect: Dispatch<SetStateAction<string>>;
}) {
  const house = polyhouses.find((p) => p.id === id) ?? polyhouses[0]!;
  const base = houseSummary[id] ?? houseSummary[polyhouses[0]!.id]!;
  const tick = useTick(5000);
  const seed = id.charCodeAt(id.length - 1);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const s = {
    crop: {
      healthy: drift(base.crop.healthy, tick, seed + 1, { pct: 0.004 }),
      diseased: drift(base.crop.diseased, tick, seed + 2, { abs: 1 }),
      missing: base.crop.missing,
      stressed: drift(base.crop.stressed, tick, seed + 3, { abs: 3 }),
      suspected: drift(base.crop.suspected, tick, seed + 4, { abs: 2 }),
      fruits: drift(base.crop.fruits, tick, seed + 5, { pct: 0.003 }),
    },
    soil: {
      moisture: drift(base.soil.moisture, tick, seed + 6, { abs: 1.5 }),
      temp: drift(base.soil.temp, tick, seed + 7, { abs: 0.4, decimals: 1 }),
    },
    soilTrend:
      tick === 0
        ? base.soilTrend
        : [
            ...base.soilTrend.slice(1),
            {
              ...base.soilTrend[base.soilTrend.length - 1]!,
              moisture: drift(base.soil.moisture, tick, seed + 6, { abs: 1.5 }),
              temp: drift(base.soil.temp, tick, seed + 7, { abs: 0.4, decimals: 1 }),
            },
          ],
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Live summary for
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span>{house.name}</span>
              <ChevronDown className={cn("size-3 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
              <div className="absolute left-0 top-full z-30 mt-1 w-44 rounded-xl border border-border bg-popover p-1 shadow-[var(--shadow-lift)] animate-in fade-in-50 zoom-in-95">
                <div className="space-y-0.5">
                  {polyhouses.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelect(p.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                        p.id === id
                          ? "bg-sage-soft text-sage"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="p-4">
          <div className="mb-3">
            <h3 className="text-[15px] font-medium">Crop Summary</h3>
            <p className="text-[12px] text-muted-foreground">
              Latest AI inspection results · {house.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Stat value={s.crop.healthy.toLocaleString()} label="Healthy plants" tone="leaf" />
            <Stat value={String(s.crop.diseased)} label="Diseased" tone="critical" />
            <Stat value={String(s.crop.missing)} label="Missing" tone="muted" />
            <Stat value={String(s.crop.stressed)} label="Water stressed" />
            <Stat value={String(s.crop.suspected)} label="Suspected" />
            <Stat value={s.crop.fruits.toLocaleString()} label="Total fruits" tone="leaf" />
          </div>
        </Surface>

        <Surface className="p-4">
          <div className="mb-3">
            <h3 className="text-[15px] font-medium">Soil Summary</h3>
            <p className="text-[12px] text-muted-foreground">
              Rolling 24 hour sensor readings · {house.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Stat value={`${s.soil.moisture}%`} label="Moisture" tone="teal" />
            <Stat value={`${s.soil.temp}°C`} label="Temp" />
          </div>
          <div className="mt-3 h-[110px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.soilTrend} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gMoist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 6", "dataMax + 6"]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  name="Moisture %"
                  stroke="var(--teal)"
                  strokeWidth={2}
                  fill="url(#gMoist)"
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  name="Temp °C"
                  stroke="var(--saffron)"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>
    </div>
  );
}
