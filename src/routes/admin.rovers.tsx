import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Bot,
  Battery,
  Wifi,
  Activity,
  RefreshCw,
  Cpu,
  Navigation,
  Plus,
  X,
  Zap,
  Radio,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  Home,
  AlertOctagon,
  Eye,
  Thermometer,
  Droplet,
  Sun,
  Wind,
  Compass,
  Gauge,
  Layers,
  Terminal
} from "lucide-react";
import { useRovers, usePolyhouses, useDiscoveredRovers, useRoverLiveTelemetry, DiscoveredRover } from "@/hooks/use-api";

export const Route = createFileRoute("/admin/rovers")({
  head: () => ({
    meta: [
      { title: "Rover Management · BellPepper AI" },
      { name: "description", content: "Fleet overview with firmware, battery, sensors and assignment for every inspection rover." },
      { property: "og:title", content: "Rover Management · BellPepper AI" },
      { property: "og:description", content: "Manage your inspection Rover." },
    ],
  }),
  component: RoverManagement,
});

function StatusPill({ status, size = "md" }: { status: string; size?: "sm" | "md" | "lg" }) {
  const isOnline = status === "Scanning" || status === "Idle";
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
  const { data: fleet, loading, refetch } = useRovers();
  const { data: polyhouses } = usePolyhouses();
  const { data: discoveredRovers, refetch: refetchDiscovered } = useDiscoveredRovers();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "Idle" | "Scanning" | "Charging" | "Offline" | "Maintenance">("all");
  const [activeTab, setActiveTab] = useState<"specs" | "telemetry" | "diagnostics">("specs");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [quickPolyhouse, setQuickPolyhouse] = useState<string>("");
  const [controlBusy, setControlBusy] = useState(false);

  const selected = selectedId || (fleet[0]?.id ?? "");
  const filteredFleet = fleet.filter((r) => filter === "all" || r.status === filter);
  const active = fleet.find((r) => r.id === selected);

  // Real-time live telemetry stream hook
  const { data: telemetry, refetch: refetchTelemetry } = useRoverLiveTelemetry(active?.id || null);

  const [roverForm, setRoverForm] = useState({
    id: "",
    name: "",
    polyhouse_id: "",
    inspection_interval_hours: 4,
    inspection_duration_mins: 30,
    scan_speed_m_s: 0.5,
  });

  const handleCreateRover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roverForm.name) return;
    setSubmitting(true);
    try {
      await apiRequest("/rovers/", {
        method: "POST",
        body: JSON.stringify({
          ...roverForm,
          polyhouse_id: roverForm.polyhouse_id || (polyhouses[0]?.name || "Unassigned"),
        }),
      });
      setShowModal(false);
      setRoverForm({ id: "", name: "", polyhouse_id: "", inspection_interval_hours: 4, inspection_duration_mins: 30, scan_speed_m_s: 0.5 });
      refetch();
      refetchDiscovered();
    } catch (err: any) {
      alert(err.message || "Failed to create rover");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDeployDiscovered = async (rover: DiscoveredRover, polyhouseName: string) => {
    setSubmitting(true);
    try {
      await apiRequest("/rovers/", {
        method: "POST",
        body: JSON.stringify({
          id: rover.id,
          name: rover.name,
          polyhouse_id: polyhouseName || (polyhouses[0]?.name || "Unassigned"),
          status: rover.status,
          battery_level: rover.battery_level,
          scan_speed_m_s: rover.scan_speed_m_s,
          inspection_interval_hours: rover.inspection_interval_hours,
          inspection_duration_mins: rover.inspection_duration_mins,
        }),
      });
      refetch();
      refetchDiscovered();
    } catch (err: any) {
      alert(err.message || "Failed to deploy discovered rover");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignRover = async (roverId: string, polyhouseName: string) => {
    setAssigningId(roverId);
    try {
      await apiRequest(`/rovers/${roverId}/config`, {
        method: "PUT",
        body: JSON.stringify({ polyhouse_id: polyhouseName }),
      });
      refetch();
      refetchDiscovered();
    } catch (err: any) {
      alert(err.message || "Failed to assign rover");
    } finally {
      setAssigningId(null);
    }
  };

  const handleControlCommand = async (action: string) => {
    if (!active) return;
    setControlBusy(true);
    try {
      await apiRequest(`/rovers/${active.id}/control/${action}`, { method: "POST" });
      refetchTelemetry();
      refetch();
    } catch (err: any) {
      alert(`Command '${action}' failed: ${err.message}`);
    } finally {
      setControlBusy(false);
    }
  };

  const autoFillFromDiscovered = (rover: DiscoveredRover) => {
    setRoverForm({
      id: rover.id,
      name: rover.name,
      polyhouse_id: roverForm.polyhouse_id || (polyhouses[0]?.name || "Unassigned"),
      inspection_interval_hours: rover.inspection_interval_hours || 4,
      inspection_duration_mins: rover.inspection_duration_mins || 30,
      scan_speed_m_s: rover.scan_speed_m_s || 0.5,
    });
  };

  if (loading) {
    return (
      <AppShell title="Rovers">
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading fleet rovers...</div>
      </AppShell>
    );
  }

  const onlineCount = fleet.filter((r) => r.status === "Scanning" || r.status === "Idle" || r.status === "Charging").length;
  const activeLiveBattery = telemetry?.battery?.percentage != null ? Math.round(telemetry.battery.percentage) : (active?.battery_level ?? 0);
  const activeLiveStatus = telemetry?.is_online ? (telemetry.state || telemetry?.rover?.status || active?.status || "Idle") : (active?.status || "Offline");
  const avgBattery = fleet.length > 0 
    ? Math.round(fleet.reduce((acc, r) => acc + (r.id === active?.id ? activeLiveBattery : r.battery_level), 0) / fleet.length) 
    : 0;
  const activeCoveragePct = fleet.length > 0 ? Math.round((onlineCount / fleet.length) * 100) : 0;
  
  // Only show live discovery for rovers that are NOT yet assigned to a polyhouse in the fleet
  const unassignedDiscovered = discoveredRovers.filter((disc) => {
    const existing = fleet.find((r) => r.id === disc.id || r.name === disc.name);
    if (!existing) return true;
    if (!existing.polyhouse_id || existing.polyhouse_id === "Unassigned" || existing.polyhouse_id === "None") return true;
    return false;
  });
  const firstUnassignedDiscovered = unassignedDiscovered.length > 0 ? unassignedDiscovered[0] : null;

  return (
    <AppShell title="Rovers">
      {/* Header */}
      <div className="mb-5 sm:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Rover Management</h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Deploy and assign AgriRover units to your Supabase polyhouses.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (firstUnassignedDiscovered && !roverForm.name) {
                autoFillFromDiscovered(firstUnassignedDiscovered);
              }
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="size-4" /> Add Rover Unit
          </button>
        </div>
      </div>

      {/* Discovered Live Rovers Banner (Only if an unassigned simulator/hardware is detected) */}
      {firstUnassignedDiscovered && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-emerald-500/5 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Radio className="size-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Live Rover Detected on Network</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online (Port 8088)
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {firstUnassignedDiscovered.name} ({firstUnassignedDiscovered.id}) is broadcasting live telemetry · Battery {firstUnassignedDiscovered.battery_level}% · Speed {firstUnassignedDiscovered.scan_speed_m_s} m/s
                </p>
              </div>
            </div>

            {/* Quick Assign Action */}
            <div className="flex flex-wrap items-center gap-2 sm:self-center">
              <select
                value={quickPolyhouse || (polyhouses[0]?.name || "")}
                onChange={(e) => setQuickPolyhouse(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- Select Polyhouse --</option>
                {polyhouses.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} {p.location ? `(${p.location})` : ""}</option>
                ))}
                <option value="Unassigned">Unassigned (Standby)</option>
              </select>

              <button
                onClick={() => firstUnassignedDiscovered && handleQuickDeployDiscovered(firstUnassignedDiscovered, quickPolyhouse || (polyhouses[0]?.name || "Unassigned"))}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Zap className="size-3.5" />
                {submitting ? "Linking..." : "1-Click Quick Deploy & Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-foreground">Deploy New AgriRover Unit</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            {/* Live Discovered Section inside Modal */}
            {unassignedDiscovered.length > 0 && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    Live Detected Rover on Local Network
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    1-Click Ready
                  </span>
                </div>

                {unassignedDiscovered.map((disc) => (
                  <div
                    key={disc.id}
                    onClick={() => autoFillFromDiscovered(disc)}
                    className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-card border border-border hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Bot className="size-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-foreground truncate">{disc.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">({disc.id})</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Battery: {disc.battery_level}% · Speed: {disc.scan_speed_m_s} m/s · Status: {disc.status}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white group-hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <Zap className="size-3" /> Auto-Fill
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateRover} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Rover Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. AgriRover Alpha"
                    value={roverForm.name}
                    onChange={(e) => setRoverForm({ ...roverForm, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Unit ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. RVR-SIM-01"
                    value={roverForm.id}
                    onChange={(e) => setRoverForm({ ...roverForm, id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Assign to Polyhouse</label>
                <select
                  value={roverForm.polyhouse_id}
                  onChange={(e) => setRoverForm({ ...roverForm, polyhouse_id: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Select Registered Polyhouse --</option>
                  {polyhouses.map((p) => (
                    <option key={p.id} value={p.name}>{p.name} {p.location ? `(${p.location})` : ""}</option>
                  ))}
                  <option value="Unassigned">Unassigned (Standby)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Interval (hrs)</label>
                  <input
                    type="number"
                    value={roverForm.inspection_interval_hours}
                    onChange={(e) => setRoverForm({ ...roverForm, inspection_interval_hours: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Speed (m/s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roverForm.scan_speed_m_s}
                    onChange={(e) => setRoverForm({ ...roverForm, scan_speed_m_s: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="size-4" />
                  {submitting ? "Deploying..." : "Deploy to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metric Quick Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Bot} label="Total Fleet" value={`${fleet.length} Rovers`} subtext="All registered units" />
        <StatCard 
          icon={Activity} 
          label="Rovers Status" 
          value={`${onlineCount}/${fleet.length} Active`} 
          trend={`● ${activeCoveragePct}% Coverage`} 
        />
        <StatCard 
          icon={Battery} 
          label="Avg Battery" 
          value={`${avgBattery}%`} 
          subtext={avgBattery >= 70 ? "Optimal charge level" : avgBattery >= 30 ? "Moderate charge" : "Low charge - docking advised"} 
        />
        <StatCard
          icon={Wifi}
          label="Telemetry Signal"
          value={onlineCount > 0 ? "Strong" : "Offline"}
          trend={onlineCount > 0 ? "● 20Hz Sync" : "No Signal"}
          subtext={onlineCount > 0 ? "LoRaWAN 915MHz · 20Hz Sync" : "Check Simulator"}
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-6 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {(["all", "Idle", "Scanning", "Charging", "Offline", "Maintenance"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer",
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

      {/* Split View Content */}
      {fleet.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-4 bg-card/40">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3">
            <Bot className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Rovers Deployed Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            There are currently zero AgriRover units registered in your Supabase database.
          </p>

          {firstUnassignedDiscovered ? (
            <div className="mt-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 max-w-md w-full text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-emerald-500" /> Discovered Live Rover
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Port 8088</span>
              </div>
              <div className="text-xs text-foreground font-semibold">
                {firstUnassignedDiscovered.name} ({firstUnassignedDiscovered.id})
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={quickPolyhouse || (polyhouses[0]?.name || "")}
                  onChange={(e) => setQuickPolyhouse(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none flex-1 cursor-pointer"
                >
                  <option value="">-- Assign Polyhouse --</option>
                  {polyhouses.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Unassigned">Unassigned (Standby)</option>
                </select>
                <button
                  onClick={() => handleQuickDeployDiscovered(firstUnassignedDiscovered, quickPolyhouse || (polyhouses[0]?.name || "Unassigned"))}
                  disabled={submitting}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer"
                >
                  {submitting ? "Deploying..." : "⚡ Quick Deploy"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 cursor-pointer"
            >
              <Plus className="size-4" /> Add Rover Unit
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[340px_1fr] items-start">
          {/* Left Column: Rover Selector Cards */}
          <div className="space-y-3.5">
            {filteredFleet.map((r) => {
              const isSelected = r.id === selected;
              const isItemActive = isSelected && telemetry?.is_online;
              const itemStatus = isItemActive ? activeLiveStatus : r.status;
              const itemBattery = isItemActive ? activeLiveBattery : r.battery_level;
              const isItemMoving = (itemStatus === "Scanning" || itemStatus === "ReturnToBase") || (telemetry?.pose?.linear_velocity_m_s != null && Math.abs(telemetry.pose.linear_velocity_m_s) > 0.01);
              const itemSpeed = isItemActive
                ? (isItemMoving ? `${Math.abs(telemetry?.pose?.linear_velocity_m_s ?? r.scan_speed_m_s).toFixed(1)} m/s` : "0.0 m/s")
                : (r.status === "Scanning" ? `${r.scan_speed_m_s} m/s` : "0.0 m/s");

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
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
                          {r.name || r.id}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.polyhouse_id || "Unassigned"}</p>
                      </div>
                    </div>
                    <StatusPill status={itemStatus} size="sm" />
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Battery className="size-3.5 text-emerald-500" /> {itemBattery}%
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Navigation className="size-3.5 text-emerald-500" /> {itemSpeed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Rover Details */}
          {active && (
            <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-6 lg:p-7 shadow-xs min-w-0 space-y-5">
              {/* Detail Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Bot className="size-5 sm:size-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-extrabold text-foreground truncate">{active.name || active.id}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-mono">ID: {active.id}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <select
                        disabled={assigningId === active.id}
                        value={active.polyhouse_id || ""}
                        onChange={(e) => handleAssignRover(active.id, e.target.value)}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="">-- Assign Polyhouse --</option>
                        {polyhouses.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                        <option value="Unassigned">Unassigned</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <StatusPill status={activeLiveStatus} size="md" />
                </div>
              </div>

              {/* Sub-tabs Header */}
              <div className="flex items-center gap-4 sm:gap-6 border-b border-border/40 overflow-x-auto text-xs font-semibold">
                {(["specs", "telemetry", "diagnostics"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "pb-2.5 capitalize transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-1.5",
                      activeTab === tab
                        ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "specs" && <Cpu className="size-3.5" />}
                    {tab === "telemetry" && <Activity className="size-3.5" />}
                    {tab === "diagnostics" && <Terminal className="size-3.5" />}
                    {tab === "specs" ? "Specifications" : tab === "telemetry" ? "Live Telemetry" : "Diagnostics"}
                  </button>
                ))}
              </div>

              {/* TAB 1: SPECIFICATIONS */}
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
                          <span className="font-semibold text-foreground">{telemetry?.rover?.firmware || "v2.5.0-SIM"}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Unit ID</span>
                          <span className="font-mono text-xs font-semibold text-foreground truncate">{active.id}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Assigned Location</span>
                          <span className="font-semibold text-foreground">{active.polyhouse_id || "Unassigned"}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Live Heading</span>
                          <span className="font-semibold text-foreground font-mono">{telemetry?.pose?.theta_deg?.toFixed(1) ?? "0.0"}°</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-muted/30 p-3.5 sm:p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Activity className="size-3.5 text-emerald-500" /> Operational Metrics
                      </h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Inspection Interval</span>
                          <span className="font-semibold text-foreground">{active.inspection_interval_hours} hrs</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Scan Speed</span>
                          <span className="font-semibold text-foreground">{telemetry?.navigation?.scan_speed_m_s ?? active.scan_speed_m_s} m/s</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Live Position</span>
                          <span className="font-semibold text-foreground font-mono">
                            {telemetry?.pose?.x != null 
                              ? `Row ${telemetry?.navigation?.current_row ?? 1}, Bay ${telemetry?.navigation?.current_bay ?? 1} (X: ${telemetry.pose.x.toFixed(1)}m, Y: ${telemetry.pose.y.toFixed(1)}m)` 
                              : "X: 2.0m, Y: 2.0m"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-muted-foreground">Last Heartbeat</span>
                          <span className="font-semibold text-foreground font-mono">
                            {active.last_ping ? new Date(active.last_ping).toLocaleTimeString() : "Just now"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Battery Meter */}
                  <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 sm:p-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                      <span className="font-medium text-foreground flex items-center gap-2">
                        <Battery className="size-4 text-emerald-500" /> Battery Charge Status
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {telemetry?.battery?.voltage_v ? `${telemetry.battery.voltage_v.toFixed(1)}V` : "24.0V"} · {telemetry?.battery?.is_charging ? `+${(telemetry.battery.charging_current_a || 2.5).toFixed(2)}A` : `-${(telemetry?.battery?.current_draw_a || telemetry?.battery?.discharge_current_a || 0.45).toFixed(2)}A`}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeLiveBattery}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 sm:h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          activeLiveBattery > 40 ? "bg-emerald-500" : activeLiveBattery > 20 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${Math.min(100, Math.max(0, activeLiveBattery))}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIVE REAL-TIME TELEMETRY */}
              {activeTab === "telemetry" && (
                <div className="space-y-4">
                  {/* Mission Control Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-border/60 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">Mission Control:</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        {activeLiveStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleControlCommand("start")}
                        disabled={controlBusy}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Play className="size-3" /> Start Scan
                      </button>
                      <button
                        onClick={() => handleControlCommand("pause")}
                        disabled={controlBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Pause className="size-3" /> Pause
                      </button>
                      <button
                        onClick={() => handleControlCommand("dock")}
                        disabled={controlBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Home className="size-3" /> Return to Dock
                      </button>
                    </div>
                  </div>

                  {/* Live Camera Frame (if available) */}
                  {telemetry?.camera_frame ? (
                    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-black aspect-video max-h-56 flex items-center justify-center">
                      <img
                        src={telemetry.camera_frame}
                        alt="Live Rover Camera"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur-xs">
                        <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                        LIVE CAMERA · AI VISION ACTIVE · 10 FPS
                      </div>
                    </div>
                  ) : null}

                  {/* Real-time Environmental Sensors Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Thermometer className="size-3.5 text-emerald-500" /> Live Environment Telemetry
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Thermometer className="size-3 text-red-500" /> Temperature
                        </span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.environment?.temperature_c != null ? `${telemetry.environment.temperature_c.toFixed(1)}°C` : "26.5°C"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Droplet className="size-3 text-blue-500" /> Humidity
                        </span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.environment?.humidity_pct != null ? `${telemetry.environment.humidity_pct.toFixed(1)}%` : "68.0%"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Wind className="size-3 text-emerald-500" /> CO₂ Level
                        </span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.environment?.co2_ppm != null ? `${telemetry.environment.co2_ppm} ppm` : "750 ppm"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <Sun className="size-3 text-amber-500" /> Light Intensity
                        </span>
                        <p className="text-base font-extrabold text-foreground mt-0.5 truncate">
                          {telemetry?.environment?.light_intensity_lux != null ? `${telemetry.environment.light_intensity_lux.toLocaleString()} lux` : "36,000 lux"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Soil Sensors Grid */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Layers className="size-3.5 text-emerald-500" /> Live Soil Intelligence Metrics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Soil Moisture</span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.soil?.moisture_pct != null ? `${telemetry.soil.moisture_pct.toFixed(1)}%` : "54.0%"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Soil Temp</span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.soil?.temperature_c != null ? `${telemetry.soil.temperature_c.toFixed(1)}°C` : "21.5°C"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">EC (Salinity)</span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.soil?.ec_ds_m != null ? `${telemetry.soil.ec_ds_m.toFixed(2)} dS/m` : "1.85 dS/m"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/40 bg-card">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Soil pH</span>
                        <p className="text-base font-extrabold text-foreground mt-0.5">
                          {telemetry?.soil?.ph != null ? `${telemetry.soil.ph.toFixed(2)}` : "6.20"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DIAGNOSTICS & REAL LOGS */}
              {activeTab === "diagnostics" && (
                <div className="space-y-4">
                  {/* Subsystems Health */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-emerald-500" /> Subsystem Diagnostics
                      </h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Kinematic Drive</span>
                          <span className={cn("font-semibold", telemetry?.is_online ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                            {telemetry?.is_online ? "Nominal (20Hz Drive)" : "Offline"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>2D LiDAR Scanner</span>
                          <span className={cn("font-semibold", telemetry?.is_online ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                            {telemetry?.is_online ? `${telemetry?.lidar?.beam_count ?? 36} Beams Active` : "Offline"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vision AI Module</span>
                          <span className={cn("font-semibold", telemetry?.is_online ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                            {telemetry?.is_online ? "Active (10 FPS AI Stream)" : "Offline"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Supabase Cloud Sync</span>
                          <span className={cn("font-semibold", (telemetry?.backend_bridge?.connected || telemetry?.is_online) ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400")}>
                            {(telemetry?.backend_bridge?.connected || telemetry?.is_online) ? "Connected (Live Cloud Sync)" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Navigation className="size-3.5 text-emerald-500" /> Pose & Odometry Telemetry
                      </h4>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Grid Coordinates</span>
                          <span className="font-mono font-semibold text-foreground">
                            X: {telemetry?.pose?.x?.toFixed(2) ?? "2.00"}m, Y: {telemetry?.pose?.y?.toFixed(2) ?? "2.00"}m
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Orientation</span>
                          <span className="font-mono font-semibold text-foreground">
                            {telemetry?.pose?.theta_deg?.toFixed(1) ?? "0.0"}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Linear Speed</span>
                          <span className="font-mono font-semibold text-foreground">
                            {telemetry?.pose?.linear_velocity_m_s?.toFixed(2) ?? "0.00"} m/s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Odometer</span>
                          <span className="font-mono font-semibold text-foreground">
                            {telemetry?.pose?.total_odometry_m?.toFixed(1) ?? "0.0"} m
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Rover Hardware Logs Console */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Terminal className="size-3.5 text-emerald-500" /> Live Simulation & Hardware Logs
                    </h4>
                    <div className="rounded-xl border border-border/60 bg-slate-950 p-3.5 font-mono text-xs text-emerald-400 max-h-48 overflow-y-auto space-y-1.5">
                      {telemetry?.logs && telemetry.logs.length > 0 ? (
                        telemetry.logs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                            <span className={cn(
                              "font-bold shrink-0",
                              log.level === "INFO" ? "text-emerald-400" : log.level === "WARN" ? "text-amber-400" : "text-red-400"
                            )}>
                              [{log.level}]
                            </span>
                            <span className="text-slate-200">{log.message}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-500 italic">No logs received yet. Waiting for telemetry packets...</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
