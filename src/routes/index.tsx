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
import { usePolyhouses, useRovers, useAlerts, useAnomalies } from "@/hooks/use-api";
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

// Polyhouse estate data processed dynamically from backend API

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
    const signedIn = sessionStorage.getItem("edhasfarms-authenticated") === "true";
    setAuthorised(signedIn);
    if (!signedIn) navigate({ to: "/login", replace: true });
  }, [navigate]);

  if (authorised !== true) {
    return <div className="min-h-screen bg-background" />;
  }

  return <DashboardContent />;
}

function DashboardContent() {
  const { data: polyhouses } = usePolyhouses();
  const { data: fleet } = useRovers();
  const { data: apiAlerts } = useAlerts();

  const [selectedHouseId, setSelectedHouseId] = useState("");
  const selectedHouse = polyhouses.find((h) => h.id === selectedHouseId) || polyhouses[0];
  const [roverId, setRoverId] = useState("");
  const activeRover = fleet.find((f) => f.id === roverId) || fleet[0];

  const housePlantCount = selectedHouse ? (selectedHouse.grid_rows || 10) * (selectedHouse.grid_bays || 10) * 10 : 0;
  const selectedGrowthTrend = selectedHouse
    ? [
        { day: "Today", plants: Math.round(housePlantCount * 0.95), fruits: housePlantCount * 3 },
        { day: "Yesterday", plants: Math.round(housePlantCount * 0.92), fruits: Math.round(housePlantCount * 2.8) }
      ]
    : [];

  const { data: apiAnomalies } = useAnomalies();
  const weather = useWeather();

  const totalDisease = apiAnomalies.length > 0 ? apiAnomalies.length : apiAlerts.filter((a) => a.severity === "Critical").length;

  const totalPlants = polyhouses.reduce((s, p) => s + (p.grid_rows || 10) * (p.grid_bays || 10) * 10, 0);
  const totalFruits = polyhouses.reduce((s, p) => s + (p.grid_rows || 10) * (p.grid_bays || 10) * 30, 0);

  const healthyPercent = totalPlants > 0 ? Math.max(0, Math.round(((totalPlants - totalDisease) / totalPlants) * 100)) : 100;

  const healthSplit = [
    { name: "Healthy", value: totalPlants > 0 ? Math.max(0, totalPlants - totalDisease) : 0, color: "var(--leaf)" },
    { name: "Water stress", value: Math.round(totalDisease * 0.2), color: "var(--teal)" },
    { name: "Suspected", value: Math.round(totalDisease * 0.3), color: "var(--saffron)" },
    { name: "Diseased", value: totalDisease, color: "var(--critical)" },
  ];

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

      {selectedHouse && <HouseSummary id={selectedHouse.id} onSelect={setSelectedHouseId} />}

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
            Production trend — {selectedHouse?.name || "No Polyhouse"}
          </CardTitle>
          <div className="h-[180px]">
            {selectedHouse ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No polyhouses in database</div>
            )}
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
            Growth trend — {selectedHouse?.name || "No Polyhouse"}
          </CardTitle>
          <div className="h-[180px]">
            {selectedHouse ? (
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
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No polyhouses in database</div>
            )}
          </div>
        </Surface>

        <Surface className="p-4">
          <CardTitle>Rover Fleet</CardTitle>
          <div className="space-y-3">
            {fleet.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No rovers registered in database</p>
            ) : (
              fleet.map((f) => (
                <div key={f.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{f.name || f.id}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{f.polyhouse_id || "Unassigned"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[12px] text-muted-foreground">{f.battery_level}%</span>
                    <StatusBadge tone={statusTone(f.status)}>{f.status}</StatusBadge>
                  </div>
                </div>
              ))
            )}
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
            {apiAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No active alerts</p>
            ) : (
              apiAlerts.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${a.severity === "Critical"
                      ? "bg-critical"
                      : a.severity === "Warning"
                        ? "bg-warning"
                        : "bg-teal"
                      }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px]">{a.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {a.category} · {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Surface>

        {/* Rover telemetry card adjacent to Critical alerts */}
        <Surface className="flex flex-col justify-between gap-3 p-4">
          {activeRover ? (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <select
                  value={activeRover.id}
                  onChange={(e) => setRoverId(e.target.value)}
                  aria-label="Select rover"
                  className="w-full min-w-0 truncate rounded-lg border border-border bg-card px-2 py-1.5 text-[12px] font-medium outline-none"
                >
                  {fleet.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name || f.id} · {f.polyhouse_id || "Unassigned"}
                    </option>
                  ))}
                </select>
                <StatusBadge tone={statusTone(activeRover.status)}>{activeRover.status}</StatusBadge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "Interval", v: `${activeRover.inspection_interval_hours || 4} hrs` },
                  { l: "Speed", v: `${activeRover.scan_speed_m_s || 0.5} m/s` },
                  { l: "Battery", v: `${activeRover.battery_level || 85}%` },
                  { l: "Duration", v: `${activeRover.inspection_duration_mins || 30} m` },
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
                  <span className="font-semibold text-foreground">75%</span>
                </div>
                <ProgressBar value={75} />
              </div>

              <Link
                to="/live-rover"
                className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                View full details <ArrowRight className="size-3.5" />
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <p className="text-xs font-semibold text-foreground">No Rovers Deployed</p>
              <p className="text-[11px] text-muted-foreground mt-1">Deploy a rover unit to see telemetry</p>
            </div>
          )}
        </Surface>
      </div>

      {/* Full-width Polyhouse Live Map */}
      <div className="w-full">
        <PolyhouseMap
          title={selectedHouse?.name || "Polyhouse Estate"}
          subtitle={selectedHouse ? `Live inspection · ${selectedHouse.name}` : "No Polyhouses Registered"}
          height="h-[320px]"
          rover={activeRover ? {
            id: activeRover.id,
            serial: "BP-RVR-2025-0031",
            firmware: "v2.4.1",
            status: activeRover.status as any,
            battery: activeRover.battery_level,
            speed: activeRover.scan_speed_m_s,
            row: "Row 01",
            polyhouse: activeRover.polyhouse_id || "Unassigned",
            lat: 22.5726,
            lng: 88.3639,
            lastComm: activeRover.last_ping ? new Date(activeRover.last_ping).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
          } : undefined}
          offline={activeRover?.status === "Offline"}
        />
      </div>
    </AppShell>
  );
}
