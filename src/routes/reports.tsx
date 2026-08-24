import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { CardTitle, PageHeader, Surface } from "@/components/app/ui-kit";
import { usePolyhouses, useRovers, useAlerts } from "@/hooks/use-api";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · BellPepper AI" },
      { name: "description", content: "Daily inspection, soil and disease reports ready to view, download or export." },
      { property: "og:title", content: "Reports · BellPepper AI" },
      { property: "og:description", content: "Clean document previews with PDF, Excel and CSV export." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { data: polyhouses, loading: loadingPoly } = usePolyhouses();
  const { data: fleet, loading: loadingFleet } = useRovers();
  const { data: alerts } = useAlerts();

  if (loadingPoly || loadingFleet) {
    return (
      <AppShell title="Reports">
        <PageHeader title="Reports" subtitle="Generated documents from every inspection cycle." />
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading report documents...</div>
      </AppShell>
    );
  }

  // Derive report documents dynamically from real polyhouses and rovers in Supabase
  const reports = polyhouses.map((house, idx) => {
    const assignedRover = fleet.find((r) => r.polyhouse_id === house.name) || fleet[idx] || { id: "RVR-001", name: "Unassigned" };
    const rows = house.grid_rows || 10;
    const bays = house.grid_bays || 10;
    const plants = rows * bays * 10;
    const fruits = plants * 3;
    const houseAlerts = alerts.filter((a) => a.polyhouse_id === house.id || a.severity === "Critical").length;

    return {
      id: `RPT-${100 + idx}`,
      title: `${house.name} — Inspection Report`,
      date: new Date(house.created_at || Date.now()).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      house: house.name,
      rover: assignedRover.name || assignedRover.id,
      plants: plants.toLocaleString(),
      fruits: fruits.toLocaleString(),
      disease: houseAlerts,
    };
  });

  return (
    <AppShell title="Reports">
      <PageHeader title="Reports" subtitle="Generated documents from every inspection cycle." />

      <Surface className="flex flex-wrap items-center gap-3 py-3">
        <select aria-label="Filter by Polyhouse" className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-[13px] text-muted-foreground outline-none">
          <option value="all">All Polyhouses</option>
          {polyhouses.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select aria-label="Filter by Rover" className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-[13px] text-muted-foreground outline-none">
          <option value="all">All Rovers</option>
          {fleet.map((r) => (
            <option key={r.id} value={r.id}>{r.name || r.id}</option>
          ))}
        </select>
      </Surface>

      {reports.length === 0 ? (
        <Surface className="flex flex-col items-center justify-center p-12 text-center">
          <h3 className="text-lg font-bold text-foreground">No Generated Reports</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            There are currently zero registered polyhouses in your database to generate inspection reports for.
          </p>
        </Surface>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <Surface key={r.id} hover className="flex flex-col">
              <div className="mb-4 space-y-1.5 rounded-xl bg-cream p-4">
                <div className="h-2 w-2/3 rounded-full bg-sage/25" />
                <div className="h-2 w-full rounded-full bg-sage/15" />
                <div className="h-2 w-5/6 rounded-full bg-sage/15" />
                <div className="h-2 w-1/2 rounded-full bg-sage/15" />
              </div>
              <h3 className="text-[15px] font-medium">{r.title}</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {r.date} · {r.house} · {r.rover}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { l: "Plants", v: r.plants },
                  { l: "Fruits", v: r.fruits },
                  { l: "Disease", v: r.disease },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-cream px-2 py-2">
                    <p className="text-[11px] text-muted-foreground">{s.l}</p>
                    <p className="mt-0.5 text-[13px] font-medium">{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => toast("Opening report preview", { description: `${r.id} · ${r.house}` })}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
                >
                  View Report
                </button>
                <button
                  onClick={() => toast.success("PDF download started", { description: `${r.id}.pdf` })}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent"
                  aria-label="Download PDF"
                >
                  <Download className="size-4" />
                </button>
                <button
                  onClick={() => toast.success("Excel export started", { description: `${r.id}.xlsx` })}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent"
                  aria-label="Export Excel"
                >
                  <FileSpreadsheet className="size-4" />
                </button>
                <button
                  onClick={() => toast.success("CSV export started", { description: `${r.id}.csv` })}
                  className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent"
                  aria-label="Export CSV"
                >
                  <FileText className="size-4" />
                </button>
              </div>
            </Surface>
          ))}
        </div>
      )}

      <Surface>
        <CardTitle>Scheduled exports</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Daily inspection reports are generated automatically at 09:30 and emailed to assigned admins.
        </p>
      </Surface>
    </AppShell>
  );
}
