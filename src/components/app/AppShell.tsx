import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Bot,
  Building2,
  FileText,
  LayoutDashboard,
  Layers,
  Menu,
  Settings,
  Sprout,
  History,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/polyhouses", label: "Polyhouses", icon: Building2 },
  { to: "/live-rover", label: "Live Rover", icon: Bot },
  { to: "/crop-intelligence", label: "Crop Intelligence", icon: Sprout },
  { to: "/soil-intelligence", label: "Soil Intelligence", icon: Layers },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/inspections", label: "Inspection History", icon: History },
  { to: "/reports", label: "Reports", icon: FileText },
];

const adminItems = [
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/rovers", label: "Rovers", icon: Bot },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-all duration-200",
        active
          ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <Icon className={cn("size-5", active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70")} />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const email = localStorage.getItem("edhaas_user_email") || "edhas@test.com";
    const role = localStorage.getItem("edhaas_user_role") || "Admin";
    const name = email ? email.split("@")[0] || "edhas" : "edhas";
    setUser({ name: name.charAt(0).toUpperCase() + name.slice(1), role });
  }, []);

  const userName = user?.name || "Edhaas";
  const userRole = user?.role || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("edhaas_access_token");
    localStorage.removeItem("edhaas_user_email");
    localStorage.removeItem("edhaas_user_role");
    localStorage.removeItem("edhasfarms-authenticated");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="text-2xl">🌿</span>
        <span className="text-[17px] font-medium tracking-tight text-sidebar-foreground">Edhasfarms</span>
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navItems.map((i) => (
          <NavLink
            key={i.to}
            {...i}
            active={i.to === "/" ? pathname === "/" : pathname.startsWith(i.to)}
            onClick={onNavigate}
          />
        ))}

        {adminItems.map((i) => (
          <NavLink key={i.to} {...i} active={pathname.startsWith(i.to)} onClick={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[13px] font-medium text-sidebar-primary-foreground">
              {userName.charAt(0)}
            </span>
            <div className="leading-tight truncate">
              <p className="text-[14px] font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-[12px] text-sidebar-foreground/70 truncate">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-destructive"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { title?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-[var(--shadow-lift)] duration-300 animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Mobile Top Header Bar with Centered Brand Name */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground shadow-2xs hover:bg-accent"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex items-center gap-1.5 font-bold tracking-tight text-foreground text-base">
            <span className="text-lg">🌿</span>
            <span>Edhasfarms</span>
          </div>

          <div className="size-9 shrink-0" />
        </header>

        <main className="mx-auto max-w-[1440px] space-y-2.5 px-3 py-3 sm:space-y-3 sm:px-4 sm:py-4">{children}</main>
      </div>
    </div>
  );
}
