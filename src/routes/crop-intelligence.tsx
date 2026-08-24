import { createFileRoute } from "@tanstack/react-router";
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
import { X } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import {
  CardTitle,
  KpiCard,
  MetricRow,
  PageHeader,
  ProgressBar,
  StatusBadge,
  Surface,
  statusTone,
} from "@/components/app/ui-kit";
import { useAnomalies, usePolyhouses } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crop-intelligence")({
  head: () => ({
    meta: [
      { title: "Crop Intelligence · BellPepper AI" },
      { name: "description", content: "AI plant detection, disease review, fruit counting, growth monitoring and water stress in one place." },
      { property: "og:title", content: "Crop Intelligence · BellPepper AI" },
      { property: "og:description", content: "Plants, disease, fruits, growth and water stress insights." },
    ],
  }),
  component: CropIntelligence,
});

const tabs = ["Plants", "Disease", "Fruits", "Growth", "Water Stress"] as const;
type Tab = (typeof tabs)[number];

const chartTip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--popover)",
    fontSize: 12,
  },
};

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
    plant: `Grid (${a.grid_x || 1}, ${a.grid_y || 1})`,
    row: `Row ${a.grid_y || 1}`,
    disease: a.issue_type || a.title,
    confidence: Math.round((a.ai_confidence <= 1 ? a.ai_confidence * 100 : a.ai_confidence) || 90),
    status: a.status,
  }));

  return (
    <AppShell title="Crop Intelligence">
      <PageHeader title="Crop Intelligence" subtitle="AI inspection results for Greenhouse 01 · 13 August 2026" />

      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-[14px] transition-colors",
              tab === t
                ? "border-sage font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Plants" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Total Plants" value={totalPlantsCount.toLocaleString()} tone="sage" />
            <KpiCard label="Inspected" value={totalPlantsCount.toLocaleString()} delta="100%" tone="mint" />
            <KpiCard label="Anomalies" value={String(apiAnomalies.length)} hint="AI Flagged" tone="peach" />
          </div>
          <Surface className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Plant ID", "Row", "Position", "Status", "Last Inspection"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plantsList.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setDrawer(p)}
                      className="cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50"
                    >
                      <td className="px-5 py-3 font-medium">{p.id}</td>
                      <td className="px-5 py-3">{p.row}</td>
                      <td className="px-5 py-3">{p.position}</td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{p.lastInspection}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        </div>
      )}

      {tab === "Disease" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Healthy" value="1,192" tone="mint" />
            <KpiCard label="Suspected" value="42" tone="butter" />
            <KpiCard label="High Priority" value={String(anomaliesList.length)} tone="peach" />
          </div>
          <Surface className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Plant", "Row", "Disease", "Confidence", "Status", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anomaliesList.map((d) => (
                    <tr
                      key={d.plant}
                      className={cn(
                        "border-b border-border/60 last:border-0",
                        d.confidence >= 90 && "bg-critical-soft/50",
                      )}
                    >
                      <td className="px-5 py-3 font-medium">{d.plant}</td>
                      <td className="px-5 py-3">{d.row}</td>
                      <td className="px-5 py-3">{d.disease}</td>
                      <td className="px-5 py-3">{d.confidence}%</td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={statusTone(d.status)}>{d.status}</StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {canManage ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => toast("Remark added", { description: d.plant })}
                              className="rounded-lg border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
                            >
                              Remark
                            </button>
                            <button
                              onClick={() => toast.success(`${d.plant} marked resolved`)}
                              className="rounded-lg border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
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
              AI predictions are immutable — reviews and remarks are recorded alongside them.
            </p>
          </Surface>
        </div>
      )}

      {tab === "Fruits" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <Surface className="flex flex-col justify-center">
              <p className="text-[13px] text-muted-foreground">Total Fruits</p>
              <p className="mt-2 text-[44px] font-medium leading-none tracking-tight">3,682</p>
              <p className="mt-3 text-[13px] text-sage">↑ 8.6% vs yesterday</p>
              <div className="mt-6 space-y-3">
                <MetricRow label="Average / Plant" value="2.95" />
                <MetricRow label="Highest Production Row" value="Row 12 · 428 Fruits" />
                <MetricRow label="Highest Producing Plant" value="P-1248 · 18 Fruits" />
              </div>
            </Surface>
            <Surface>
              <CardTitle>Row Ranking</CardTitle>
              <div className="space-y-3.5">
                {rowProduction.map((r) => (
                  <div key={r.row}>
                    <div className="mb-1.5 flex justify-between text-[13px]">
                      <span className="text-muted-foreground">{r.row}</span>
                      <span className="font-medium">{r.fruits}</span>
                    </div>
                    <ProgressBar value={(r.fruits / 428) * 100} />
                  </div>
                ))}
              </div>
            </Surface>
          </div>
          <Surface className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Plant", "Row", "Current Fruits", "Previous", "Change"].map((h) => (
                      <th key={h} className="px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plantsList.slice(0, 8).map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setDrawer(p)}
                      className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/50"
                    >
                      <td className="px-5 py-3 font-medium">{p.id}</td>
                      <td className="px-5 py-3">{p.row}</td>
                      <td className="px-5 py-3">{p.fruits}</td>
                      <td className="px-5 py-3 text-muted-foreground">{p.previousFruits}</td>
                      <td className="px-5 py-3 text-sage">
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

      {tab === "Growth" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <CardTitle>Fruit Trend</CardTitle>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={growthTrend}>
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
            <CardTitle>Plants Inspected</CardTitle>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={growthTrend}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={44} />
                <Tooltip {...chartTip} />
                <Line type="monotone" dataKey="plants" stroke="var(--mint)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Surface>
          <Surface className="lg:col-span-2">
            <CardTitle>Plants Lagging</CardTitle>
            <div className="grid gap-4 sm:grid-cols-3">
              {plantsList.slice(0, 3).map((p) => (
                <div key={p.id} className="rounded-xl bg-cream p-4">
                  <p className="text-[14px] font-medium">🌱 {p.id}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{p.row} · Position {p.position}</p>
                  <div className="mt-3 flex items-end gap-4 text-[13px]">
                    <div>
                      <p className="text-muted-foreground">Previous</p>
                      <p className="font-medium">{p.previousFruits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="font-medium">{p.fruits}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Growth</p>
                      <p className="font-medium text-sage">
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

      {tab === "Water Stress" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <CardTitle>Stress Distribution</CardTitle>
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative min-w-[180px] flex-1">
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={waterStress}
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
                  <span className="text-[22px] font-bold leading-none">{waterStress[0]?.value}%</span>
                  <span className="text-[11px] text-muted-foreground">Optimal</span>
                </div>
              </div>

              <div className="space-y-3 text-[13px]">
                {waterStress.map((w, i) => (
                  <div key={w.name} className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: ["var(--healthy)", "var(--warning)", "var(--critical)"][i] }}
                    />
                    <span className="text-muted-foreground">{w.name}</span>
                    <span className="font-medium">{w.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Surface>
          <Surface>
            <CardTitle>Weekly Stress Trend</CardTitle>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={waterTrend}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={30} />
                <Tooltip {...chartTip} />
                <Line type="monotone" dataKey="stress" stroke="var(--warning)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Surface>
          <Surface className="lg:col-span-2">
            <CardTitle>Affected Rows</CardTitle>
            <div className="flex flex-wrap gap-2">
              {["Row 03", "Row 07", "Row 15", "Row 19"].map((r) => (
                <span key={r} className="rounded-full bg-warning-soft px-3 py-1.5 text-[12px] font-medium text-warning">
                  {r} · moderate
                </span>
              ))}
              <span className="rounded-full bg-critical-soft px-3 py-1.5 text-[12px] font-medium text-critical">
                Row 21 · high
              </span>
            </div>
          </Surface>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setDrawer(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-[var(--shadow-lift)] duration-300 animate-in slide-in-from-right">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="section-title">🌱 {drawer.id}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {drawer.row} · Position {drawer.position}
                </p>
              </div>
              <button onClick={() => setDrawer(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4">
              <StatusBadge tone={statusTone(drawer.status)}>{drawer.status}</StatusBadge>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-cream py-3">
                <p className="text-[12px] text-muted-foreground">Current</p>
                <p className="mt-1 text-[18px] font-medium">{drawer.fruits}</p>
              </div>
              <div className="rounded-xl bg-cream py-3">
                <p className="text-[12px] text-muted-foreground">Previous</p>
                <p className="mt-1 text-[18px] font-medium">{drawer.previousFruits}</p>
              </div>
              <div className="rounded-xl bg-sage-soft py-3">
                <p className="text-[12px] text-muted-foreground">Change</p>
                <p className="mt-1 text-[18px] font-medium text-sage">
                  +{(((drawer.fruits - drawer.previousFruits) / drawer.previousFruits) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-[13px] font-medium">Fruit trend</p>
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
              <p className="mb-2 text-[13px] font-medium">Inspection history</p>
              <MetricRow label="13 Aug" value={`${drawer.fruits} fruits`} />
              <MetricRow label="12 Aug" value={`${Math.round((drawer.previousFruits + drawer.fruits) / 2)} fruits`} />
              <MetricRow label="11 Aug" value={`${drawer.previousFruits} fruits`} />
            </div>

            {canManage && (
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => toast("Remark added", { description: drawer.id })}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-medium hover:bg-accent"
                >
                  Add Remark
                </button>
                <button
                  onClick={() => toast.success("Marked action required")}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
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
