import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, StatusBadge, Surface, statusTone } from "@/components/app/ui-kit";
import { apiRequest } from "@/lib/api-client";

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
  const [editModal, setEditModal] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [userList, setUserList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isSuperAdmin = true;

  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Operator",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "Operator",
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<any[]>("/users/");
      setUserList(Array.isArray(res) ? res : []);
    } catch {
      setUserList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email || !userForm.password || !userForm.full_name) return;
    setSubmitting(true);
    try {
      await apiRequest("/users/", {
        method: "POST",
        body: JSON.stringify(userForm),
      });
      setModal(false);
      setUserForm({ full_name: "", email: "", password: "", role: "Operator" });
      toast.success("User account created successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setSubmitting(true);
    try {
      await apiRequest(`/users/${editModal.id}`, {
        method: "PUT",
        body: JSON.stringify(editForm),
      });
      setEditModal(null);
      toast.success("User updated successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await apiRequest(`/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      toast.success(`User ${deleteTarget.full_name || deleteTarget.email} deleted`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: any) => {
    setEditModal(u);
    setEditForm({
      full_name: u.full_name || "",
      role: u.role || "Operator",
      is_active: u.is_active !== false,
    });
  };

  return (
    <AppShell title="Users">
      <PageHeader
        title="User Management"
        subtitle="Live platform users connected directly to your Supabase Database."
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
        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading users...</div>
        ) : userList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-lg font-bold text-foreground">No Users Found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Your database currently has zero registered users. Click "+ Create User" above to add your team members.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  {["Name", "Email", "Role", "Status", "Assigned Polyhouses", "Created", "Actions"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map((u) => (
                  <tr key={u.id} className="border-b border-border/60 last:border-0 hover:bg-accent/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 items-center justify-center rounded-full bg-sage-soft text-[12px] font-medium text-sage">
                          {(u.full_name || u.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium">{u.full_name || "Unnamed"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">{u.role}</td>
                    <td className="px-5 py-3">
                      <StatusBadge tone={statusTone(u.is_active !== false ? "Active" : "Disabled")}>
                        {u.is_active !== false ? "Active" : "Disabled"}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">All Polyhouses</td>
                    <td className="px-5 py-3 text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "Recent"}</td>
                    <td className="px-5 py-3 text-right">
                      {isSuperAdmin ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[12px] hover:bg-accent"
                          >
                            <Pencil className="size-3" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[12px] text-rose-600 hover:bg-rose-500/10"
                          >
                            <Trash2 className="size-3" /> Delete
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
        )}
      </Surface>

      {/* Create User Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] duration-200 animate-in zoom-in-95">
            <button onClick={() => setModal(false)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
              <X className="size-4" />
            </button>
            <h3 className="section-title">Create User Account</h3>
            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground">Full name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground">Email</label>
                <input
                  required
                  type="email"
                  placeholder="user@edhaas.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground">Password</label>
                <input
                  required
                  type="password"
                  placeholder="Enter initial password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage"
                >
                  <option value="Admin">Admin</option>
                  <option value="Agronomist">Agronomist</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>

              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-medium hover:bg-accent">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setEditModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)] duration-200 animate-in zoom-in-95">
            <button onClick={() => setEditModal(null)} className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent" aria-label="Close">
              <X className="size-4" />
            </button>
            <h3 className="section-title">Edit User — {editModal.email}</h3>
            <form onSubmit={handleEditUser} className="mt-5 space-y-4">
              <div>
                <label className="text-[13px] text-muted-foreground">Full name</label>
                <input
                  required
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage"
                />
              </div>
              <div>
                <label className="text-[13px] text-muted-foreground">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-[14px] outline-none focus:border-sage"
                >
                  <option value="Admin">Admin</option>
                  <option value="Agronomist">Agronomist</option>
                  <option value="Operator">Operator</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="size-4 rounded accent-emerald-600"
                />
                <label htmlFor="user_active" className="text-sm font-medium text-foreground cursor-pointer">
                  Account Active
                </label>
              </div>

              <div className="mt-6 flex gap-2">
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-medium hover:bg-accent">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-lift)]">
            <h3 className="text-[16px] font-medium text-foreground">Delete user {deleteTarget.full_name || deleteTarget.email}?</h3>
            <p className="mt-2 text-[13px] text-muted-foreground">
              This action cannot be undone. Their user account will be permanently deleted from your Supabase database.
            </p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] font-medium hover:bg-accent">
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={submitting}
                className="flex-1 rounded-xl bg-rose-600 px-3 py-2 text-[13px] font-medium text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
