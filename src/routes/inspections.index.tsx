import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StatusBadge, Surface, statusTone } from "@/components/app/ui-kit";
import { inspections } from "@/lib/mock-data";

export const Route = createFileRoute("/inspections/")({
  head: () => ({
    meta: [
      { title: "Inspection History · BellPepper AI" },
      { name: "description", content: "Every rover inspection run with rows covered, plants scanned, fruit counts and completion status." },
      { property: "og:title", content: "Inspection History · BellPepper AI" },
      { property: "og:description", content: "Browse and drill into past rover inspection runs." },
    ],
  }),
  component: Inspections,
});

function Inspections() {
  return (
    <AppShell title="Inspection History">
      <PageHeader title="Inspection History" subtitle="Complete record of rover runs across your polyhouses." />

      <div className="flex flex-wrap gap-2">
        {["All rovers", "Greenhouse 01", "Last 7 days"].map((f) => (
          <button key={f} className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-accent">
            {f} ▾
          </button>
        ))}
      </div>

      <Surface className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                {["Date", "Rover", "Rows", "Plants", "Fruits", "Status"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inspections.map((i) => (
                <tr key={i.id} className="border-b border-border/60 last:border-0 hover:bg-accent/50">
                  <td className="px-5 py-3">
                    <Link to="/inspections/$id" params={{ id: i.id }} className="font-medium hover:underline">
                      {i.date}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{i.rover}</td>
                  <td className="px-5 py-3">{i.rows}</td>
                  <td className="px-5 py-3">{i.plants.toLocaleString()}</td>
                  <td className="px-5 py-3">{i.fruits.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={statusTone(i.status)}>{i.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
    </AppShell>
  );
}
