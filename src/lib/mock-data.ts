export type Role = "Super Admin" | "Admin" | "Viewer";

export const currentUser = {
  name: "Edhaas",
  role: "Super Admin" as Role,
  email: "edhas@test.com",
};

export const polyhouses = [
  {
    id: "Poly-01",
    name: "Polyhouse 01",
    location: "Kolkata, West Bengal",
    area: "2,400 m²",
    length: "80 m",
    width: "30 m",
    rowSpacing: "1.2 m",
    plantSpacing: "0.45 m",
    rows: 24,
    plants: 1248,
    rover: "RVR-001",
    status: "Active" as const,
  },
  {
    id: "Poly-02",
    name: "Polyhouse 02",
    location: "Nashik, Maharashtra",
    area: "1,800 m²",
    length: "60 m",
    width: "30 m",
    rowSpacing: "1.2 m",
    plantSpacing: "0.45 m",
    rows: 18,
    plants: 912,
    rover: "RVR-002",
    status: "Idle" as const,
  },
  {
    id: "Poly-03",
    name: "Polyhouse 03",
    location: "Pune, Maharashtra",
    area: "3,100 m²",
    length: "100 m",
    width: "31 m",
    rowSpacing: "1.3 m",
    plantSpacing: "0.45 m",
    rows: 30,
    plants: 1560,
    rover: "RVR-003",
    status: "Maintenance" as const,
  },
];

export const rover = {
  id: "RVR-001",
  serial: "BP-RVR-2025-0031",
  firmware: "v2.4.1",
  status: "Online" as "Online" | "Offline" | "Charging",
  battery: 78,
  speed: 0.42,
  row: "Row 03",
  runtime: "5h 42m",
  distance: "2.8 km",
  lastComm: "10 sec ago",
  lat: 22.572645,
  lng: 88.363892,
  progress: 68,
  polyhouse: "Greenhouse 01",
  sensors: "All nominal",
  heartbeat: "10 sec ago",
  lastSeenSec: 10,
};

export const fleet = [
  { ...rover },
  {
    id: "RVR-002",
    serial: "BP-RVR-2025-0044",
    firmware: "v2.4.1",
    status: "Offline" as const,
    battery: 12,
    speed: 0,
    row: "—",
    runtime: "0h 00m",
    distance: "0.0 km",
    lastComm: "2 min 35 sec ago",
    lat: 19.997454,
    lng: 73.789803,
    progress: 0,
    polyhouse: "Greenhouse 02",
    sensors: "No telemetry",
    heartbeat: "2 min 35 sec ago",
    lastSeenSec: 155,
  },
  {
    id: "RVR-003",
    serial: "BP-RVR-2025-0052",
    firmware: "v2.3.9",
    status: "Charging" as const,
    battery: 46,
    speed: 0,
    row: "Dock",
    runtime: "3h 12m",
    distance: "1.4 km",
    lastComm: "1 min ago",
    lat: 18.52043,
    lng: 73.856743,
    progress: 100,
    polyhouse: "Greenhouse 03",
    sensors: "All nominal",
    heartbeat: "1 min ago",
    lastSeenSec: 60,
  },
];

export const kpis = [
  { label: "Plants", value: "1,248", delta: "↑ 4.2%", tone: "mint", hint: "Inspected today" },
  { label: "Fruits", value: "3,682", delta: "↑ 8.6%", tone: "sage", hint: "vs. yesterday" },
  { label: "Disease", value: "14", delta: "Needs attention", tone: "peach", hint: "High priority" },
  { label: "Water Stress", value: "8%", delta: "Low", tone: "sky", hint: "Across 24 rows" },
];

export const plants = Array.from({ length: 28 }, (_, i) => {
  const n = 1248 - i * 7;
  const statuses = ["Healthy", "Healthy", "Healthy", "Suspected", "Healthy", "Critical"] as const;
  return {
    id: `P-${String(n).padStart(4, "0")}`,
    row: `Row ${String((i % 24) + 1).padStart(2, "0")}`,
    position: 48 - i,
    status: statuses[i % statuses.length]!,
    lastInspection: i < 14 ? "13 Aug" : "12 Aug",
    fruits: 18 - (i % 12),
    previousFruits: 11 + (i % 5),
  };
});

export const diseases = [
  { plant: "P-0872", row: "08", disease: "Bacterial Spot", confidence: 94, status: "New" },
  { plant: "P-0914", row: "09", disease: "Powdery Mildew", confidence: 91, status: "Reviewed" },
  { plant: "P-1028", row: "07", disease: "Bacterial Spot", confidence: 88, status: "Action" },
  { plant: "P-0431", row: "04", disease: "Leaf Curl", confidence: 84, status: "Reviewed" },
  { plant: "P-0655", row: "06", disease: "Powdery Mildew", confidence: 81, status: "Resolved" },
  { plant: "P-1190", row: "12", disease: "Blossom End Rot", confidence: 79, status: "New" },
];

export const rowProduction = [
  { row: "Row 12", fruits: 428 },
  { row: "Row 08", fruits: 391 },
  { row: "Row 15", fruits: 374 },
  { row: "Row 04", fruits: 351 },
  { row: "Row 21", fruits: 322 },
  { row: "Row 02", fruits: 298 },
];

export const growthTrend = [
  { day: "07 Aug", fruits: 2810, plants: 1198 },
  { day: "08 Aug", fruits: 2954, plants: 1206 },
  { day: "09 Aug", fruits: 3080, plants: 1215 },
  { day: "10 Aug", fruits: 3222, plants: 1224 },
  { day: "11 Aug", fruits: 2942, plants: 1021 },
  { day: "12 Aug", fruits: 3601, plants: 1240 },
  { day: "13 Aug", fruits: 3682, plants: 1248 },
];

export const waterStress = [
  { name: "Low", value: 86 },
  { name: "Moderate", value: 10 },
  { name: "High", value: 4 },
];

export const waterTrend = [
  { day: "Mon", stress: 11 },
  { day: "Tue", stress: 9 },
  { day: "Wed", stress: 12 },
  { day: "Thu", stress: 10 },
  { day: "Fri", stress: 7 },
  { day: "Sat", stress: 8 },
  { day: "Sun", stress: 8 },
];

export const soilMetrics = [
  { label: "Moisture", value: "42%", tone: "healthy" },
  { label: "Total rows", value: "24", tone: "healthy" },
  { label: "Plants per row", value: "52", tone: "healthy" },
  { label: "Temperature", value: "24.8°C", tone: "healthy" },
];

export const soilTrend = [
  { t: "00:00", moisture: 44, temp: 22.4 },
  { t: "04:00", moisture: 43, temp: 21.9 },
  { t: "08:00", moisture: 41, temp: 23.6 },
  { t: "12:00", moisture: 39, temp: 26.1 },
  { t: "16:00", moisture: 40, temp: 25.4 },
  { t: "20:00", moisture: 42, temp: 24.8 },
];

export const rowPlantTrend = [
  { day: "07 Aug", totalRows: 23, plantsPerRow: 50 },
  { day: "08 Aug", totalRows: 23, plantsPerRow: 51 },
  { day: "09 Aug", totalRows: 24, plantsPerRow: 51 },
  { day: "10 Aug", totalRows: 24, plantsPerRow: 52 },
  { day: "11 Aug", totalRows: 24, plantsPerRow: 50 },
  { day: "12 Aug", totalRows: 24, plantsPerRow: 52 },
  { day: "13 Aug", totalRows: 24, plantsPerRow: 52 },
];

export type SoilCell = "healthy" | "warning" | "critical";
export const soilGrid: { row: string; cells: SoilCell[] }[] = Array.from({ length: 8 }, (_, i) => ({
  row: `Row ${String(i + 1).padStart(2, "0")}`,
  cells: Array.from({ length: 8 }, (_, j) => {
    const k = (i * 3 + j * 5) % 11;
    return k > 8 ? "critical" : k > 6 ? "warning" : "healthy";
  }),
}));

export type AlertStatus = "New" | "Acknowledged" | "In Progress" | "Resolved";
export type Alert = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  context: string;
  time: string;
  status: AlertStatus;
};

export const alerts: Alert[] = [
  {
    id: "AL-118",
    severity: "critical",
    title: "High Disease Detection",
    context: "Row 08 · P-0872",
    time: "10 minutes ago",
    status: "New",
  },
  {
    id: "AL-117",
    severity: "warning",
    title: "Low Soil Moisture",
    context: "Row 03 · Position 24.5m",
    time: "32 minutes ago",
    status: "Acknowledged",
  },
  {
    id: "AL-116",
    severity: "info",
    title: "Rover Inspection Complete",
    context: "Greenhouse 01",
    time: "1 hour ago",
    status: "Resolved",
  },
  {
    id: "AL-115",
    severity: "warning",
    title: "Water Stress Rising",
    context: "Row 15 · 12 plants",
    time: "3 hours ago",
    status: "In Progress",
  },
  {
    id: "AL-114",
    severity: "critical",
    title: "Rover Communication Lost",
    context: "RVR-002 · Greenhouse 02",
    time: "5 hours ago",
    status: "In Progress",
  },
];

export const inspections = [
  { id: "INS-2041", date: "13 Aug 2026", rover: "RVR-001", rows: 24, plants: 1248, fruits: 3682, status: "Complete" },
  { id: "INS-2040", date: "12 Aug 2026", rover: "RVR-001", rows: 24, plants: 1240, fruits: 3601, status: "Complete" },
  { id: "INS-2039", date: "11 Aug 2026", rover: "RVR-001", rows: 20, plants: 1021, fruits: 2942, status: "Partial" },
  { id: "INS-2038", date: "10 Aug 2026", rover: "RVR-001", rows: 24, plants: 1236, fruits: 3222, status: "Complete" },
  { id: "INS-2037", date: "09 Aug 2026", rover: "RVR-001", rows: 24, plants: 1215, fruits: 3080, status: "Complete" },
];

export const reports = [
  {
    id: "RPT-104",
    title: "Daily Inspection Report",
    date: "13 August 2026",
    house: "Greenhouse 01",
    plants: "1,248",
    fruits: "3,682",
    disease: 14,
  },
  {
    id: "RPT-103",
    title: "Daily Inspection Report",
    date: "12 August 2026",
    house: "Greenhouse 01",
    plants: "1,240",
    fruits: "3,601",
    disease: 11,
  },
  {
    id: "RPT-102",
    title: "Weekly Soil Summary",
    date: "11 August 2026",
    house: "Greenhouse 01",
    plants: "1,021",
    fruits: "2,942",
    disease: 9,
  },
  {
    id: "RPT-101",
    title: "Disease Review Report",
    date: "10 August 2026",
    house: "Greenhouse 02",
    plants: "912",
    fruits: "2,410",
    disease: 6,
  },
];

export const users = [
  {
    name: "Dev Test",
    role: "Super Admin" as Role,
    status: "Active",
    houses: "All polyhouses",
    lastLogin: "Today, 09:14",
  },
  { name: "Rahul", role: "Admin" as Role, status: "Active", houses: "Greenhouse 01, 02", lastLogin: "Today, 08:02" },
  { name: "Priya", role: "Viewer" as Role, status: "Active", houses: "Greenhouse 01", lastLogin: "Yesterday, 18:40" },
  { name: "Kabir", role: "Viewer" as Role, status: "Disabled", houses: "Greenhouse 03", lastLogin: "02 Aug, 11:20" },
];

export type HouseSummary = {
  crop: { healthy: number; diseased: number; missing: number; stressed: number; suspected: number; fruits: number };
  soil: { moisture: number; temp: number };
  soilTrend: { t: string; moisture: number; temp: number }[];
};

const trendFor = (
  base: number,
  tempBase: number,
  moistureOffsets = [2, 1, -1, -3, -2, 0, 1],
  tempOffsets = [-2.4, -2.9, -1.2, 1.3, 0.6, 0, -0.8],
) =>
  ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"].map((t, i) => ({
    t,
    moisture: Math.round(base + moistureOffsets[i]!),
    temp: Number((tempBase + tempOffsets[i]!).toFixed(1)),
  }));

export const houseSummary: Record<string, HouseSummary> = {
  "Poly-01": {
    crop: { healthy: 1192, diseased: 14, missing: 8, stressed: 104, suspected: 42, fruits: 3682 },
    soil: { moisture: 42, temp: 24.8 },
    soilTrend: trendFor(42, 24.8),
  },
  "Poly-02": {
    crop: { healthy: 826, diseased: 6, missing: 12, stressed: 61, suspected: 25, fruits: 2410 },
    soil: { moisture: 38, temp: 26.2 },
    soilTrend: trendFor(38, 26.2, [-3, -4, -2, 1, 2, 0, -1], [-2.1, -2.8, -1.2, 2, 1.3, 0, -0.9]),
  },
  "Poly-03": {
    crop: { healthy: 1498, diseased: 21, missing: 17, stressed: 132, suspected: 58, fruits: 4120 },
    soil: { moisture: 47, temp: 23.1 },
    soilTrend: trendFor(47, 23.1, [2, 3, 1, -2, -1, 0, 1], [-2.4, -3, -1.2, 1.4, 0.9, 0, -0.8]),
  },
};
