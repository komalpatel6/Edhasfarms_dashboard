import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  Bell, 
  Check, 
  MessageSquarePlus, 
  Search 
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/ui-kit";
import { alerts as seedAlerts, currentUser, type AlertStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts · BellPepper AI" },
      { name: "description", content: "Operational alerts for disease detection, soil moisture, water stress and rover connectivity." },
      { property: "og:title", content: "Alerts · BellPepper AI" },
      { property: "og:description", content: "Acknowledge, investigate and resolve polyhouse alerts." },
    ],
  }),
  component: Alerts,
});

const filters = ["All", "New", "Acknowledged", "In Progress", "Resolved"] as const;

function Alerts() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(seedAlerts);
  const canManage = currentUser.role !== "Viewer";

  const criticalCount = items.filter((a) => a.severity === "critical" && a.status !== "Resolved").length;
  const warningCount = items.filter((a) => a.severity === "warning" && a.status !== "Resolved").length;
  const resolvedCount = items.filter((a) => a.status === "Resolved").length;

  const visible = items.filter((a) => {
    const matchesFilter = filter === "All" || a.status === filter;
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.context.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const advance = (id: string, status: AlertStatus) => {
    setItems((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
    toast.success(`Alert ${id} marked as ${status}`);
  };

  return (
    <AppShell title="Alerts">
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">Operational Alerts</h1>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Real-time signals and telemetry warnings across your polyhouses.</p>
      </div>

      {/* KPI Cards - Colored backgrounds by indication without icons */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 px-4 py-3 shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Active</p>
          <p className="mt-1 text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">{items.length} Signals</p>
        </div>

        <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">Critical</p>
          <p className="mt-1 text-base sm:text-lg font-extrabold text-rose-700 dark:text-rose-300">{criticalCount} High Priority</p>
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Warnings</p>
          <p className="mt-1 text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-300">{warningCount} Require Review</p>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 shadow-2xs">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</p>
          <p className="mt-1 text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{resolvedCount} Completed</p>
        </div>
      </div>

      {/* Unified Compact Search & Filter Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4 mb-6">
        <div className="relative w-full sm:w-64 md:w-72">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-muted/40 pl-8 pr-3 py-1.5 text-xs font-medium text-foreground outline-none transition-all focus:border-emerald-500 focus:bg-card"
          />
        </div>

        {/* Compact Segmented Filter Tabs */}
        <div className="inline-flex items-center rounded-xl border border-border/50 bg-muted/40 p-1 overflow-x-auto max-w-full">
          {filters.map((f) => {
            const count = f === "All" ? items.length : items.filter((i) => i.status === f).length;
            const isSelected = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-all whitespace-nowrap",
                  isSelected
                    ? "bg-card text-foreground shadow-2xs border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Simple, Ultra-Clean Alert Cards */}
      {visible.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-5" />}
          title="No matching alerts"
          description="Nothing matches your selected filter right now. New signals will appear automatically."
        />
      ) : (
        <div className="space-y-2.5">
          {visible.map((a) => {
            const isCritical = a.severity === "critical";
            const isWarning = a.severity === "warning";
            const isResolved = a.status === "Resolved";

            const borderAccent = isResolved
              ? "border-l-emerald-500"
              : isCritical
              ? "border-l-rose-500"
              : isWarning
              ? "border-l-amber-500"
              : "border-l-blue-500";

            return (
              <div
                key={a.id}
                className={cn(
                  "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3.5 sm:p-4 shadow-2xs transition-all hover:shadow-xs border-l-4",
                  borderAccent
                )}
              >
                {/* Left Side: Title & Context */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                      {a.id}
                    </span>
                    {/* Severity Tag */}
                    <span
                      className={cn(
                        "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        isCritical
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {a.context} <span className="mx-1">•</span> {a.time}
                  </p>
                </div>

                {/* Right Side: Simple Actions & Status Indicator */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  {canManage && (
                    <>
                      {/* Integrated Action Button */}
                      {a.status === "New" && (
                        <button
                          onClick={() => advance(a.id, "Acknowledged")}
                          className="h-8 px-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
                        >
                          Acknowledge
                        </button>
                      )}

                      {(a.status === "Acknowledged" || a.status === "In Progress") && (
                        <button
                          onClick={() => advance(a.id, "Resolved")}
                          className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-2xs hover:bg-emerald-700 transition-all"
                        >
                          <Check className="size-3.5" /> Resolve
                        </button>
                      )}

                      {isResolved && (
                        <span className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                          <Check className="size-3.5" /> Resolved
                        </span>
                      )}

                      {/* Remark Icon Button */}
                      <button
                        onClick={() => toast("Remark noted", { description: `${a.id} · recorded by ${currentUser.name}` })}
                        title="Add Remark"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                      >
                        <MessageSquarePlus className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
