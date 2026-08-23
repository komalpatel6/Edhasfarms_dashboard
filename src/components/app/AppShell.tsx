import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";

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
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-sidebar-primary text-[13px] font-medium text-sidebar-primary-foreground">
            {currentUser.name.charAt(0)}
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-medium text-sidebar-foreground">{currentUser.name}</p>
            <p className="text-[13px] text-sidebar-foreground/70">{currentUser.role}</p>
          </div>
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
        <button
          onClick={() => setOpen(true)}
          className="sticky top-2 z-30 ml-2 mt-2 rounded-xl border border-border bg-card p-2 text-muted-foreground shadow-sm hover:bg-accent lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-4" />
        </button>

        <main className="mx-auto max-w-[1440px] space-y-3 px-3 py-3 sm:space-y-4 sm:px-4 sm:py-4">{children}</main>
      </div>
    </div>
  );
}
