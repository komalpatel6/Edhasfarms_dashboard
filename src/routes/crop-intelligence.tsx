import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Flame,
  Home,
  Layers,
  Leaf,
  MapPin,
  Search,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  CardTitle,
  KpiCard,
  MetricRow,
  ProgressBar,
  StatusBadge,
  Surface,
  statusTone,
} from "@/components/app/ui-kit";
import { currentUser, houseSummary, polyhouses } from "@/lib/mock-data";
import { useAnomalies, usePolyhouses } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

const tabs = ["Plants", "Disease", "Fruits", "Growth", "Water Stress"] as const;
type Tab = (typeof tabs)[number];

export const Route = createFileRoute("/crop-intelligence")({
  validateSearch: (search: Record<string, unknown>): { house?: string | undefined; tab?: string | undefined } => {
    const house = typeof search["house"] === "string" ? search["house"] : undefined;
    const tab = typeof search["tab"] === "string" ? search["tab"] : undefined;
    return { house, tab };
  },
  head: () => ({
    meta: [
      { title: "Crop Intelligence · BellPepper AI" },
      {
        name: "description",
        content:
          "AI plant detection, disease review, fruit counting, growth monitoring and water stress across all smart polyhouses.",
      },
      { property: "og:title", content: "Crop Intelligence · BellPepper AI" },
      { property: "og:description", content: "Plants, disease, fruits, growth and water stress insights." },
    ],
  }),
  component: CropIntelligence,
});

const chartTip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--popover)",
    fontSize: 12,
  },
};

export function CropIntelligence() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const initialHouseId =
    polyhouses.find((p) => p.id === searchParams.house)?.id ?? polyhouses[0]!.id;
  const [selectedHouseId, setSelectedHouseId] = useState<string>(initialHouseId);

  const [tab, setTab] = useState<Tab>(() => {
    return tabs.includes(searchParams.tab as Tab) ? (searchParams.tab as Tab) : "Plants";
  });

  const [plantSearch, setPlantSearch] = useState("");
  const [plantFilter, setPlantFilter] = useState<"all" | "Healthy" | "Suspected" | "Critical">("all");

  const selectedHouse = polyhouses.find((p) => p.id === selectedHouseId) ?? polyhouses[0]!;
  const selectedSummary = houseSummary[selectedHouse.id] ?? houseSummary[polyhouses[0]!.id]!;

  const handleHouseSelect = (houseId: string) => {
    setSelectedHouseId(houseId);
    navigate({
      search: (prev) => ({
        ...prev,
        house: houseId,
      }),
      replace: true,
    });
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    navigate({
      search: (prev) => ({
        ...prev,
        tab: t,
      }),
      replace: true,
    });
  };

  // Metrics derived from selected house
  const totalPlants = selectedHouse.plants;
  const missingPlants = selectedSummary.crop.missing;
  const inspectedPlants = Math.max(0, totalPlants - missingPlants);
  const inspectionRate = ((inspectedPlants / totalPlants) * 100).toFixed(1);

  const healthyPlants = selectedSummary.crop.healthy;
  const suspectedDisease = selectedSummary.crop.suspected;
  const criticalDisease = selectedSummary.crop.diseased;
  const totalFruits = selectedSummary.crop.fruits;
  const avgFruitsPerPlant = (totalFruits / totalPlants).toFixed(2);

  // Dynamic plants list for this polyhouse
  const housePlants = Array.from({ length: 24 }, (_, i) => {
    const plantNum = totalPlants - i * (selectedHouse.id === "Poly-02" ? 6 : selectedHouse.id === "Poly-03" ? 8 : 7);
    const rowNum = (i % selectedHouse.rows) + 1;
    const statuses = ["Healthy", "Healthy", "Healthy", "Suspected", "Healthy", "Critical"] as const;
    const statusIndex = (i + (selectedHouse.id === "Poly-02" ? 1 : selectedHouse.id === "Poly-03" ? 2 : 0)) % statuses.length;
    const status = statuses[statusIndex]!;
    const baseFruit = Math.round(Number(avgFruitsPerPlant) * 4 + 4);
    const fruits = Math.max(1, baseFruit - (i % 8) + (selectedHouse.id === "Poly-03" ? 3 : 0));
    const previousFruits = Math.max(1, fruits - 2 - (i % 3));

    return {
      id: `P-${String(plantNum).padStart(4, "0")}`,
      row: `Row ${String(rowNum).padStart(2, "0")}`,
      position: 48 - i,
      status,
      lastInspection: i < 12 ? "13 Aug" : "12 Aug",
      fruits,
      previousFruits,
    };
  });

  const filteredPlants = housePlants.filter((p) => {
    const matchesSearch = p.id.toLowerCase().includes(plantSearch.toLowerCase()) || p.row.toLowerCase().includes(plantSearch.toLowerCase());
    const matchesStatus = plantFilter === "all" || p.status === plantFilter;
    return matchesSearch && matchesStatus;
  });

  const [drawer, setDrawer] = useState<(typeof housePlants)[number] | null>(null);
  const canManage = currentUser.role !== "Viewer";
const rowProduction = [
  { row: "Row 01", fruits: 340 },
  { row: "Row 02", fruits: 410 },
  { row: "Row 03", fruits: 290 },
  { row: "Row 04", fruits: 380 },
];

const growthTrend = [
  { day: "Mon", fruits: 3200, plants: 1240 },
  { day: "Tue", fruits: 3350, plants: 1242 },
  { day: "Wed", fruits: 3480, plants: 1245 },
  { day: "Thu", fruits: 3682, plants: 1248 },
];

const waterStress = [
  { name: "Optimal", value: 85 },
  { name: "Moderate", value: 12 },
  { name: "Severe", value: 3 },
];

const waterTrend = [
  { day: "Mon", stress: 10 },
  { day: "Tue", stress: 12 },
  { day: "Wed", stress: 15 },
  { day: "Thu", stress: 11 },
];

function CropIntelligence() {
  const { data: polyhouses, loading: loadingPoly } = usePolyhouses();
  const { data: apiAnomalies, loading: loadingAno } = useAnomalies();
  const [tab, setTab] = useState<Tab>("Plants");
  const [drawer, setDrawer] = useState<any | null>(null);
  const canManage = true;

  if (loadingPoly || loadingAno) {
    return (
      <AppShell title="Crop Intelligence">
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading AI crop telemetry...</div>
      </AppShell>
    );
  }

  if (polyhouses.length === 0) {
    return (
      <AppShell title="Crop Intelligence">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-8">
          <h2 className="text-xl font-bold text-foreground">No Polyhouse Data Available</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            There are currently no polyhouses created in the database. Add a polyhouse on the Polyhouses page to begin AI crop analysis.
          </p>
        </div>
      </AppShell>
    );
  }

  // Construct dynamic plant rows derived from active database polyhouses
  const firstHouse = polyhouses[0];
  const totalPlantsCount = polyhouses.reduce((acc, p) => acc + (p.grid_rows * p.grid_bays * 10), 0);
  const gridRows = firstHouse ? firstHouse.grid_rows : 10;
  const gridBays = firstHouse ? firstHouse.grid_bays : 10;

  const plantsList = Array.from({ length: Math.min(gridRows * gridBays, 20) }).map((_, i) => {
    const rowNum = Math.floor(i / gridBays) + 1;
    const bayNum = (i % gridBays) + 1;
    const hasAnomaly = apiAnomalies.find((a) => a.grid_x === bayNum && a.grid_y === rowNum);
    const housePrefix = firstHouse?.id ? firstHouse.id.slice(0, 4).toUpperCase() : "POLY";
    return {
      id: `P-${housePrefix}-${String(i + 1).padStart(3, "0")}`,
      row: `Row ${rowNum}`,
      position: `Grid (${bayNum}, ${rowNum})`,
      status: hasAnomaly ? hasAnomaly.severity : "Healthy",
      lastInspection: new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }),
      fruits: 10 + (i % 8),
      previousFruits: 8 + (i % 8),
    };
  });

  const anomaliesList = apiAnomalies.map((a) => ({
    id: a.id,
    plant: `Grid (${a.grid_x || 1}, ${a.grid_y || 1})`,
    row: `Row ${a.grid_y || 1}`,
    disease: a.issue_type || a.title,
    confidence: Math.round((a.ai_confidence <= 1 ? a.ai_confidence * 100 : a.ai_confidence) || 90),
    causes: a.causes || "High canopy humidity & poor air circulation",
    status: a.status,
  }));

  // Dynamic diseases detected in this polyhouse
  const baseDiseases = [
    { disease: "Bacterial Spot", confidence: 94, status: "New" as const },
    { disease: "Powdery Mildew", confidence: 91, status: "Reviewed" as const },
    { disease: "Bacterial Spot", confidence: 88, status: "Action" as const },
    { disease: "Leaf Curl", confidence: 84, status: "Reviewed" as const },
    { disease: "Powdery Mildew", confidence: 81, status: "Resolved" as const },
    { disease: "Blossom End Rot", confidence: 79, status: "New" as const },
    { disease: "Early Blight", confidence: 86, status: "Action" as const },
    { disease: "Fusarium Wilt", confidence: 92, status: "New" as const },
  ];

  const houseDiseases = baseDiseases
    .slice(0, Math.min(baseDiseases.length, Math.max(4, Math.ceil(criticalDisease / 2))))
    .map((d, i) => {
      const rowNum = ((i * 3 + 2) % selectedHouse.rows) + 1;
      const plantNum = totalPlants - i * 37 - 14;
      return {
        plant: `P-${String(plantNum).padStart(4, "0")}`,
        row: String(rowNum).padStart(2, "0"),
        disease: d.disease,
        confidence: d.confidence - (selectedHouse.id === "Poly-02" ? 3 : selectedHouse.id === "Poly-03" ? 1 : 0),
        status: d.status,
      };
    });

  // Dynamic row production
  const houseRowProduction = [
    { row: `Row ${String(Math.min(12, selectedHouse.rows)).padStart(2, "0")}`, fruits: Math.round(totalFruits * 0.12) },
    { row: `Row ${String(Math.min(8, selectedHouse.rows)).padStart(2, "0")}`, fruits: Math.round(totalFruits * 0.108) },
    { row: `Row ${String(Math.min(15, selectedHouse.rows)).padStart(2, "0")}`, fruits: Math.round(totalFruits * 0.098) },
    { row: `Row ${String(Math.min(4, selectedHouse.rows)).padStart(2, "0")}`, fruits: Math.round(totalFruits * 0.088) },
    { row: `Row ${String(Math.min(18, selectedHouse.rows)).padStart(2, "0")}`, fruits: Math.round(totalFruits * 0.076) },
    { row: `Row ${String(Math.min(2, selectedHouse.rows)).padStart(2, "0")}`, fruits: Math.round(totalFruits * 0.068) },
  ];
  const maxRowFruits = Math.max(...houseRowProduction.map((r) => r.fruits));

  // Dynamic Growth trend
  const trendMultipliers = {
    "Poly-01": { fruits: [0.76, 0.8, 0.84, 0.88, 0.8, 0.98, 1], plants: [0.96, 0.97, 0.98, 0.99, 0.82, 0.99, 1] },
    "Poly-02": { fruits: [0.82, 0.79, 0.85, 0.91, 0.87, 0.94, 1], plants: [0.98, 0.97, 0.97, 0.98, 0.95, 0.99, 1] },
    "Poly-03": { fruits: [0.71, 0.76, 0.81, 0.86, 0.9, 0.95, 1], plants: [0.94, 0.95, 0.96, 0.97, 0.96, 0.98, 1] },
  }[selectedHouse.id] ?? { fruits: [0.76, 0.8, 0.84, 0.88, 0.8, 0.98, 1], plants: [0.96, 0.97, 0.98, 0.99, 0.82, 0.99, 1] };

  const trendDays = ["07 Aug", "08 Aug", "09 Aug", "10 Aug", "11 Aug", "12 Aug", "13 Aug"];
  const houseGrowthTrend = trendDays.map((day, index) => ({
    day,
    fruits: Math.round(totalFruits * trendMultipliers.fruits[index]!),
    plants: Math.round(totalPlants * trendMultipliers.plants[index]!),
  }));

  // Dynamic Water Stress
  const totalTracked = healthyPlants + selectedSummary.crop.stressed + criticalDisease + suspectedDisease;
  const optPct = Math.round((healthyPlants / totalTracked) * 100);
  const modPct = Math.round((selectedSummary.crop.stressed / totalTracked) * 100);
  const highPct = Math.max(1, 100 - optPct - modPct);
  const houseWaterStress = [
    { name: "Optimal", value: optPct },
    { name: "Moderate", value: modPct },
    { name: "High", value: highPct },
  ];

  const houseWaterTrend = [
    { day: "Mon", stress: Math.max(4, Math.round(modPct * 1.1)) },
    { day: "Tue", stress: Math.max(3, Math.round(modPct * 0.9)) },
    { day: "Wed", stress: Math.max(5, Math.round(modPct * 1.2)) },
    { day: "Thu", stress: Math.max(4, Math.round(modPct * 1.0)) },
    { day: "Fri", stress: Math.max(2, Math.round(modPct * 0.7)) },
    { day: "Sat", stress: Math.max(3, Math.round(modPct * 0.8)) },
    { day: "Sun", stress: Math.max(3, modPct) },
  ];

  const affectedRows = [
    { row: `Row 03`, level: "moderate" },
    { row: `Row 07`, level: "moderate" },
    { row: `Row ${String(Math.min(15, selectedHouse.rows)).padStart(2, "0")}`, level: "moderate" },
    { row: `Row ${String(Math.min(19, selectedHouse.rows)).padStart(2, "0")}`, level: "high" },
  ];

  return (
    <AppShell title="Crop Intelligence">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Crop Intelligence
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              AI Monitored
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
            <span>AI inspection results for</span>
            <strong className="text-foreground font-semibold">{selectedHouse.name}</strong>
            <span>·</span>
            <span>{selectedHouse.location}</span>
            <span>·</span>
            <span>13 August 2026</span>
          </p>
        </div>

        <Link
          to="/polyhouses/$id"
          params={{ id: selectedHouse.id }}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-xs"
        >
          <Building2 className="size-3.5 text-emerald-500 group-hover:text-white" />
          View Digital Twin Map <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Polyhouse Switcher Bar */}
      <div className="rounded-2xl border border-border/70 bg-card p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Polyhouse</p>
              <p className="text-xs text-foreground font-medium">Switch structure to analyze crop telemetry</p>
            </div>
          </div>

          {/* Polyhouse Options Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {polyhouses.map((house) => {
              const isSelected = house.id === selectedHouseId;
              return (
                <button
                  key={house.id}
                  onClick={() => handleHouseSelect(house.id)}
                  className={cn(
                    "group relative flex items-center justify-between gap-3 rounded-xl border p-2.5 sm:p-3 text-left transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30"
                      : "border-border/70 bg-background/80 hover:border-border hover:bg-accent/40"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground"
                      )}
                    >
                      <Home className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={cn("text-xs sm:text-sm font-bold truncate", isSelected ? "text-emerald-700 dark:text-emerald-300" : "text-foreground")}>
                          {house.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                        <MapPin className="size-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{house.location.split(",")[0]}</span>
                        <span>·</span>
                        <span className="font-semibold text-foreground/80">{house.plants.toLocaleString()} plants</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        house.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : house.status === "Idle"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          house.status === "Active"
                            ? "bg-emerald-500 animate-pulse"
                            : house.status === "Idle"
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        )}
                      />
                      {house.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Bot className="size-2.5 text-emerald-500" /> {house.rover}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-[14px] transition-colors font-medium cursor-pointer",
              tab === t
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: PLANTS */}
      {tab === "Plants" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              label="Total Plants"
              value={totalPlants.toLocaleString()}
              hint={`${selectedHouse.rows} Active Rows`}
              tone="sage"
            />
            <KpiCard
              label="Inspected"
              value={inspectedPlants.toLocaleString()}
              delta={`${inspectionRate}%`}
              hint="High confidence"
              tone="mint"
            />
            <KpiCard
              label="Missing"
              value={String(missingPlants)}
              hint="Not detected by rover"
              tone="peach"
            />
            <KpiCard label="Total Plants" value={totalPlantsCount.toLocaleString()} tone="sage" />
            <KpiCard label="Inspected" value={totalPlantsCount.toLocaleString()} delta="100%" tone="mint" />
            <KpiCard label="Anomalies" value={String(apiAnomalies.length)} hint="AI Flagged" tone="peach" />
          </div>

          <Surface className="p-0 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={`Search ${selectedHouse.name} plants or rows...`}
                  value={plantSearch}
                  onChange={(e) => setPlantSearch(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-muted/40 pl-9 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500 focus:bg-card"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(["all", "Healthy", "Suspected", "Critical"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setPlantFilter(st)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                      plantFilter === st
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {st === "all" ? "All Statuses" : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                    {["Plant ID", "Row", "Position", "Status", "Fruit Count", "Last Inspection", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlants.map((p) => (
                  {plantsList.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setDrawer(p)}
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50"
                    >
                      <td className="px-5 py-3 font-semibold text-foreground flex items-center gap-2">
                        <span className="text-emerald-500">🌱</span> {p.id}
                      </td>
                      <td className="px-5 py-3">{p.row}</td>
                      <td className="px-5 py-3">Pos {p.position}</td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge>
                      </td>
                      <td className="px-5 py-3 font-medium">{p.fruits} fruits</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.lastInspection}</td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                          Inspect →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {filteredPlants.length} plants for {selectedHouse.name}</span>
              <span>Click any plant row to open telemetry history</span>
            </div>
          </Surface>
        </div>
      )}

      {/* TAB 2: DISEASE */}
      {tab === "Disease" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Healthy Plants" value={healthyPlants.toLocaleString()} tone="mint" hint="Zero infection signs" />
            <KpiCard label="Suspected" value={String(suspectedDisease)} tone="butter" hint="Requires confirmation" />
            <KpiCard label="High Priority" value={String(criticalDisease)} tone="peach" hint="Action required" />
            <KpiCard label="Healthy" value="1,192" tone="mint" />
            <KpiCard label="Suspected" value="42" tone="butter" />
            <KpiCard label="High Priority" value={String(anomaliesList.length)} tone="peach" />
          </div>

          <Surface className="p-0">
            <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card">
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Disease Flag Log · {selectedHouse.name}</h3>
                <p className="text-xs text-muted-foreground">Immutable rover vision detections and operator review status</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {houseDiseases.length} flags detected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                    {["Plant ID", "Row", "Disease Detected", "AI Confidence", "Status", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">
                        {h}
                      </th>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Plant", "Row", "Disease", "AI Confidence", "Probable Causes", "Status", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {houseDiseases.map((d) => (
                  {anomaliesList.map((d) => (
                    <tr
                      key={d.id || d.plant}
                      className={cn(
                        "border-b border-border/60 last:border-0 transition-colors",
                        d.confidence >= 90 && "bg-critical-soft/30"
                      )}
                    >
                      <td className="px-5 py-3 font-semibold text-foreground">{d.plant}</td>
                      <td className="px-5 py-3">Row {d.row}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{d.disease}</td>
                      <td className="px-5 py-3">
                        <span className={cn("font-semibold", d.confidence >= 90 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>
                          {d.confidence}%
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">{d.plant}</td>
                      <td className="px-5 py-3">{d.row}</td>
                      <td className="px-5 py-3">{d.disease}</td>
                      <td className="px-5 py-3">{d.confidence}%</td>
                      <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{d.causes}</td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={statusTone(d.status)}>{d.status}</StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canManage ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toast("Remark added", { description: `${d.plant} in ${selectedHouse.name}` })}
                              className="rounded-lg border border-border px-2.5 py-1 text-[12px] font-medium hover:bg-accent cursor-pointer"
                            >
                              Remark
                            </button>
                            <button
                              onClick={() => toast.success(`${d.plant} marked resolved`)}
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              Resolve
                            </button>
                          </div>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">Read only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
              AI predictions for {selectedHouse.name} are immutable — reviews and remarks are recorded alongside them.
            </p>
          </Surface>
        </div>
      )}

      {/* TAB 3: FRUITS */}
      {tab === "Fruits" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <Surface className="flex flex-col justify-center">
              <p className="text-[13px] text-muted-foreground">Total Fruits · {selectedHouse.name}</p>
              <p className="mt-2 text-[44px] font-extrabold leading-none tracking-tight text-foreground">
                {totalFruits.toLocaleString()}
              </p>
              <p className="mt-3 text-[13px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ↑ 8.6% vs yesterday
              </p>
              <div className="mt-6 space-y-3">
                <MetricRow label="Average / Plant" value={`${avgFruitsPerPlant} Fruits`} />
                <MetricRow
                  label="Highest Production Row"
                  value={`${houseRowProduction[0]?.row} · ${houseRowProduction[0]?.fruits} Fruits`}
                />
                <MetricRow label="Assigned Rover" value={`${selectedHouse.rover}`} />
              </div>
            </Surface>

            <Surface>
              <CardTitle>Row Ranking · {selectedHouse.name}</CardTitle>
              <div className="space-y-3.5">
                {houseRowProduction.map((r) => (
                  <div key={r.row}>
                    <div className="mb-1.5 flex justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">{r.row}</span>
                      <span className="font-bold text-foreground">{r.fruits} fruits</span>
                    </div>
                    <ProgressBar value={(r.fruits / maxRowFruits) * 100} />
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          <Surface className="p-0">
            <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card">
              <h3 className="text-sm font-bold text-foreground">Top Fruit Bearing Plants · {selectedHouse.name}</h3>
              <span className="text-xs text-muted-foreground">Click to inspect plant telemetry</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                    {["Plant", "Row", "Current Fruits", "Previous", "Change"].map((h) => (
                      <th key={h} className="px-5 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {housePlants.slice(0, 8).map((p) => (
                  {plantsList.slice(0, 8).map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setDrawer(p)}
                      className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-foreground">{p.id}</td>
                      <td className="px-5 py-3">{p.row}</td>
                      <td className="px-5 py-3 font-bold text-foreground">{p.fruits}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.previousFruits}</td>
                      <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        +{(((p.fruits - p.previousFruits) / p.previousFruits) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        </div>
      )}

      {/* TAB 4: GROWTH */}
      {tab === "Growth" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <CardTitle>Fruit Trend · {selectedHouse.name}</CardTitle>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={houseGrowthTrend}>
                <defs>
                  <linearGradient id="fruitFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sage)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--sage)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={44} />
                <Tooltip {...chartTip} />
                <Area type="monotone" dataKey="fruits" stroke="var(--sage)" strokeWidth={2} fill="url(#fruitFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </Surface>

          <Surface>
            <CardTitle>Plants Inspected · {selectedHouse.name}</CardTitle>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={houseGrowthTrend}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={44} />
                <Tooltip {...chartTip} />
                <Line type="monotone" dataKey="plants" stroke="var(--mint)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Surface>

          <Surface className="lg:col-span-2">
            <CardTitle>Plants Lagging In Growth · {selectedHouse.name}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              {housePlants.slice(10, 13).map((p) => (
                <div key={p.id} className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-[14px] font-bold text-foreground">🌱 {p.id}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {p.row} · Position {p.position}
                  </p>
              {plantsList.slice(0, 3).map((p) => (
                <div key={p.id} className="rounded-xl bg-cream p-4">
                  <p className="text-[14px] font-medium">🌱 {p.id}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{p.row} · Position {p.position}</p>
                  <div className="mt-3 flex items-end gap-4 text-[13px]">
                    <div>
                      <p className="text-muted-foreground text-xs">Previous</p>
                      <p className="font-semibold">{p.previousFruits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Current</p>
                      <p className="font-semibold">{p.fruits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Growth</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{(((p.fruits - p.previousFruits) / p.previousFruits) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      )}

      {/* TAB 5: WATER STRESS */}
      {tab === "Water Stress" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <CardTitle>Stress Distribution · {selectedHouse.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative min-w-[180px] flex-1">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={houseWaterStress}
                      dataKey="value"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={2}
                      cornerRadius={8}
                      stroke="none"
                    >
                      {["var(--healthy)", "var(--warning)", "var(--critical)"].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTip} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-bold leading-none">{houseWaterStress[0]?.value}%</span>
                  <span className="text-[11px] text-muted-foreground">Optimal</span>
                </div>
              </div>

              <div className="space-y-3 text-[13px]">
                {houseWaterStress.map((w, i) => (
                  <div key={w.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: ["var(--healthy)", "var(--warning)", "var(--critical)"][i] }}
                    />
                    <span className="text-muted-foreground">{w.name}</span>
                    <span className="font-semibold text-foreground">{w.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Surface>

          <Surface>
            <CardTitle>Weekly Stress Trend · {selectedHouse.name}</CardTitle>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={houseWaterTrend}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={30} />
                <Tooltip {...chartTip} />
                <Line type="monotone" dataKey="stress" stroke="var(--warning)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Surface>

          <Surface className="lg:col-span-2">
            <CardTitle>Affected Rows in {selectedHouse.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {affectedRows.map((r) => (
                <span
                  key={r.row}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-semibold",
                    r.level === "high"
                      ? "bg-critical-soft text-critical border border-critical/30"
                      : "bg-warning-soft text-warning border border-warning/30"
                  )}
                >
                  {r.row} · {r.level} stress
                </span>
              ))}
            </div>
          </Surface>
        </div>
      )}

      {/* PLANT INSPECTION DRAWER */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-xs" onClick={() => setDrawer(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-2xl duration-300 animate-in slide-in-from-right">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="section-title text-foreground">🌱 {drawer.id}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {selectedHouse.name} · {drawer.row} · Position {drawer.position}
                </p>
              </div>
              <button
                onClick={() => setDrawer(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent cursor-pointer"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              <StatusBadge tone={statusTone(drawer.status)}>{drawer.status}</StatusBadge>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted/40 py-3">
                <p className="text-[12px] text-muted-foreground">Current</p>
                <p className="mt-1 text-[18px] font-bold text-foreground">{drawer.fruits}</p>
              </div>
              <div className="rounded-xl bg-muted/40 py-3">
                <p className="text-[12px] text-muted-foreground">Previous</p>
                <p className="mt-1 text-[18px] font-bold text-foreground">{drawer.previousFruits}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/15 py-3">
                <p className="text-[12px] text-muted-foreground">Change</p>
                <p className="mt-1 text-[18px] font-bold text-emerald-600 dark:text-emerald-400">
                  +{(((drawer.fruits - drawer.previousFruits) / drawer.previousFruits) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-[13px] font-bold text-foreground">Fruit trend</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart
                  data={[
                    { d: "11 Aug", f: drawer.previousFruits },
                    { d: "12 Aug", f: Math.round((drawer.previousFruits + drawer.fruits) / 2) },
                    { d: "13 Aug", f: drawer.fruits },
                  ]}
                >
                  <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip {...chartTip} />
                  <Line type="monotone" dataKey="f" stroke="var(--sage)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6">
              <p className="mb-2 text-[13px] font-bold text-foreground">Inspection history</p>
              <MetricRow label="13 Aug" value={`${drawer.fruits} fruits`} />
              <MetricRow label="12 Aug" value={`${Math.round((drawer.previousFruits + drawer.fruits) / 2)} fruits`} />
              <MetricRow label="11 Aug" value={`${drawer.previousFruits} fruits`} />
            </div>

            {canManage && (
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => toast("Remark added", { description: `${drawer.id} in ${selectedHouse.name}` })}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-semibold hover:bg-accent cursor-pointer"
                >
                  Add Remark
                </button>
                <button
                  onClick={() => toast.success(`Marked action required for ${drawer.id}`)}
                  className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                >
                  Action Required
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
