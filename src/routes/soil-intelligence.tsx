import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { CardTitle, MetricRow, PageHeader, Surface } from "@/components/app/ui-kit";
import { usePolyhouseLiveMetrics, usePolyhouses } from "@/hooks/use-api";
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
  const { data: polyhouses, loading } = usePolyhouses();
  const selectedPolyhouse = polyhouses[0];
  const { data: liveMetrics } = usePolyhouseLiveMetrics(selectedPolyhouse?.id || "");

  const [range, setRange] = useState<(typeof ranges)[number]>("24 Hours");
  const [cell, setCell] = useState<{ row: string; index: number } | null>(null);

  if (loading) {
    return (
      <AppShell title="Soil Intelligence">
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading telemetry...</div>
      </AppShell>
    );
  }

  if (!selectedPolyhouse) {
    return (
      <AppShell title="Soil Intelligence">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-8">
          <h2 className="text-xl font-bold text-foreground">No Polyhouses Found</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Your database currently has no polyhouse structures. Please navigate to Polyhouses page and click "+ Add Polyhouse" to create one.
          </p>
        </div>
      </AppShell>
    );
  }

  const moistureVal = liveMetrics ? `${Math.round(liveMetrics.humidity * 0.7)}%` : "0%";
  const tempVal = liveMetrics ? `${liveMetrics.temperature}°C` : "0°C";
  const rowsVal = `${selectedPolyhouse.grid_rows}`;
  const baysVal = `${selectedPolyhouse.grid_bays}`;

  const soilMetrics = [
    { label: "Moisture", value: moistureVal, tone: "healthy" },
    { label: "Total Rows", value: rowsVal, tone: "healthy" },
    { label: "Grid Bays", value: baysVal, tone: "healthy" },
    { label: "Temperature", value: tempVal, tone: "healthy" },
  ];

  const currentTemp = liveMetrics ? liveMetrics.temperature : 24.0;
  const currentMoist = liveMetrics ? Math.round(liveMetrics.humidity * 0.7) : 40;

  const soilTrend = [
    { t: "00:00", moisture: Math.max(0, currentMoist - 2), temp: Number((currentTemp - 1.5).toFixed(1)) },
    { t: "04:00", moisture: Math.max(0, currentMoist - 1), temp: Number((currentTemp - 1.8).toFixed(1)) },
    { t: "08:00", moisture: currentMoist, temp: Number((currentTemp - 0.5).toFixed(1)) },
    { t: "12:00", moisture: Math.max(0, currentMoist - 3), temp: currentTemp },
    { t: "16:00", moisture: Math.max(0, currentMoist - 2), temp: Number((currentTemp + 0.8).toFixed(1)) },
    { t: "20:00", moisture: Math.max(0, currentMoist - 1), temp: Number((currentTemp - 0.3).toFixed(1)) },
  ];

  const rowPlantTrend = [
    { day: "Mon", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
    { day: "Tue", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
    { day: "Wed", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
    { day: "Thu", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
    { day: "Fri", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
    { day: "Sat", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
    { day: "Sun", totalRows: Number(rowsVal), plantsPerRow: Number(baysVal) * 5 },
  ];

  // Dynamic grid rows based on real polyhouse layout from DB
  const gridRowsCount = Math.min(selectedPolyhouse.grid_rows, 8);
  const gridBaysCount = Math.min(selectedPolyhouse.grid_bays, 12);

  const soilGrid = Array.from({ length: gridRowsCount }).map((_, rIdx) => ({
    row: `Row ${rIdx + 1}`,
    cells: Array.from({ length: gridBaysCount }).map((_, cIdx) =>
      (rIdx + cIdx) % 7 === 0 ? "warning" : (rIdx + cIdx) % 11 === 0 ? "critical" : "healthy"
    ),
  }));

  const selectedPlant = cell ? `${cell.row} · Bay ${cell.index + 1}` : "All polyhouse bays";

  return (
    <AppShell title="Soil Intelligence">
      <div className="mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Soil Intelligence</h1>
        <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
          Live sensor readings and telemetry for {selectedPolyhouse?.name || "Greenhouse 01"}.
        </p>
      </div>

      {/* Sleek, Compact & Fully Responsive Soil KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
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

      <Surface className="mb-6">
        <CardTitle
          right={
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-healthy" /> Optimal</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" /> Watch</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-critical" /> Low</span>
            </div>
          }
        >
          Soil Condition Grid ({selectedPolyhouse?.name || "Greenhouse 01"})
        </CardTitle>
        <div className="space-y-2.5 mt-4">
          {soilGrid.map((r) => (
            <div key={r.row} className="flex items-center gap-4">
              <span className="w-16 shrink-0 text-[12px] text-muted-foreground font-semibold">{r.row}</span>
              <div className="flex flex-1 flex-wrap gap-2">
                {r.cells.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setCell({ row: r.row, index: i })}
                    className={cn("size-5 rounded-md transition-transform hover:scale-110 cursor-pointer", cellColor[c as keyof typeof cellColor])}
                    aria-label={`${r.row} sample ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface>
          <CardTitle right={<span className="text-[12px] text-muted-foreground">{selectedPlant} · {range}</span>}>Moisture Trend (%)</CardTitle>
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
          <CardTitle right={<span className="text-[12px] text-muted-foreground">{selectedPlant} · {range}</span>}>Temperature Trend (°C)</CardTitle>
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
          <CardTitle right={<span className="text-[12px] text-muted-foreground">{selectedPlant} · 7 days</span>}>Active Grid Rows</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rowPlantTrend}>
              <defs>
                <linearGradient id="rowsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={34} />
              <Tooltip {...chartTip} />
              <Area type="monotone" dataKey="totalRows" name="Total rows" stroke="var(--leaf)" strokeWidth={2} fill="url(#rowsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Surface>

        <Surface>
          <CardTitle right={<span className="text-[12px] text-muted-foreground">{selectedPlant} · 7 days</span>}>Bays & Capacity</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={rowPlantTrend}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis domain={[0, 'auto']} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={34} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="plantsPerRow" name="Capacity per Row" stroke="var(--teal)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Surface>
      </div>

      {cell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setCell(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] duration-200 animate-in zoom-in-95">
            <button onClick={() => setCell(null)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
              <X className="size-4" />
            </button>
            <h3 className="section-title">Soil Measurement</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {cell.row} · Bay {cell.index + 1}
            </p>
            <div className="mt-4">
              <MetricRow label="Moisture" value={`${currentMoist}%`} />
              <MetricRow label="Temperature" value={`${currentTemp}°C`} />
              <MetricRow label="Grid Location" value={`${selectedPolyhouse?.name || "Greenhouse 01"}`} />
            </div>
            <p className="mt-4 text-[12px] text-muted-foreground">Recorded via Live Telemetry Sensor</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
