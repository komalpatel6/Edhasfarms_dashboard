import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ImageOff } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PolyhouseMap } from "@/components/app/PolyhouseMap";
import {
  CardTitle,
  EmptyState,
  KpiCard,
  MetricRow,
  StatusBadge,
  Surface,
  statusTone,
} from "@/components/app/ui-kit";
import { alerts, diseases, inspections } from "@/lib/mock-data";

export const Route = createFileRoute("/inspections/$id")({
  head: () => ({
    meta: [
      { title: "Inspection Detail · BellPepper AI" },
      { name: "description", content: "Full inspection breakdown: route, plant results, disease findings, fruit counts, soil and alerts." },
      { property: "og:title", content: "Inspection Detail · BellPepper AI" },
      { property: "og:description", content: "Route, results, disease findings and alerts for one rover run." },
    ],
  }),
  component: InspectionDetail,
});

function InspectionDetail() {
  const { id } = Route.useParams();
  const run = inspections.find((i) => i.id === id) ?? inspections[0]!;

  return (
    <AppShell title="Inspection Detail">
      <Link to="/inspections" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Inspection history
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{run.date}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {run.id} · {run.rover} · Greenhouse 01
          </p>
        </div>
        <StatusBadge tone={statusTone(run.status)}>{run.status}</StatusBadge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rows Covered" value={String(run.rows)} tone="sage" />
        <KpiCard label="Plants" value={run.plants.toLocaleString()} tone="mint" />
        <KpiCard label="Fruits" value={run.fruits.toLocaleString()} tone="butter" />
        <KpiCard label="Disease Findings" value={String(diseases.length)} tone="peach" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <PolyhouseMap title="Inspection Route" subtitle={`${run.rows} rows · ${run.plants.toLocaleString()} plants`} height="h-[420px]" />

        <div className="space-y-6">
          <Surface>
            <CardTitle>Summary</CardTitle>
            <MetricRow label="Start" value="06:40 AM" />
            <MetricRow label="End" value="09:12 AM" />
            <MetricRow label="Distance" value="2.8 km" />
            <MetricRow label="Water stress" value="8% of plants" />
            <MetricRow label="Soil samples" value="64" />
          </Surface>

          <Surface>
            <CardTitle>Alerts raised</CardTitle>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2 rounded-full ${a.severity === "critical" ? "bg-critical" : a.severity === "warning" ? "bg-warning" : "bg-sky"}`} />
                  <div>
                    <p className="text-[14px]">{a.title}</p>
                    <p className="text-[12px] text-muted-foreground">{a.context}</p>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>

      <Surface className="p-0">
        <div className="px-5 pt-5">
          <CardTitle>Disease findings</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-y border-border text-left text-muted-foreground">
                {["Plant", "Row", "Disease", "Confidence", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diseases.map((d) => (
                <tr key={d.plant} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium">{d.plant}</td>
                  <td className="px-5 py-3">{d.row}</td>
                  <td className="px-5 py-3">{d.disease}</td>
                  <td className="px-5 py-3">{d.confidence}%</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={statusTone(d.status)}>{d.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>

      <Surface>
        <CardTitle>Captured images</CardTitle>
        <EmptyState
          icon={<ImageOff className="size-5" />}
          title="No images synced yet"
          description="Inspection imagery uploads once the rover docks and completes its sync cycle."
        />
      </Surface>
    </AppShell>
  );
}
