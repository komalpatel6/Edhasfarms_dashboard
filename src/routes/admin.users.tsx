import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StatusBadge, Surface, statusTone } from "@/components/app/ui-kit";
import { currentUser, users } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management · BellPepper AI" },
      { name: "description", content: "Manage platform users, roles and polyhouse access for your team." },
      { property: "og:title", content: "User Management · BellPepper AI" },
      { property: "og:description", content: "Roles, access and activity for every platform user." },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const isSuperAdmin = currentUser.role === "Super Admin";

  return (
    <AppShell title="Users">
      <PageHeader
        title="User Management"
        actions={
          isSuperAdmin ? (
            <button
              onClick={() => setModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-3.5" /> Create User
            </button>
          ) : null
        }
      />

      <Surface className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                {["Name", "Role", "Status", "Assigned Polyhouses", "Last Login", ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.name} className="border-b border-border/60 last:border-0 hover:bg-accent/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-sage-soft text-[12px] font-medium text-sage">
                        {u.name.charAt(0)}
                      </span>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">{u.role}</td>
                  <td className="px-5 py-3">
                    <StatusBadge tone={statusTone(u.status)}>{u.status}</StatusBadge>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.houses}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-5 py-3 text-right">
                    {isSuperAdmin ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toast("Edit user", { description: u.name })}
                          className="rounded-lg border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirm(u.name)}
                          className="rounded-lg border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
                        >
                          {u.status === "Active" ? "Deactivate" : "Activate"}
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
      </Surface>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] duration-200 animate-in zoom-in-95">
            <button onClick={() => setModal(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
              <X className="size-4" />
            </button>
            <h3 className="section-title">Create user</h3>
            <div className="mt-5 space-y-4">
              {["Full name", "Email"].map((f) => (
                <div key={f}>
                  <label className="text-[13px] text-muted-foreground">{f}</label>
                  <input className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage" />
                </div>
              ))}
              <div>
                <label className="text-[13px] text-muted-foreground">Role</label>
                <select className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage">
                  <option>Viewer</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-medium hover:bg-accent">
                Cancel
              </button>
              <button
                onClick={() => {
                  setModal(false);
                  toast.success("User invited");
                }}
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)]">
            <h3 className="text-[16px] font-medium">Change access for {confirm}?</h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              They will immediately lose or regain access to assigned polyhouses.
            </p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setConfirm(null)} className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-medium hover:bg-accent">
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(`Access updated for ${confirm}`);
                  setConfirm(null);
                }}
                className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
