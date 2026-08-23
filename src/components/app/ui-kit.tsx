import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="page-title text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Surface({
  className,
  children,
  hover,
}: {
  className?: string;
  children: ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-surface p-5 transition-all duration-300",
        hover && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-[15px] font-medium text-foreground">{children}</h3>
      {right}
    </div>
  );
}

const toneMap = {
  healthy: "bg-healthy-soft text-healthy",
  warning: "bg-warning-soft text-warning",
  critical: "bg-critical-soft text-critical",
  offline: "bg-offline-soft text-offline",
  sage: "bg-sage-soft text-sage",
  neutral: "bg-muted text-muted-foreground",
} as const;

export type Tone = keyof typeof toneMap;

export function StatusBadge({
  tone = "sage",
  children,
  dot = true,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium",
        toneMap[tone],
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  const s = status.toLowerCase();
  if (["healthy", "online", "active", "complete", "resolved", "low"].includes(s)) return "healthy";
  if (["suspected", "warning", "charging", "partial", "review", "reviewed", "in progress", "acknowledged", "moderate", "idle"].includes(s))
    return "warning";
  if (["critical", "high", "action", "new", "maintenance", "disabled"].includes(s)) return "critical";
  if (["offline", "—"].includes(s)) return "offline";
  return "sage";
}

const kpiTones = {
  mint: { icon: "bg-leaf-soft text-leaf", bar: "bg-leaf", value: "text-foreground" },
  sage: { icon: "bg-leaf-soft text-leaf", bar: "bg-leaf", value: "text-foreground" },
  leaf: { icon: "bg-leaf-soft text-leaf", bar: "bg-leaf", value: "text-foreground" },
  peach: { icon: "bg-saffron-soft text-saffron", bar: "bg-saffron", value: "text-foreground" },
  saffron: { icon: "bg-saffron-soft text-saffron", bar: "bg-saffron", value: "text-foreground" },
  sky: { icon: "bg-teal-soft text-teal", bar: "bg-teal", value: "text-foreground" },
  teal: { icon: "bg-teal-soft text-teal", bar: "bg-teal", value: "text-foreground" },
  butter: { icon: "bg-indigo-soft text-indigo", bar: "bg-indigo", value: "text-foreground" },
  indigo: { icon: "bg-indigo-soft text-indigo", bar: "bg-indigo", value: "text-foreground" },
} as const;

export function KpiCard({
  label,
  value,
  delta,
  hint,
  icon,
  tone = "sage",
  to,
  params,
  search,
  linkLabel = "View details",
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  icon?: ReactNode;
  tone?: keyof typeof kpiTones;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  linkLabel?: string;
}) {
  const t = kpiTones[tone];

  const body = (
    <>
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", t.bar)} aria-hidden />
      <div className="flex items-start gap-2.5 p-3 pl-4 sm:gap-3 sm:p-4 sm:pl-5">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-9",
            t.icon,
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
            {label}
          </div>
          <div
            className={cn(
              "mt-1 text-[18px] font-bold leading-none tracking-tight sm:text-[22px]",
              t.value,
            )}
          >
            {value}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] leading-tight">
            {delta ? <span className="font-medium text-leaf">{delta}</span> : null}
            {hint ? <span className="truncate text-muted-foreground">{hint}</span> : null}
          </div>
        </div>
        {to ? (
          <span className="hidden size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all group-hover:bg-accent group-hover:text-foreground sm:flex">
            <ArrowUpRight className="size-3.5" />
          </span>
        ) : null}
      </div>
    </>
  );


  if (to) {
    return (
      <Link
        to={to}
        params={params as never}
        search={search as never}
        aria-label={`${label}: ${value}. ${linkLabel}`}
        className="group card-surface relative block overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
      >
        {body}
      </Link>
    );
  }

  return (
    <Surface hover className="relative overflow-hidden p-0">
      {body}
    </Surface>
  );
}


export function EmptyState({
  icon,
  title,
  description,
  footer,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-cream/50 px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sage-soft text-sage">
        {icon}
      </div>
      <h4 className="text-[15px] font-medium text-foreground">{title}</h4>
      {description ? (
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />;
}

export function LoadingCard() {
  return (
    <Surface className="space-y-3">
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonBlock className="h-8 w-2/3" />
      <SkeletonBlock className="h-3 w-1/2" />
    </Surface>
  );
}

export function ErrorState({
  title = "Unable to retrieve data",
  description,
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-critical-soft/60 p-6">
      <h4 className="text-[15px] font-medium text-foreground">{title}</h4>
      {description ? <p className="mt-1 text-[13px] text-muted-foreground">{description}</p> : null}
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function MetricRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 py-2.5 last:border-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  tone = "leaf",
}: {
  value: number;
  className?: string;
  tone?: "leaf" | "saffron" | "teal" | "indigo";
}) {
  const fill = {
    leaf: "bg-leaf",
    saffron: "bg-saffron",
    teal: "bg-teal",
    indigo: "bg-indigo",
  }[tone];
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", fill)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

