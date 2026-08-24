import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, MapPin, Plus, Home, Sprout, Bot, Activity, Search, ShieldCheck, X, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { usePolyhouses } from "@/hooks/use-api";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/polyhouses/")({
  head: () => ({
    meta: [
      { title: "Polyhouses · BellPepper AI" },
      { name: "description", content: "All monitored smart polyhouses with area, rows, plant counts and assigned rovers." },
      { property: "og:title", content: "Polyhouses · BellPepper AI" },
      { property: "og:description", content: "Browse every monitored polyhouse and its assigned rover." },
    ],
  }),
  component: Polyhouses,
});

export function Polyhouses() {
  const { data: apiPolyhouses, refetch } = usePolyhouses();
  const isSuperAdmin = true;
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "Active" | "Idle" | "Maintenance">("all");

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "Bengaluru, Karnataka",
    crop_type: "Bell Pepper",
    total_area_sqm: 2000,
    grid_rows: 10,
    grid_bays: 10,
    length_m: 80,
    width_m: 30,
    row_spacing_m: 3.2,
    plant_spacing_m: 0.45,
  });

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from database?`)) return;
    try {
      await apiRequest(`/polyhouses/${id}`, { method: "DELETE" });
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to delete polyhouse");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      await apiRequest("/polyhouses/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowModal(false);
      setForm({
        name: "",
        location: "Bengaluru, Karnataka",
        crop_type: "Bell Pepper",
        total_area_sqm: 2000,
        grid_rows: 10,
        grid_bays: 10,
        length_m: 80,
        width_m: 30,
        row_spacing_m: 3.2,
        plant_spacing_m: 0.45,
      });
      refetch();
    } catch (err: any) {
      alert(err.message || "Failed to create polyhouse");
    } finally {
      setSubmitting(false);
    }
  };

  const [polyhouseStatuses, setPolyhouseStatuses] = useState<Record<string, "Active" | "Idle" | "Maintenance">>({});

  const polyhouseList = (apiPolyhouses || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    location: p.location || "Kolkata, West Bengal",
    area: `${p.total_area_sqm || 2400} m²`,
    length: "80 m",
    width: "30 m",
    rows: p.grid_rows || 10,
    plants: (p.grid_rows || 10) * (p.grid_bays || 10) * 10,
    rover: "RVR-001",
    status: polyhouseStatuses[p.id] || "Active",
  }));

  const filteredPolyhouses = polyhouseList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPlants = polyhouseList.reduce((acc, p) => acc + p.plants, 0);

  return (
    <AppShell title="Polyhouses">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Polyhouse Fleet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitored smart greenhouse structures with live AI rover coverage.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <Plus className="size-4" /> Add Polyhouse
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Add New Polyhouse Structure</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-accent">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Polyhouse Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Polyhouse 03"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Location</label>
                <input
                  required
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Crop Type</label>
                  <input
                    type="text"
                    value={form.crop_type}
                    onChange={(e) => setForm({ ...form, crop_type: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Area (sqm)</label>
                  <input
                    type="number"
                    value={form.total_area_sqm}
                    onChange={(e) => setForm({ ...form, total_area_sqm: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Grid Rows</label>
                  <input
                    type="number"
                    value={form.grid_rows}
                    onChange={(e) => setForm({ ...form, grid_rows: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Grid Bays</label>
                  <input
                    type="number"
                    value={form.grid_bays}
                    onChange={(e) => setForm({ ...form, grid_bays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Length (m)</label>
                  <input
                    type="number"
                    value={form.length_m}
                    onChange={(e) => setForm({ ...form, length_m: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Width (m)</label>
                  <input
                    type="number"
                    value={form.width_m}
                    onChange={(e) => setForm({ ...form, width_m: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Row Spacing (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.row_spacing_m}
                    onChange={(e) => setForm({ ...form, row_spacing_m: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Plant Spacing (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={form.plant_spacing_m}
                    onChange={(e) => setForm({ ...form, plant_spacing_m: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs font-medium uppercase">
            <span>Total Structures</span>
            <Home className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{polyhouseList.length}</p>
          <p className="text-xs text-muted-foreground mt-1">100% active telemetry</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs font-medium uppercase">
            <span>Total Plants</span>
            <Sprout className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{totalPlants.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">Under AI supervision</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs font-medium uppercase">
            <span>Assigned Rovers</span>
            <Bot className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{polyhouseList.length} Rovers</p>
          <p className="text-xs text-muted-foreground mt-1">Automated row scans</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1 text-xs font-medium uppercase">
            <span>Overall Health</span>
            <Activity className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">96.4%</p>
          <p className="text-xs text-muted-foreground mt-1">Optimal environment</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by polyhouse name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-muted/40 pl-10 pr-4 py-2 text-xs font-medium text-foreground outline-none transition-all focus:border-emerald-500 focus:bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "Active", "Idle", "Maintenance"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all",
                filterStatus === st
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {st === "all" ? `All (${polyhouseList.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Polyhouse Cards */}
      {filteredPolyhouses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center my-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3">
            <Home className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Polyhouses in Database</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Your database currently contains zero registered polyhouses. Click "+ Add Polyhouse" above to create one.
          </p>
          {isSuperAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="size-4" /> Add Polyhouse
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPolyhouses.map((p) => (
            <div
              key={p.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg"
            >
              <div>
                {/* Header Gradient */}
                <div className="mb-4 h-24 rounded-xl bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(59,130,246,0.1))] flex items-center justify-between p-4 border border-emerald-500/10">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-card text-emerald-600 dark:text-emerald-400 shadow-xs">
                    <Home className="size-5" />
                  </div>
                  <select
                    value={p.status}
                    onChange={(e) => setPolyhouseStatuses((prev) => ({ ...prev, [p.id]: e.target.value as any }))}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md outline-none cursor-pointer border transition-all",
                      p.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : p.status === "Idle"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    )}
                  >
                    <option value="Active">● Active</option>
                    <option value="Idle">● Idle</option>
                    <option value="Maintenance">● Maintenance</option>
                  </select>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-emerald-500" /> {p.location}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { l: "Area", v: p.area },
                    { l: "Rows", v: p.rows },
                    { l: "Plants", v: p.plants.toLocaleString() },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-muted/40 p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                      <p className="mt-0.5 text-xs font-bold text-foreground">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Bot className="size-3.5 text-emerald-500" /> {p.rover}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Delete from database"
                    className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-600 transition-colors hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <Link
                    to="/polyhouses/$id"
                    params={{ id: p.id }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                  >
                    Inspect <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
