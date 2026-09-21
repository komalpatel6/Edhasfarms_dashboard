import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Bot, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PolyhouseMap } from "@/components/app/PolyhouseMap";
import { CardTitle, MetricRow, ProgressBar, StatusBadge, Surface } from "@/components/app/ui-kit";
import { useRovers, usePolyhouses, useDiscoveredRovers, useRoverLiveTelemetry } from "@/hooks/use-api";
import { apiRequest } from "@/lib/api-client";

export const Route = createFileRoute("/live-rover")({
  component: LiveRover,
});

function LiveRover() {
  const { data: fleet, loading: loadingFleet, refetch } = useRovers();
  const { data: polyhouses, loading: loadingPoly } = usePolyhouses();
  const { data: discoveredRovers, refetch: refetchDiscovered } = useDiscoveredRovers();
  const [selectedRoverId, setSelectedRoverId] = useState<string>("");
  const [deploying, setDeploying] = useState(false);

  const activeRover = fleet.find((r) => r.id === selectedRoverId) || fleet[0];

  // Dynamic real-time telemetry stream
  const { data: telemetry } = useRoverLiveTelemetry(activeRover?.id || null);

  const handleQuickDeploy = async (rover: any) => {
    setDeploying(true);
    try {
      await apiRequest("/rovers/", {
        method: "POST",
        body: JSON.stringify({
          id: rover.id,
          name: rover.name,
          polyhouse_id: polyhouses[0]?.name || "Polyhouse 01",
          status: rover.status || "Idle",
          battery_level: rover.battery_level || 95,
          scan_speed_m_s: rover.scan_speed_m_s || 0.5,
          inspection_interval_hours: rover.inspection_interval_hours || 4,
          inspection_duration_mins: rover.inspection_duration_mins || 30,
        }),
      });
      toast.success(`Rover ${rover.name} linked to Supabase!`);
      refetch();
      refetchDiscovered();
    } catch (err: any) {
      toast.error(err.message || "Failed to link rover");
    } finally {
      setDeploying(false);
    }
  };

  if (loadingFleet && loadingPoly) {
    return (
      <AppShell title="Live Rover">
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading live rover telemetry...</div>
      </AppShell>
    );
  }

  if (fleet.length === 0) {
    return (
      <AppShell title="Live Rover">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Bot className="size-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No Live Rover Active in Database</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            There are currently no rovers registered in your database.
          </p>

          {discoveredRovers.length > 0 && discoveredRovers[0] ? (
            <div className="mt-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 max-w-md w-full text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Zap className="size-3.5 text-emerald-500" /> Live Rover Detected on Port 8088
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Online</span>
              </div>
              <div className="text-xs text-foreground font-semibold">
                {discoveredRovers[0].name} ({discoveredRovers[0].id}) · Battery: {discoveredRovers[0].battery_level}%
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => discoveredRovers[0] && handleQuickDeploy(discoveredRovers[0])}
                  disabled={deploying}
                  className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                >
                  {deploying ? "Linking..." : "⚡ Quick Link & View Rover"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </AppShell>
    );
  }

  if (!activeRover) {
    return null;
  }

  const activePolyhouse = polyhouses.find((p) => p.name === activeRover.polyhouse_id || p.id === activeRover.polyhouse_id) || polyhouses[0] || {
    id: "poly-01",
    name: activeRover.polyhouse_id && activeRover.polyhouse_id !== "Unassigned" ? activeRover.polyhouse_id : "Polyhouse 01",
    grid_rows: 10,
    grid_bays: 10,
    total_area_sqm: 2400,
    created_at: new Date().toISOString(),
  };

  const totalPlants = (activePolyhouse.grid_rows || 10) * (activePolyhouse.grid_bays || 10) * 10;

  // Real dynamic values directly from hardware/simulator
  const isRoverOnline = telemetry?.is_online ?? (activeRover.status !== "Offline");
  const liveStatus = telemetry?.is_online ? (telemetry?.state || telemetry?.rover?.status || activeRover.status) : activeRover.status;
  const liveBattery = telemetry?.battery?.percentage != null ? Math.round(telemetry.battery.percentage) : activeRover.battery_level;
  
  // Real motion speed: 0.0 m/s when stopped, idle, docked, or offline
  const isMoving = isRoverOnline && (liveStatus === "Scanning" || liveStatus === "ReturnToBase" || (telemetry?.pose?.linear_velocity_m_s != null && Math.abs(telemetry.pose.linear_velocity_m_s) > 0.01));
  const liveSpeed = isMoving 
    ? (telemetry?.pose?.linear_velocity_m_s != null && Math.abs(telemetry.pose.linear_velocity_m_s) > 0.01 
        ? Math.abs(telemetry.pose.linear_velocity_m_s) 
        : activeRover.scan_speed_m_s) 
    : 0.0;
    
  const liveProgress = telemetry?.navigation?.progress_pct != null ? telemetry.navigation.progress_pct : 0;
  const liveRow = telemetry?.navigation?.current_row ? `Row ${String(telemetry.navigation.current_row).padStart(2, '0')}` : "Row 01";
  const liveBay = telemetry?.navigation?.current_bay ? `Bay ${String(telemetry.navigation.current_bay).padStart(2, '0')}` : "Bay 01";

  // Map 2D coordinate to percentage
  const polyLen = (activePolyhouse.length_m || 80.0);
  const polyWidth = (activePolyhouse.width_m || 30.0);
  const x_pct = telemetry?.pose?.x != null ? Math.max(5, Math.min(95, (telemetry.pose.x / polyLen) * 90 + 5)) : 58;
  const y_pct = telemetry?.pose?.y != null ? Math.max(8, Math.min(92, (telemetry.pose.y / polyWidth) * 80 + 10)) : 41;

  const copy = () => {
    const coords = `X: ${telemetry?.pose?.x?.toFixed(2) ?? "2.00"}m, Y: ${telemetry?.pose?.y?.toFixed(2) ?? "2.00"}m`;
    navigator.clipboard?.writeText(coords);
    toast.success(`Coordinates copied: ${coords}`);
  };

  return (
    <AppShell title="Live Rover">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Live Rover</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time position and dynamic telemetry for {activeRover.name || activeRover.id} in {activePolyhouse.name}.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Rover Switcher */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 shadow-2xs">
            <Bot className="size-4 text-primary" />
            <select
              value={activeRover.id}
              onChange={(e) => setSelectedRoverId(e.target.value)}
              aria-label="Select Active Rover"
              className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
            >
              {fleet.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || r.id} · {r.polyhouse_id || "Unassigned"} ({r.id === activeRover.id ? liveBattery : r.battery_level}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] mt-2">
        <PolyhouseMap
          title={activePolyhouse.name}
          subtitle={`${activePolyhouse.total_area_sqm || 2400} m² · ${activePolyhouse.grid_rows || 10} Rows · ${totalPlants.toLocaleString()} Plants`}
          height="h-[540px]"
          offline={!isRoverOnline}
          rover={{
            id: activeRover.id,
            serial: `BP-${activeRover.id}`,
            firmware: telemetry?.rover?.firmware || "v2.5.0",
            status: liveStatus as any,
            battery: liveBattery,
            speed: liveSpeed,
            row: `${liveRow} · ${liveBay}`,
            polyhouse: activePolyhouse.name,
            lat: 22.5726,
            lng: 88.3639,
            x_pct: x_pct,
            y_pct: y_pct,
            lastComm: activeRover.last_ping ? new Date(activeRover.last_ping).toLocaleTimeString() : "Just now"
          } as any}
        />

        <div className="space-y-6">
          <Surface>
            <CardTitle
              right={
                <StatusBadge tone={liveStatus === "Offline" ? "offline" : liveStatus === "Scanning" ? "healthy" : "default"}>
                  {liveStatus}
                </StatusBadge>
              }
            >
              🚜 {activeRover.name || activeRover.id}
            </CardTitle>

            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Battery", v: `${liveBattery}%` },
                { l: "Current Speed", v: `${liveSpeed.toFixed(1)} m/s` },
                { l: "Active Location", v: `${liveRow} · ${liveBay}` },
                { l: "Interval", v: `${activeRover.inspection_interval_hours} hrs` },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-muted/40 px-3.5 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</p>
                  <p className="mt-1 text-[16px] font-bold text-foreground">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <MetricRow label="Live Status" value={liveStatus} />
              <MetricRow label="Grid Coordinates" value={`X: ${telemetry?.pose?.x?.toFixed(2) ?? "2.00"}m, Y: ${telemetry?.pose?.y?.toFixed(2) ?? "2.00"}m`} />
              <MetricRow label="Heading" value={`${telemetry?.pose?.theta_deg?.toFixed(1) ?? "0.0"}°`} />
              <MetricRow label="Last Heartbeat" value={activeRover.last_ping ? new Date(activeRover.last_ping).toLocaleTimeString() : "Just now"} />
              <MetricRow label="Assigned Polyhouse" value={activeRover.polyhouse_id || "Unassigned"} />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="text-muted-foreground">Mission Inspection Progress</span>
                <span className="font-medium text-foreground">{liveProgress}%</span>
              </div>
              <ProgressBar value={liveProgress} />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-accent cursor-pointer"
              >
                <Copy className="size-3.5" /> Copy Local Grid Coordinates
              </button>
            </div>
          </Surface>

          <Surface>
            <CardTitle>Sensor Diagnostics</CardTitle>
            <MetricRow label="Optical Camera" value={<StatusBadge tone={telemetry?.is_online ? "healthy" : "offline"}>{telemetry?.is_online ? "Nominal (10 FPS)" : "Offline"}</StatusBadge>} />
            <MetricRow label="LiDAR Scanner" value={<StatusBadge tone={telemetry?.is_online ? "healthy" : "offline"}>{telemetry?.is_online ? `${telemetry?.lidar?.beam_count ?? 36}-Beam 2D` : "Offline"}</StatusBadge>} />
            <MetricRow label="Soil Sensor Probe" value={<StatusBadge tone={telemetry?.is_online ? "healthy" : "offline"}>{telemetry?.is_online ? "Calibrated (5 Sensors)" : "Offline"}</StatusBadge>} />
            <MetricRow label="Telemetry Sync Link" value={<StatusBadge tone={isRoverOnline ? "healthy" : "offline"}>{isRoverOnline ? "Connected (20Hz WebSocket)" : "Offline"}</StatusBadge>} />
          </Surface>
        </div>
      </div>
    </AppShell>
  );
}
