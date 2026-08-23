import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PolyhouseMap } from "@/components/app/PolyhouseMap";
import { CardTitle, MetricRow, StatusBadge, Surface, statusTone } from "@/components/app/ui-kit";
import { polyhouses } from "@/lib/mock-data";

const focusKeys = ["plants", "fruit", "disease", "water", "soil"] as const;
type Focus = (typeof focusKeys)[number];

const focusLabels: Record<Focus, string> = {
  plants: "Plant detection",
  fruit: "Fruit production",
  disease: "Disease detection",
  water: "Water stress",
  soil: "Soil condition",
};

export const Route = createFileRoute("/polyhouses/$id")({
  validateSearch: (search: Record<string, unknown>): { focus?: Focus } => {
    const f = search['focus'];
    return focusKeys.includes(f as Focus) ? { focus: f as Focus } : {};
  },
  head: () => ({
    meta: [
      { title: "Polyhouse Detail · BellPepper AI" },
      { name: "description", content: "Structure details, layout metrics and the digital top-down map of a monitored polyhouse." },
      { property: "og:title", content: "Polyhouse Detail · BellPepper AI" },
      { property: "og:description", content: "Layout, rover assignment and digital polyhouse map." },
    ],
  }),
  component: PolyhouseDetail,
});

function PolyhouseDetail() {
  const { id } = Route.useParams();
  const { focus } = Route.useSearch();
  const house = polyhouses.find((p) => p.id === id) ?? polyhouses[0]!;

  return (
    <AppShell title={house.name}>
      <Link to="/polyhouses" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> All polyhouses
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">{house.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {house.area} · {house.rows} Rows · {house.plants.toLocaleString()} Plants
          </p>
        </div>
        <StatusBadge tone={statusTone(house.status)}>{house.status}</StatusBadge>
      </div>

      {focus ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-leaf-soft/50 px-4 py-3 text-[13px]">
          <StatusBadge tone="sage">{focusLabels[focus]}</StatusBadge>
          <span className="text-muted-foreground">
            Map layer focused from your dashboard metric.
          </span>
          <Link to="/polyhouses/$id" params={{ id: house.id }} search={{}} className="ml-auto text-sage hover:underline">
            Clear focus
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.9fr]">
        <Surface>
          <CardTitle>Structure</CardTitle>
          <MetricRow label="Location" value={house.location} />
          <MetricRow label="Length" value={house.length} />
          <MetricRow label="Width" value={house.width} />
          <MetricRow label="Row spacing" value={house.rowSpacing} />
          <MetricRow label="Plant spacing" value={house.plantSpacing} />
          <MetricRow label="Assigned rover" value={house.rover} />
          <MetricRow label="Status" value={<StatusBadge tone={statusTone(house.status)}>{house.status}</StatusBadge>} />
        </Surface>

        <PolyhouseMap
          key={focus ?? "default"}
          focusLayer={focus}
          title={house.name}
          subtitle={`${house.area} · ${house.rows} Rows · ${house.plants.toLocaleString()} Plants`}
          height="h-[480px]"
        />
      </div>
    </AppShell>
  );
}
