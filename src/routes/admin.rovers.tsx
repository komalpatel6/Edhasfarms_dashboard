import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { fleet } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  Battery, 
  Wifi, 
  Activity, 
  RefreshCw, 
  Cpu, 
  Navigation
} from "lucide-react";

export const Route = createFileRoute("/admin/rovers")({
  head: () => ({
    meta: [
      { title: "Rover Management · BellPepper AI" },
      { name: "description", content: "Fleet overview with firmware, battery, sensors and assignment for every inspection rover." },
      { property: "og:title", content: "Rover Management · BellPepper AI" },
      { property: "og:description", content: "Manage your inspection rover fleet." },
    ],
  }),
  component: RoverManagement,
});

function StatusPill({ status, size = "md" }: { status: string; size?: "sm" | "md" | "lg" }) {
  const isOnline = status === "Online";
  const isOffline = status === "Offline";

  const styles = isOnline
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
    : isOffline
    ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";

  const dotColor = isOnline
    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
    : isOffline
    ? "bg-slate-400"
    : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";

  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs font-semibold";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full backdrop-blur-md transition-all shrink-0", styles, sizeClasses)}>
      <span className={cn("size-2 rounded-full shrink-0", dotColor, isOnline && "animate-pulse")} />
      {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, subtext, trend }: { icon: any; label: string; value: string; subtext?: string; trend?: string }) {
  return (
    <div className="relative flex items-center justify-between rounded-xl border border-border/60 bg-card px-3.5 py-3 shadow-2xs transition-all hover:border-emerald-500/40 hover:shadow-xs min-w-0">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">{label}</p>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
          <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight text-foreground truncate">{value}</span>
          {trend && <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">{trend}</span>}
        </div>
        {subtext && <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{subtext}</p>}
      </div>
      <div className="ml-2 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Icon className="size-3.5" />
      </div>
    </div>
  );
}

export function RoverManagement() {
  const [selected, setSelected] = useState(fleet[0]!.id);
  const [filter, setFilter] = useState<"all" | "Online" | "Offline" | "Charging">("all");
  const [activeTab, setActiveTab] = useState<"specs" | "telemetry" | "logs">("specs");

  const filteredFleet = fleet.filter((r) => filter === "all" || r.status === filter);
  const active = fleet.find((r) => r.id === selected) ?? fleet[0]!;

  const onlineCount = fleet.filter((r) => r.status === "Online").length;
  const avgBattery = Math.round(fleet.reduce((acc, r) => acc + r.battery, 0) / fleet.length);

  return (
    <AppShell title="Rovers">
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Rover Management</h1>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Firmware and polyhouse assignment.</p>
      </div>

      {/* Metric Quick Summary - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Bot} label="Total Fleet" value={`${fleet.length} Rovers`} subtext="All units assigned" />
        <StatCard icon={Activity} label="Rovers Status" value={`${onlineCount}/${fleet.length} Active`} trend="● 100% Coverage" />
        <StatCard icon={Battery} label="Avg Battery" value={`${avgBattery}%`} subtext="Optimal charge level" />
        <StatCard icon={Wifi} label="Telemetry Signal" value="Strong" subtext="LoRaWAN 915MHz" />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-6 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {(["all", "Online", "Offline", "Charging"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
                filter === st
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {st === "all" ? `All (${fleet.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Split View Content */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[340px_1fr] items-start">
        {/* Left Column: Rover Selector Cards */}
        <div className="space-y-3.5">
          {filteredFleet.map((r) => {
            const isSelected = r.id === selected;
            return (
              <div
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer",
                  isSelected
                    ? "border-emerald-500 bg-card shadow-md ring-1 ring-emerald-500/20"
                    : "border-border/60 bg-card/60 hover:border-emerald-500/40 hover:bg-card shadow-2xs"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl transition-all",
                      isSelected ? "bg-emerald-500 text-white shadow-sm" : "bg-muted text-muted-foreground group-hover:bg-emerald-500/10 group-hover:text-emerald-600"
                    )}>
                      <Bot className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm sm:text-base truncate">
                        {r.id}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.polyhouse}</p>
                    </div>
                  </div>
                  <StatusPill status={r.status} size="sm" />
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Battery className="size-3.5 text-emerald-500" /> {r.battery}%
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Navigation className="size-3.5 text-emerald-500" /> {r.distance}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Rover Details */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6 lg:p-7 shadow-xs min-w-0">
          {/* Detail Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Bot className="size-5 sm:size-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-foreground truncate">{active.id}</h2>
                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span>Serial: {active.serial}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Assigned to {active.polyhouse}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <StatusPill status={active.status} size="md" />
              <button
                onClick={() => alert(`Ping sent to ${active.id}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-accent"
              >
                <RefreshCw className="size-3.5" /> Ping Unit
              </button>
            </div>
          </div>

          {/* Inner Sub-tabs */}
          <div className="flex items-center gap-4 sm:gap-6 border-b border-border/40 overflow-x-auto my-4 text-xs font-semibold">
            {(["specs", "telemetry", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-2.5 capitalize transition-all border-b-2 shrink-0",
                  activeTab === tab
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab === "specs" ? "Specifications" : tab === "telemetry" ? "Live Telemetry" : "Diagnostics"}
              </button>
            ))}
          </div>

          {/* Tab 1: Specs */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3.5 sm:p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Cpu className="size-3.5 text-emerald-500" /> System Hardware
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Firmware Version</span>
                      <span className="font-semibold text-foreground">{active.firmware}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Serial Number</span>
                      <span className="font-mono text-xs font-semibold text-foreground truncate">{active.serial}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Assigned Location</span>
                      <span className="font-semibold text-foreground">{active.polyhouse}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-muted/30 p-3.5 sm:p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="size-3.5 text-emerald-500" /> Operational Metrics
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Runtime</span>
                      <span className="font-semibold text-foreground">{active.runtime}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Distance Covered</span>
                      <span className="font-semibold text-foreground">{active.distance}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Last Heartbeat</span>
                      <span className="font-semibold text-foreground">{active.heartbeat}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Battery Meter */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 sm:p-4 mt-4">
                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <Battery className="size-4 text-emerald-500" /> Battery Charge Status
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{active.battery}%</span>
                </div>
                <div className="h-2.5 sm:h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      active.battery > 50 ? "bg-emerald-500" : active.battery > 20 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${active.battery}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Telemetry */}
          {activeTab === "telemetry" && (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-b border-border/40">
                <span className="text-muted-foreground">GPS Coordinates</span>
                <span className="font-mono text-xs font-semibold text-foreground">{active.lat}, {active.lng}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-b border-border/40">
                <span className="text-muted-foreground">Communication Channel</span>
                <span className="font-semibold text-foreground">{active.status === "Offline" ? "Disconnected" : "LoRaWAN (Strong Signal)"}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-b border-border/40">
                <span className="text-muted-foreground">Sensor Diagnostics</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{active.sensors}</span>
              </div>
            </div>
          )}

          {/* Tab 3: Logs */}
          {activeTab === "logs" && (
            <div className="rounded-xl bg-slate-950 p-3.5 sm:p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
              <p className="text-slate-500">[SYSTEM READY] Rover telemetry online...</p>
              <p><span className="text-emerald-400">[INFO]</span> Heartbeat response received from {active.id} (10ms)</p>
              <p><span className="text-emerald-400">[OK]</span> Optical crop camera initialized successfully.</p>
              <p><span className="text-amber-400">[TELEMETRY]</span> Battery state reported at {active.battery}%. Range remaining ~12km.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
