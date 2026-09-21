import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  X,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  RefreshCw,
  Leaf,
  ShieldAlert,
  HelpCircle,
  Database,
  ArrowUpRight
} from "lucide-react";
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
import {
  useAnomalies,
  usePolyhouses,
  analyzeCropImageFile,
  CropAnalysisResult,
  AnomalyIncident
} from "@/hooks/use-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crop-intelligence")({
  head: () => ({
    meta: [
      { title: "Crop Intelligence · BellPepper AI" },
      { name: "description", content: "AI plant disease detection, ResNet50 condition classification, fruit counting, growth monitoring and treatment plans." },
      { property: "og:title", content: "Crop Intelligence · BellPepper AI" },
      { property: "og:description", content: "Live PyTorch ResNet50 plant disease classification, fruit counting, and IPM treatment protocols." },
    ],
  }),
  component: CropIntelligence,
});

const tabs = ["AI Diagnosis", "Disease Registry", "Plants Grid", "Fruit Yield", "Water Stress"] as const;
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

export default function CropIntelligence() {
  const { data: polyhouses, loading: loadingPoly } = usePolyhouses();
  const { data: apiAnomalies, loading: loadingAno } = useAnomalies();

  const [tab, setTab] = useState<Tab>("AI Diagnosis");
  const [drawer, setDrawer] = useState<any | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<AnomalyIncident | null>(null);

  // Live Image Analysis State
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CropAnalysisResult | null>(null);
  const [selectedPolyhouseId, setSelectedPolyhouseId] = useState<string>("poly-01");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = true;

  if (loadingPoly || loadingAno) {
    return (
      <AppShell title="Crop Intelligence">
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          <RefreshCw className="size-5 animate-spin mr-2 text-sage" />
          Connecting to AI Crop Vision & database...
        </div>
      </AppShell>
    );
  }

  const firstHouse = polyhouses[0];
  const totalPlantsCount = polyhouses.reduce((acc, p) => acc + (p.grid_rows * p.grid_bays * 10), 0) || 1200;
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
      anomalyData: hasAnomaly
    };
  });

  const anomaliesList = apiAnomalies.map((a) => ({
    id: a.id,
    plant: `Grid (${a.grid_x || 1}, ${a.grid_y || 1})`,
    row: `Row ${a.grid_y || 1}`,
    disease: a.title || a.issue_type,
    category: a.issue_type,
    confidence: Math.round((a.ai_confidence <= 1 ? a.ai_confidence * 100 : a.ai_confidence) || 90),
    causes: a.causes || "Fungal pathogen or environmental microclimate stress",
    severity: a.severity,
    status: a.status,
    detected_at: a.detected_at,
    image_url: a.image_url,
    raw: a
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!uploadedImage) {
      toast.error("Please select or drop an image first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeCropImageFile(uploadedImage, {
        polyhouse_id: selectedPolyhouseId || firstHouse?.id || "poly-01",
        auto_save_incident: true,
      });

      setAnalysisResult(result);

      if (result.is_healthy) {
        toast.success("AI Result: Plant foliage is Healthy!", {
          description: `Confidence: ${result.confidence_percent}% (${result.confidence_level})`
        });
      } else {
        toast.warning(`AI Detection: ${result.formatted_title}`, {
          description: `Saved to database · Incident ${result.incident_id || "logged"}`
        });
      }
    } catch (err: any) {
      toast.error("Analysis Failed", {
        description: err?.message || "Could not reach Cloud Run AI model"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppShell title="Crop Intelligence">
      <PageHeader
        title="Crop Intelligence & AI Vision"
        subtitle="Connected to PyTorch ResNet50 Cloud Run Model · Real-time Disease Diagnosis & IPM Protocol"
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-[14px] font-medium transition-colors",
              tab === t
                ? "border-primary text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB 1: AI LIVE DIAGNOSIS STATION */}
      {tab === "AI Diagnosis" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Upload & Image Capture Panel */}
            <div className="lg:col-span-5 space-y-4">
              <Surface>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>🔬 AI Image Diagnosis Station</CardTitle>
                  <span className="text-[11px] rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                    Live Model
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Upload a photo of a bell pepper leaf, stem, or fruit to run real-time ResNet50 neural network classification.
                </p>

                {/* Dropzone / Preview Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all",
                    imagePreview
                      ? "border-primary/50 bg-accent/20"
                      : "border-border hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {imagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Crop upload preview"
                        className="mx-auto max-h-64 rounded-xl object-contain shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedImage(null);
                          setImagePreview(null);
                          setAnalysisResult(null);
                        }}
                        className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-foreground backdrop-blur hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                        <UploadCloud className="size-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP (max 10MB)</p>
                    </div>
                  )}
                </div>

                {/* Greenhouse Selector & Analyze Action */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-[12px] font-medium text-muted-foreground mb-1 block">
                      Target Polyhouse Location
                    </label>
                    <select
                      value={selectedPolyhouseId}
                      onChange={(e) => setSelectedPolyhouseId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {polyhouses.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.grid_rows} rows × {p.grid_bays} bays)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    disabled={!imagePreview || isAnalyzing}
                    onClick={handleRunAnalysis}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-opacity disabled:opacity-50 hover:opacity-90"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" />
                        Running ResNet50 Inference...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Analyze Leaf with AI
                      </>
                    )}
                  </button>
                </div>
              </Surface>
            </div>

            {/* Right: AI Output & Botanical Diagnosis Fact Sheet */}
            <div className="lg:col-span-7 space-y-4">
              {analysisResult ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Diagnosis Hero Card */}
                  <Surface className="border-l-4 border-l-primary p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            AI Diagnosis Result
                          </span>
                          <StatusBadge
                            tone={
                              analysisResult.is_healthy
                                ? "healthy"
                                : analysisResult.severity === "Critical"
                                ? "critical"
                                : "warning"
                            }
                          >
                            {analysisResult.severity} Severity
                          </StatusBadge>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mt-1">
                          {analysisResult.formatted_title}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Classification: <span className="font-medium text-foreground">{analysisResult.issue_type}</span> · Category: {analysisResult.class_information?.category || "Pathogen"}
                        </p>
                      </div>

                      {/* Confidence Gauge */}
                      <div className="rounded-2xl border border-border bg-accent/40 p-3 text-center min-w-[110px]">
                        <p className="text-[11px] text-muted-foreground font-medium">Confidence</p>
                        <p className="text-2xl font-extrabold text-foreground">
                          {analysisResult.confidence_percent}%
                        </p>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          {analysisResult.confidence_level} Reliability
                        </span>
                      </div>
                    </div>

                    {/* DB Save confirmation notification */}
                    {analysisResult.incident_id && (
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Database className="size-3.5" />
                          Saved to Database Incident #{analysisResult.incident_id}
                        </span>
                        <span className="text-[11px] opacity-80">
                          Polyhouse: {analysisResult.polyhouse_id}
                        </span>
                      </div>
                    )}

                    {/* Causes and Pathogen Summary */}
                    <div className="mt-4 rounded-xl bg-card border border-border p-4">
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Activity className="size-3.5 text-primary" />
                        Etiology & Causal Factors
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {analysisResult.summary_causes}
                      </p>
                    </div>

                    {/* Symptoms Checklist */}
                    {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Leaf className="size-3.5 text-sage" />
                          Identified Visual Symptoms
                        </p>
                        <ul className="grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                          {analysisResult.symptoms.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Actionable IPM & Management Recommendations */}
                    {analysisResult.management_recommendations && analysisResult.management_recommendations.length > 0 && (
                      <div className="mt-5 rounded-xl border border-border bg-cream/40 dark:bg-accent/20 p-4">
                        <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <ShieldAlert className="size-3.5 text-peach" />
                          Recommended Agronomic IPM Management
                        </p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground">
                          {analysisResult.management_recommendations.slice(0, 5).map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Surface>

                  {/* Top 5 Neural Network Class Probabilities */}
                  {analysisResult.top_5_predictions && analysisResult.top_5_predictions.length > 0 && (
                    <Surface>
                      <CardTitle className="text-sm font-semibold mb-3">
                        📊 Top-5 Predictions Probability Distribution
                      </CardTitle>
                      <div className="space-y-2.5">
                        {analysisResult.top_5_predictions.map((p) => (
                          <div key={p.rank} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-foreground">
                                #{p.rank} {p.class_name}
                              </span>
                              <span className="font-mono text-muted-foreground">
                                {p.confidence_percent}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  p.rank === 1 ? "bg-primary" : "bg-muted-foreground/30"
                                )}
                                style={{ width: `${Math.max(p.confidence_percent, 2)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Surface>
                  )}
                </div>
              ) : (
                <Surface className="flex flex-col items-center justify-center text-center p-12 h-full min-h-[380px]">
                  <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
                    <Sparkles className="size-7" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">Awaiting Image for AI Analysis</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Upload a plant leaf photo on the left and click "Analyze Leaf with AI" to generate real-time ResNet50 diagnosis, botanical cause summary, and IPM treatment protocols.
                  </p>
                </Surface>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISEASE & INCIDENT REGISTRY */}
      {tab === "Disease Registry" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Healthy Plants" value="1,192" tone="mint" />
            <KpiCard label="Suspected Stress" value="42" tone="butter" />
            <KpiCard label="High Priority Anomalies" value={String(anomaliesList.length)} tone="peach" />
          </div>

          <Surface className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Plant / Grid", "Location", "Detected Condition", "AI Confidence", "Probable Causes & Symptoms", "Status", "Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {anomaliesList.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedIncident(d.raw)}
                      className={cn(
                        "cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-accent/50",
                        d.confidence >= 90 && "bg-critical-soft/30",
                      )}
                    >
                      <td className="px-5 py-3 font-medium flex items-center gap-2">
                        {d.image_url && (
                          <img src={d.image_url} alt="" className="size-7 rounded-md object-cover border border-border shrink-0" />
                        )}
                        <span>{d.plant}</span>
                      </td>
                      <td className="px-5 py-3">{d.row}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{d.disease}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono font-medium">{d.confidence}%</span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">{d.causes}</td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={statusTone(d.severity)}>{d.severity || d.status}</StatusBadge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(d.raw);
                          }}
                          className="rounded-lg border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
                        >
                          View Fact Sheet
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        </div>
      )}

      {/* TAB 3: PLANTS GRID */}
      {tab === "Plants Grid" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Total Monitored Plants" value={totalPlantsCount.toLocaleString()} tone="sage" />
            <KpiCard label="Inspection Coverage" value={totalPlantsCount.toLocaleString()} delta="100%" tone="mint" />
            <KpiCard label="Flagged Anomalies" value={String(apiAnomalies.length)} hint="AI Detected" tone="peach" />
          </div>
          <Surface className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    {["Plant ID", "Row", "Position", "Health Status", "Last Inspection"].map((h) => (
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

      {/* TAB 4: FRUIT YIELD */}
      {tab === "Fruit Yield" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard label="Total Fruit Count" value="3,682" delta="+6.2%" tone="sage" />
            <KpiCard label="Average per Plant" value="2.95" tone="mint" />
            <KpiCard label="Harvest-Ready" value="48%" tone="butter" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Surface>
              <CardTitle>Fruit Count by Row</CardTitle>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={rowProduction}>
                  <XAxis dataKey="row" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip {...chartTip} />
                  <Bar dataKey="fruits" fill="var(--sage)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Surface>

            <Surface>
              <CardTitle>4-Day Growth Progression</CardTitle>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={growthTrend}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip {...chartTip} />
                  <Area type="monotone" dataKey="fruits" stroke="var(--sage)" fill="var(--sage-soft)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Surface>
          </div>
        </div>
      )}

      {/* TAB 5: WATER STRESS */}
      {tab === "Water Stress" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Surface>
            <CardTitle>Canopy Water Stress Index</CardTitle>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
              <div className="relative size-44">
                <ResponsiveContainer width="100%" height="100%">
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
        </div>
      )}

      {/* DETAILED INCIDENT FACT SHEET DRAWER */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-xs" onClick={() => setSelectedIncident(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6 shadow-2xl duration-300 animate-in slide-in-from-right">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted-foreground">{selectedIncident.id}</span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">{selectedIncident.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Category: {selectedIncident.issue_type} · Severity: {selectedIncident.severity}
                </p>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            {selectedIncident.image_url && (
              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-black/5">
                <img
                  src={selectedIncident.image_url}
                  alt="Captured anomaly frame"
                  className="max-h-56 w-full object-contain"
                />
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-accent/40 p-3">
                <p className="text-[11px] text-muted-foreground">AI Confidence</p>
                <p className="text-lg font-bold text-foreground">
                  {Math.round(selectedIncident.ai_confidence <= 1 ? selectedIncident.ai_confidence * 100 : selectedIncident.ai_confidence)}%
                </p>
              </div>
              <div className="rounded-xl bg-accent/40 p-3">
                <p className="text-[11px] text-muted-foreground">Resolution Status</p>
                <p className="text-lg font-bold text-foreground">{selectedIncident.status || "OPEN"}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border p-4 bg-muted/20">
                <h4 className="text-xs font-semibold uppercase text-foreground mb-1.5">
                  Etiology & Agronomic Causes
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {selectedIncident.causes || "Fungal spores or pathogen proliferation in high canopy humidity."}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.success(`Incident ${selectedIncident.id} marked resolved`);
                    setSelectedIncident(null);
                  }}
                  className="flex-1 rounded-xl bg-primary px-3 py-2.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                >
                  Mark as Resolved
                </button>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="flex-1 rounded-xl border border-border px-3 py-2.5 text-xs font-medium hover:bg-accent"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLANT DETAIL DRAWER */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setDrawer(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-2xl duration-300 animate-in slide-in-from-right">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">🌱 {drawer.id}</h3>
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
              <div className="rounded-xl bg-accent/40 py-3">
                <p className="text-[12px] text-muted-foreground">Current</p>
                <p className="mt-1 text-[18px] font-medium">{drawer.fruits}</p>
              </div>
              <div className="rounded-xl bg-accent/40 py-3">
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

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  toast.success("Flagged for follow-up inspection");
                  setDrawer(null);
                }}
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                Schedule Rover Scan
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
