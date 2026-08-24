import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bug, Droplets, Leaf, Sprout, Building2, Bot, Sun, CloudSun, CloudRain, CloudLightning } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { PolyhouseMap } from "@/components/app/PolyhouseMap";
import { HouseSummary } from "@/components/app/HouseSummary";

import {
  KpiCard,
  ProgressBar,
  StatusBadge,
  Surface,
  CardTitle,
  statusTone,
} from "@/components/app/ui-kit";
import { alerts, fleet, houseSummary, polyhouses } from "@/lib/mock-data";
import { drift, useTick } from "@/hooks/use-live-telemetry";
import { useWeather } from "@/hooks/use-weather";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Edhasfarms" },
      {
        name: "description",
        content:
          "Overview of every polyhouse: crop health charts, fruit production, Rover telemetry and live inspection map.",
      },
      { property: "og:title", content: "Edhasfarms" },
      {
        property: "og:description",
        content: "Overview of every polyhouse: crop health charts, fruit production, Rover telemetry and live inspection map.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const estate = polyhouses.map((p, i) => ({
  name: p.name.replace("Greenhouse ", "GH-"),
  id: p.id,
  plants: p.plants,
  fruits: [3682, 2410, 4120][i] ?? 2000,
  disease: [14, 6, 21][i] ?? 0,
  health: [92, 88, 79][i] ?? 85,
}));

const trendMultipliers: Record<string, { fruits: number[]; plants: number[] }> = {
  "Poly-01": { fruits: [0.76, 0.8, 0.84, 0.88, 0.8, 0.98, 1], plants: [0.96, 0.97, 0.98, 0.99, 0.82, 0.99, 1] },
  "Poly-02": { fruits: [0.82, 0.79, 0.85, 0.91, 0.87, 0.94, 1], plants: [0.98, 0.97, 0.97, 0.98, 0.95, 0.99, 1] },
  "Poly-03": { fruits: [0.71, 0.76, 0.81, 0.86, 0.9, 0.95, 1], plants: [0.94, 0.95, 0.96, 0.97, 0.96, 0.98, 1] },
};

const trendDays = ["07 Aug", "08 Aug", "09 Aug", "10 Aug", "11 Aug", "12 Aug", "13 Aug"];

const axis = {
  stroke: "var(--border)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
} as const;

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  fontSize: 12,
  boxShadow: "var(--shadow-lift)",
} as const;

function Dashboard() {
  const navigate = useNavigate();
  const [authorised, setAuthorised] = useState<boolean | null>(null);

  useEffect(() => {
    const signedIn = localStorage.getItem("edhasfarms-authenticated") === "true";
    setAuthorised(signedIn);
    if (!signedIn) navigate({ to: "/login", replace: true });
  }, [navigate]);

  if (authorised !== true) {
    return <div className="min-h-screen bg-background" />;
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const [selectedHouseId, setSelectedHouseId] = useState(polyhouses[0]!.id);
  const selectedHouse = polyhouses.find((house) => house.id === selectedHouseId) ?? polyhouses[0]!;
  const selectedSummary = houseSummary[selectedHouse.id] ?? houseSummary[polyhouses[0]!.id]!;
  const multipliers = trendMultipliers[selectedHouse.id] ?? trendMultipliers[polyhouses[0]!.id]!;
  const selectedGrowthTrend = trendDays.map((day, index) => ({
    day,
    fruits: Math.round(selectedSummary.crop.fruits * multipliers.fruits[index]!),
    plants: Math.round(selectedHouse.plants * multipliers.plants[index]!),
  }));
  const healthSplit = [
    { name: "Healthy", value: selectedSummary.crop.healthy, color: "var(--leaf)" },
    { name: "Water stress", value: selectedSummary.crop.stressed, color: "var(--teal)" },
    { name: "Suspected", value: selectedSummary.crop.suspected, color: "var(--saffron)" },
    { name: "Diseased", value: selectedSummary.crop.diseased, color: "var(--critical)" },
  ];
  const healthyPercent = Math.round(
    (selectedSummary.crop.healthy / healthSplit.reduce((total, segment) => total + segment.value, 0)) * 100,
  );
  const tick = useTick(5000);
  const weather = useWeather();
  const totalPlants = drift(estate.reduce((s, e) => s + e.plants, 0), tick, 11, { pct: 0.004 });
  const totalFruits = drift(estate.reduce((s, e) => s + e.fruits, 0), tick, 12, { pct: 0.005 });
  const totalDisease = drift(estate.reduce((s, e) => s + e.disease, 0), tick, 13, { abs: 2 });

  const sortedFleet = [...fleet].sort((a, b) => a.lastSeenSec - b.lastSeenSec);
  const [roverId, setRoverId] = useState(sortedFleet[0]!.id);
  const activeRover = fleet.find((f) => f.id === roverId) ?? sortedFleet[0]!;
  const live = {
    battery: drift(activeRover.battery, tick, 21, { abs: 1 }),
    speed: drift(activeRover.speed, tick, 22, { abs: 0.05, decimals: 2 }),
    progress: Math.min(100, drift(activeRover.progress, tick, 23, { abs: 1 })),
  };

  return (
    <AppShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Polyhouses" value={String(polyhouses.length)} hint="All monitored" tone="indigo" icon={<Building2 className="size-4" />} to="/polyhouses" linkLabel="Open polyhouses" />
        <KpiCard label="Plants" value={totalPlants.toLocaleString()} delta="↑ 4.2%" hint="inspected" tone="mint" icon={<Sprout className="size-4" />} to="/crop-intelligence" linkLabel="Open crop intelligence" />
        <KpiCard label="Fruits" value={totalFruits.toLocaleString()} delta="↑ 8.6%" hint="vs yesterday" tone="sage" icon={<Leaf className="size-4" />} to="/crop-intelligence" linkLabel="Open fruit analytics" />
        <KpiCard label="Disease" value={String(totalDisease)} hint="Needs attention" tone="peach" icon={<Bug className="size-4" />} to="/crop-intelligence" linkLabel="Open disease review" />
        <div onClick={weather.permissionDenied ? weather.requestLocation : undefined} className={weather.permissionDenied ? "cursor-pointer" : ""}>
          <KpiCard
            label={weather.cityName ? weather.cityName.toUpperCase() : "LOCATION"}
            value={
              weather.loading
                ? "Locating..."
                : weather.permissionDenied
                  ? "Allow Location"
                  : weather.temp !== null
                    ? `${weather.temp}°C`
                    : "--"
            }
            delta={weather.condition}
            hint={
              weather.permissionDenied
                ? "Click to grant GPS access"
                : weather.loading
                  ? "Fetching GPS & weather..."
                  : `💧 ${weather.humidity}% · 💨 ${weather.windSpeed} km/h`
            }
            tone="sky"
            icon={
              weather.weatherCode !== null && weather.weatherCode >= 51 && weather.weatherCode <= 82 ? (
                <CloudRain className="size-4" />
              ) : weather.weatherCode !== null && weather.weatherCode >= 95 ? (
                <CloudLightning className="size-4" />
              ) : weather.weatherCode !== null && weather.weatherCode >= 1 && weather.weatherCode <= 3 ? (
                <CloudSun className="size-4" />
              ) : (
                <Sun className="size-4" />
              )
            }
            linkLabel={weather.permissionDenied ? "Grant location access" : "Real-time forecast"}
          />
        </div>
      </div>

      <HouseSummary id={selectedHouse.id} onSelect={setSelectedHouseId} />

      {/* Estate analytics — compact horizontal + vertical grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Surface className="p-4">
          <CardTitle
            right={
              <Link to="/polyhouses" className="text-[12px] text-sage hover:underline">
                All
              </Link>
            }
          >
            Production trend — {selectedHouse.name}
          </CardTitle>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedGrowthTrend} barGap={4} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis.tick} />
                <YAxis axisLine={false} tickLine={false} tick={axis.tick} width={40} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Bar dataKey="plants" name="Plants" fill="var(--teal)" radius={[6, 6, 0, 0]} maxBarSize={22} />
                <Bar dataKey="fruits" name="Fruits" fill="var(--leaf)" radius={[6, 6, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface className="p-4">
          <CardTitle>Crop health split</CardTitle>
          <div className="relative h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={46}
                  outerRadius={68}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                >
                  {healthSplit.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-x-0 top-[58px] text-center">
              <p className="text-[19px] font-bold leading-none">{healthyPercent}%</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Healthy</p>
            </div>
          </div>
        </Surface>

        <Surface className="p-4">
          <CardTitle right={<span className="text-[12px] text-muted-foreground">7 days</span>}>
            Growth trend — {selectedHouse.name}
          </CardTitle>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={selectedGrowthTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gFruits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPlants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axis.tick} minTickGap={12} />
                <YAxis axisLine={false} tickLine={false} tick={axis.tick} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="fruits" name="Fruits" stroke="var(--leaf)" strokeWidth={2} fill="url(#gFruits)" />
                <Area type="monotone" dataKey="plants" name="Plants" stroke="var(--teal)" strokeWidth={2} fill="url(#gPlants)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface className="p-4">
          <CardTitle>Rover</CardTitle>
          <div className="space-y-3">
            {fleet.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium">{f.id}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{f.polyhouse}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12px] text-muted-foreground">{f.battery}%</span>
                  <StatusBadge tone={statusTone(f.status)}>{f.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-4">
          <CardTitle
            right={
              <Link to="/alerts" className="text-[12px] text-sage hover:underline">
                View all
              </Link>
            }
          >
            Critical alerts
          </CardTitle>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${a.severity === "critical"
                    ? "bg-critical"
                    : a.severity === "warning"
                      ? "bg-warning"
                      : "bg-teal"
                    }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px]">{a.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {a.context} · {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Surface>

        {/* Rover telemetry card adjacent to Critical alerts */}
        <Surface className="flex flex-col justify-between gap-3 p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <select
              value={roverId}
              onChange={(e) => setRoverId(e.target.value)}
              aria-label="Select rover"
              className="w-full min-w-0 truncate rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] font-medium outline-none"
            >
              {sortedFleet.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.id} · {f.polyhouse}
                </option>
              ))}
            </select>
            <StatusBadge tone={statusTone(activeRover.status)}>{activeRover.status}</StatusBadge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "Row", v: activeRover.row.replace("Row ", "") },
              { l: "Speed", v: `${live.speed} m/s` },
              { l: "Battery", v: `${live.battery}%` },
              { l: "Runtime", v: activeRover.runtime },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-muted/50 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
                <p className="text-[14px] font-semibold">{s.v}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Route progress</span>
              <span className="font-semibold text-foreground">{live.progress}%</span>
            </div>
            <ProgressBar value={live.progress} />
          </div>

          <Link
            to="/live-rover"
            className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View full details <ArrowRight className="size-3.5" />
          </Link>
        </Surface>
      </div>

      {/* Full-width Polyhouse Live Map */}
      <div className="w-full">
        <PolyhouseMap
          title={activeRover.polyhouse}
          subtitle={`Live inspection · ${activeRover.id}`}
          height="h-[320px]"
          rover={activeRover}
          offline={activeRover.status === "Offline"}
        />
      </div>
    </AppShell>
  );
}
