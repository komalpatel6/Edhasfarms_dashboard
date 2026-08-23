import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { CardTitle, MetricRow, PageHeader, Surface } from "@/components/app/ui-kit";
import { soilGrid, soilMetrics, soilTrend } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/soil-intelligence")({
  head: () => ({
    meta: [
      { title: "Soil Intelligence · BellPepper AI" },
      { name: "description", content: "Soil moisture, temperature, pH, EC and NPK trends with a row-level soil condition map." },
      { property: "og:title", content: "Soil Intelligence · BellPepper AI" },
      { property: "og:description", content: "Calm, health-style soil monitoring for your polyhouse." },
    ],
  }),
  component: SoilIntelligence,
});

const ranges = ["24 Hours", "7 Days", "30 Days", "Custom"] as const;

const chartTip = {
  contentStyle: {
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--popover)",
    fontSize: 12,
  },
};

const cellColor = {
  healthy: "bg-healthy/70",
  warning: "bg-warning/70",
  critical: "bg-critical/70",
};

export function SoilIntelligence() {
  const [range, setRange] = useState<(typeof ranges)[number]>("24 Hours");
  const [cell, setCell] = useState<{ row: string; index: number } | null>(null);

  return (
    <AppShell title="Soil Intelligence">
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Soil Intelligence</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">Live sensor readings and telemetry across Greenhouse 01.</p>
      </div>

      {/* Sleek, Compact & Fully Responsive Soil KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2.5 sm:gap-3 mb-5">
        {soilMetrics.map((m) => {
          const isHealthy = m.tone === "healthy";
          return (
            <div
              key={m.label}
              className={cn(
                "relative flex flex-col justify-between rounded-lg border px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-2xs transition-all hover:border-emerald-500/40 min-w-0",
                isHealthy
                  ? "bg-card border-border/60 hover:bg-emerald-500/5"
                  : "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
              )}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  {m.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold shrink-0",
                    isHealthy
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", isHealthy ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
                  {isHealthy ? "Optimal" : "Monitor"}
                </span>
              </div>

              <div className="mt-1.5">
                <p className="text-base sm:text-lg font-bold tracking-tight text-foreground">{m.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Range Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 pb-3.5 mb-5">
        <div className="inline-flex items-center rounded-lg border border-border/50 bg-muted/40 p-0.5">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all whitespace-nowrap",
                range === r
                  ? "bg-card text-foreground shadow-2xs border border-border/50 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface>
          <CardTitle right={<span className="text-[12px] text-muted-foreground">{range}</span>}>Moisture</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={soilTrend}>
              <defs>
                <linearGradient id="moistFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--sky)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--sky)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={34} />
              <Tooltip {...chartTip} />
              <Area type="monotone" dataKey="moisture" stroke="var(--sky)" strokeWidth={2} fill="url(#moistFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Surface>

        <Surface>
          <CardTitle right={<span className="text-[12px] text-muted-foreground">{range}</span>}>Temperature</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={soilTrend}>
              <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={34} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="temp" stroke="var(--peach)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Surface>

        <Surface>
          <CardTitle>pH</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={soilTrend}>
              <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis domain={[5.5, 7.5]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={34} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="ph" stroke="var(--sage)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Surface>

        <Surface>
          <CardTitle>EC &amp; NPK</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={soilTrend}>
              <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={34} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="ec" stroke="var(--butter)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-[13px]">
            {[
              { l: "N", v: 45 },
              { l: "P", v: 22 },
              { l: "K", v: 38 },
            ].map((n) => (
              <div key={n.l} className="rounded-lg bg-cream py-2">
                <p className="text-[11px] text-muted-foreground">{n.l}</p>
                <p className="mt-0.5 font-semibold text-sm">{n.v}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface>
        <CardTitle
          right={
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-healthy" /> Optimal</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> Watch</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-critical" /> Low</span>
            </div>
          }
        >
          Soil Map
        </CardTitle>
        <div className="space-y-2.5">
          {soilGrid.map((r) => (
            <div key={r.row} className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-[12px] text-muted-foreground">{r.row}</span>
              <div className="flex flex-1 flex-wrap gap-2">
                {r.cells.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCell({ row: r.row, index: i })}
                    className={cn("size-5 rounded-md transition-transform hover:scale-110", cellColor[c])}
                    aria-label={`${r.row} sample ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Surface>

      {cell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setCell(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] duration-200 animate-in zoom-in-95">
            <button onClick={() => setCell(null)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
              <X className="size-4" />
            </button>
            <h3 className="section-title">Soil Measurement</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {cell.row} · Position {(cell.index * 3.5 + 3.5).toFixed(1)}m
            </p>
            <div className="mt-4">
              <MetricRow label="Moisture" value="31%" />
              <MetricRow label="Temperature" value="25.1°C" />
              <MetricRow label="pH" value="5.9" />
              <MetricRow label="EC" value="2.1" />
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">13 Aug 2026 · 10:42 AM</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
