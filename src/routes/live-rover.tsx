import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, ExternalLink, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PolyhouseMap } from "@/components/app/PolyhouseMap";
import { CardTitle, MetricRow, ProgressBar, StatusBadge, Surface } from "@/components/app/ui-kit";
import { rover } from "@/lib/mock-data";

export const Route = createFileRoute("/live-rover")({
  head: () => ({
    meta: [
      { title: "Live Rover · BellPepper AI" },
      { name: "description", content: "Track rover RVR-001 live inside the polyhouse: position, battery, speed and coordinates." },
      { property: "og:title", content: "Live Rover · BellPepper AI" },
      { property: "og:description", content: "Live rover position, telemetry and navigation coordinates." },
    ],
  }),
  component: LiveRover,
});

function LiveRover() {
  const [offline, setOffline] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(`${rover.lat}, ${rover.lng}`);
    toast.success("Coordinates copied");
  };

  return (
    <AppShell title="Live Rover">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Live Rover</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time position and telemetry for {rover.id} in Greenhouse 01.
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
        <PolyhouseMap height="h-[540px]" offline={offline} />

        <div className="space-y-6">
          {offline && (
            <div className="rounded-xl border border-border bg-critical-soft/60 p-5">
              <p className="text-[15px] font-medium">Connection Lost</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Showing last known location · 2 min 35 sec ago
              </p>
              <p className="mt-3 text-[13px] font-medium">
                {rover.lat}, {rover.lng}
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
                  {offline ? "Offline" : "Online"}
                </StatusBadge>
              }
            >
              🚜 {rover.id}
            </CardTitle>

            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Battery", v: `${rover.battery}%` },
                { l: "Speed", v: `${rover.speed} m/s` },
                { l: "Current Row", v: rover.row },
                { l: "Runtime", v: rover.runtime },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-cream px-3 py-3">
                  <p className="text-[12px] text-muted-foreground">{s.l}</p>
                  <p className="mt-1 text-[16px] font-medium">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <MetricRow label="Distance" value={rover.distance} />
              <MetricRow label="Last Communication" value={offline ? "2 min 35 sec ago" : rover.lastComm} />
              <MetricRow label="Coordinates" value={`${rover.lat}, ${rover.lng}`} />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-[13px]">
                <span className="text-muted-foreground">Inspection Progress</span>
                <span className="font-medium">{rover.progress}%</span>
              </div>
              <ProgressBar value={rover.progress} />
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <a
                href={`https://www.google.com/maps?q=${rover.lat},${rover.lng}`}
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
