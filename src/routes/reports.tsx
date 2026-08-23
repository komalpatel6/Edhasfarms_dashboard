import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { CardTitle, PageHeader, Surface } from "@/components/app/ui-kit";
import { reports } from "@/lib/mock-data";

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
  return (
    <AppShell title="Reports">
      <PageHeader title="Reports" subtitle="Generated documents from every inspection cycle." />

      <Surface className="flex flex-wrap items-center gap-2 py-4">
        {["Date range", "Polyhouse", "Rover", "Row"].map((f) => (
          <button key={f} className="rounded-xl border border-border px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent">
            {f} ▾
          </button>
        ))}
      </Surface>

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
              {r.date} · {r.house}
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
                onClick={() => toast("Opening report preview", { description: r.id })}
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                View Report
              </button>
              <button
                onClick={() => toast.success("PDF download started")}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent"
                aria-label="Download PDF"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={() => toast.success("Excel export started")}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent"
                aria-label="Export Excel"
              >
                <FileSpreadsheet className="size-4" />
              </button>
              <button
                onClick={() => toast.success("CSV export started")}
                className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-accent"
                aria-label="Export CSV"
              >
                <FileText className="size-4" />
              </button>
            </div>
          </Surface>
        ))}
      </div>

      <Surface>
        <CardTitle>Scheduled exports</CardTitle>
        <p className="text-[13px] text-muted-foreground">
          Daily inspection reports are generated at 09:30 and emailed to assigned admins.
        </p>
      </Surface>
    </AppShell>
  );
}
