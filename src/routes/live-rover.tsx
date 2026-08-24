import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, ExternalLink, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PolyhouseMap } from "@/components/app/PolyhouseMap";
import { CardTitle, MetricRow, ProgressBar, StatusBadge, Surface } from "@/components/app/ui-kit";
import { useRovers, usePolyhouses } from "@/hooks/use-api";

export const Route = createFileRoute("/live-rover")({
  component: LiveRover,
});

function LiveRover() {
  const { data: fleet, loading: loadingFleet } = useRovers();
  const { data: polyhouses, loading: loadingPoly } = usePolyhouses();
  const [offline, setOffline] = useState(false);

  if (loadingFleet || loadingPoly) {
    return (
      <AppShell title="Live Rover">
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading live rover telemetry...</div>
      </AppShell>
    );
  }

  if (fleet.length === 0 || polyhouses.length === 0) {
    return (
      <AppShell title="Live Rover">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-8">
          <h2 className="text-xl font-bold text-foreground">No Live Rover Active</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            There are currently no rovers deployed in your database. Please navigate to the Rovers page and click "+ Add Rover Unit" to register a rover.
          </p>
        </div>
      </AppShell>
    );
  }

  const activeRover = fleet[0] || {
    id: "RVR-001",
    name: "AgriRover 1",
    polyhouse_id: "Unassigned",
    status: "Idle" as const,
    battery_level: 85,
    scan_speed_m_s: 0.5,
    inspection_duration_mins: 30,
    inspection_interval_hours: 4,
    last_ping: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
  const activePolyhouse = polyhouses.find((p) => p.name === activeRover.polyhouse_id) || polyhouses[0] || {
    id: "poly-1",
    name: "Polyhouse 01",
    grid_rows: 10,
    grid_bays: 10,
    total_area_sqm: 2400,
    created_at: new Date().toISOString(),
  };
  const totalPlants = (activePolyhouse.grid_rows || 10) * (activePolyhouse.grid_bays || 10) * 10;

  const copy = () => {
    navigator.clipboard?.writeText(`22.572645, 88.363892`);
    toast.success("Coordinates copied");
  };

  return (
    <AppShell title="Live Rover">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Live Rover</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time position and telemetry for {activeRover.name || activeRover.id} in {activeRover.polyhouse_id || activePolyhouse.name}.
          </p>
        </div>
        <button
          onClick={() => setOffline((o) => !o)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors hover:bg-accent"
        >
          {offline ? "Simulate reconnect" : "Simulate connection loss"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <PolyhouseMap
          title={activePolyhouse.name}
          subtitle={`${activePolyhouse.total_area_sqm || 2400} m² · ${activePolyhouse.grid_rows || 10} Rows · ${totalPlants.toLocaleString()} Plants`}
          height="h-[540px]"
          offline={offline}
        />

        <div className="space-y-6">
          {offline && (
            <div className="rounded-xl border border-border bg-critical-soft/60 p-5">
              <p className="text-[15px] font-medium">Connection Lost</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Showing last known location · 2 min 35 sec ago
              </p>
              <p className="mt-3 text-[13px] font-medium">
                22.572645, 88.363892
              </p>
              <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium hover:bg-accent">
                <RefreshCcw className="size-3.5" /> Retry
              </button>
            </div>
          )}

          <Surface>
            <CardTitle
              right={
                <StatusBadge tone={offline ? "offline" : "healthy"}>
                  {offline ? "Offline" : activeRover.status}
                </StatusBadge>
              }
            >
              🚜 {activeRover.name || activeRover.id}
            </CardTitle>

            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Battery", v: `${activeRover.battery_level}%` },
                { l: "Speed", v: `${activeRover.scan_speed_m_s} m/s` },
                { l: "Scan Duration", v: `${activeRover.inspection_duration_mins} mins` },
                { l: "Interval", v: `${activeRover.inspection_interval_hours} hrs` },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-cream px-3 py-3">
                  <p className="text-[12px] text-muted-foreground">{s.l}</p>
                  <p className="mt-1 text-[16px] font-medium">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <MetricRow label="Status" value={activeRover.status} />
              <MetricRow label="Last Ping" value={activeRover.last_ping ? new Date(activeRover.last_ping).toLocaleTimeString() : "Just now"} />
              <MetricRow label="Assigned Polyhouse" value={activeRover.polyhouse_id || "Unassigned"} />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="text-muted-foreground">Inspection Progress</span>
                <span className="font-medium">75%</span>
              </div>
              <ProgressBar value={75} />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <a
                href={`https://www.google.com/maps?q=22.5726,88.3639`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ExternalLink className="size-3.5" /> Open in Google Maps
              </a>
              <button
                onClick={copy}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-accent"
              >
                <Copy className="size-3.5" /> Copy Coordinates
              </button>
            </div>
          </Surface>

          <Surface>
            <CardTitle>Sensor Status</CardTitle>
            <MetricRow label="Camera" value={<StatusBadge tone="healthy">Nominal</StatusBadge>} />
            <MetricRow label="LiDAR" value={<StatusBadge tone="healthy">Nominal</StatusBadge>} />
            <MetricRow label="Soil probe" value={<StatusBadge tone="warning">Calibrating</StatusBadge>} />
            <MetricRow label="LoRaWAN link" value={<StatusBadge tone={offline ? "offline" : "healthy"}>{offline ? "Lost" : "Strong"}</StatusBadge>} />
          </Surface>
        </div>
      </div>
    </AppShell>
  );
}
