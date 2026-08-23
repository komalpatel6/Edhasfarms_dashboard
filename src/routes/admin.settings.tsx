import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { CardTitle, MetricRow, PageHeader, Surface } from "@/components/app/ui-kit";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings · BellPepper AI" },
      { name: "description", content: "Account, polyhouse structure, alert thresholds and system integration settings." },
      { property: "og:title", content: "Settings · BellPepper AI" },
      { property: "og:description", content: "Configure account, polyhouse, alerts and system integrations." },
    ],
  }),
  component: SettingsPage,
});

const nav = [
  { group: "Account", items: ["Profile", "Password"] },
  { group: "Polyhouse", items: ["Structure", "Rows & Plants", "Layout"] },
  { group: "Alerts", items: ["Thresholds", "Notifications"] },
  { group: "System", items: ["Integrations", "Data Retention"] },
];

function SettingsPage() {
  const [active, setActive] = useState("Profile");

  return (
    <AppShell title="Settings">
      <PageHeader title="Settings" subtitle="Configure your account, polyhouses and system behaviour." />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-5">
          {nav.map((g) => (
            <div key={g.group}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
                {g.group}
              </p>
              <div className="space-y-1">
                {g.items.map((i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-[14px] transition-colors",
                      active === i ? "bg-sage-soft font-medium text-sage" : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <Surface>
          <CardTitle>{active}</CardTitle>

          {active === "Profile" && (
            <div className="max-w-md space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground">Name</label>
                <input defaultValue={currentUser.name} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage" />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground">Email</label>
                <input defaultValue={currentUser.email} className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage" />
              </div>
              <MetricRow label="Role" value={currentUser.role} />
              <button
                onClick={() => toast.success("Profile saved")}
                className="rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                Save changes
              </button>
            </div>
          )}

          {active === "Thresholds" && (
            <div className="max-w-md space-y-4">
              {[
                { l: "Disease confidence alert", v: "85%" },
                { l: "Soil moisture minimum", v: "35%" },
                { l: "Water stress alert", v: "12%" },
                { l: "Rover battery warning", v: "20%" },
              ].map((t) => (
                <div key={t.l} className="flex items-center justify-between gap-4">
                  <span className="text-[13px] text-muted-foreground">{t.l}</span>
                  <input defaultValue={t.v} className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-right text-[13px] outline-none focus:border-sage" />
                </div>
              ))}
            </div>
          )}

          {!["Profile", "Thresholds"].includes(active) && (
            <div className="space-y-3">
              <MetricRow label="Configured" value="Default values" />
              <MetricRow label="Last updated" value="12 Aug 2026" />
              <p className="pt-2 text-[13px] text-muted-foreground">
                {active} settings apply to all polyhouses you administer.
              </p>
            </div>
          )}
        </Surface>
      </div>
    </AppShell>
  );
}
