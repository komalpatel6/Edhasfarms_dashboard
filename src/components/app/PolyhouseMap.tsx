import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, ExternalLink, Layers, Minus, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./ui-kit";

const defaultRover = {
  id: "RVR-001",
  serial: "BP-RVR-2025-0031",
  firmware: "v2.4.1",
  status: "Online",
  battery: 78,
  speed: 0.42,
  row: "Row 03",
  polyhouse: "Polyhouse 01",
  lat: 22.572645,
  lng: 88.363892,
  lastComm: "10 sec ago"
};
import { toast } from "sonner";

type LayerKey = "rows" | "rover" | "route" | "plants" | "disease" | "water" | "soil" | "fruit";

const layerLabels: { key: LayerKey; label: string }[] = [
  { key: "rows", label: "Rows" },
  { key: "rover", label: "Rover" },
  { key: "route", label: "Rover Route" },
  { key: "plants", label: "Plants" },
  { key: "disease", label: "Disease" },
  { key: "water", label: "Water Stress" },
  { key: "soil", label: "Soil" },
  { key: "fruit", label: "Fruit Production" },
];

export function PolyhouseMap({
  title = "Greenhouse 01",
  subtitle = "2,400 m² · 24 Rows · 1,248 Plants",
  offline = false,
  height = "h-[420px]",
  rover = defaultRover,
  compact = false,
  focusLayer,
  footer,
}: {
  title?: string;
  subtitle?: string;
  offline?: boolean;
  height?: string;
  rover?: typeof defaultRover | undefined;
  compact?: boolean;
  focusLayer?: LayerKey | undefined;
  footer?: import("react").ReactNode;
}) {
  const currentRover = rover || defaultRover;
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    rows: true,
    rover: true,
    route: true,
    plants: focusLayer === "plants",
    disease: focusLayer === "disease",
    water: focusLayer === "water",
    soil: focusLayer === "soil",
    fruit: focusLayer === "fruit",
  });
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  const [popup, setPopup] = useState(false);

  const layersButtonRef = useRef<HTMLButtonElement>(null);
  const layersMenuRef = useRef<HTMLDivElement>(null);
  const roverButtonRef = useRef<HTMLButtonElement>(null);
  const roverPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLayers) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        layersMenuRef.current &&
        !layersMenuRef.current.contains(target) &&
        layersButtonRef.current &&
        !layersButtonRef.current.contains(target)
      ) {
        setShowLayers(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLayers]);

  useEffect(() => {
    if (!popup) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        roverPopupRef.current &&
        !roverPopupRef.current.contains(target) &&
        roverButtonRef.current &&
        !roverButtonRef.current.contains(target)
      ) {
        setPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popup]);

  const rows = useMemo(() => Array.from({ length: compact ? 7 : 12 }, (_, i) => i), [compact]);

  const copyCoords = () => {
    const text = `${currentRover.lat}, ${currentRover.lng}`;
    navigator.clipboard?.writeText(text);
    toast.success("Coordinates copied", { description: text });
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-border px-5", compact ? "py-3" : "py-4")}>
        <div>
          <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
          <p className="text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("hidden items-center gap-2 rounded-lg border border-border px-2.5 py-1.5", !compact && "sm:flex")}>
            <Search className="size-3.5 text-muted-foreground" />
            <input
              placeholder="Search row or plant"
              className="w-36 bg-transparent text-[12px] outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.1).toFixed(2)))}
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Zoom out"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Zoom in"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            ref={layersButtonRef}
            onClick={() => setShowLayers((s) => !s)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              showLayers ? "bg-sage-soft text-sage" : "text-muted-foreground hover:bg-accent",
            )}
          >
            <Layers className="size-3.5" /> Layers
          </button>
        </div>
      </div>

      <div className="relative">
        <div className={cn("relative overflow-hidden bg-cream/60", compact ? "p-4" : "p-6", height)}>
          <div
            className="relative size-full origin-center transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* boundary */}
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-sage/40 bg-card/70 flex items-center justify-center">
              {title === "No Polyhouses Registered" || !rover ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-2">
                    🌾
                  </div>
                  <p className="text-sm font-semibold text-foreground">No Polyhouse Layout Available</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Please create a polyhouse in your database to view its interactive grid map.
                  </p>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 flex flex-col justify-center gap-[3.2%] px-[5%]">
                    {layers.rows &&
                      rows.map((r) => (
                        <div key={r} className="relative flex h-[6px] items-center">
                          <div className="h-[3px] w-full rounded-full bg-sage/25" />
                          {layers.plants && (
                            <div className="absolute inset-0 flex items-center justify-between px-1">
                              {Array.from({ length: 22 }).map((_, p) => (
                                <span
                                  key={p}
                                  className={cn(
                                    "size-[5px] rounded-full",
                                    layers.disease && (r * 7 + p) % 23 === 0
                                      ? "bg-critical"
                                      : layers.water && (r * 5 + p) % 17 === 0
                                        ? "bg-warning"
                                        : layers.fruit && (r + p) % 6 === 0
                                          ? "bg-mint"
                                          : "bg-sage/45",
                                  )}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {layers.soil && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_30%_60%,var(--butter),transparent_45%),radial-gradient(circle_at_70%_35%,var(--mint),transparent_45%)] opacity-30" />
                  )}

                  {layers.route && (
                    <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M8,18 L92,18 L92,30 L8,30 L8,42 L60,42"
                        fill="none"
                        stroke="var(--sage)"
                        strokeWidth="0.6"
                        strokeDasharray="2 1.6"
                        opacity={offline ? 0.3 : 0.75}
                      />
                    </svg>
                  )}

                  {layers.rover && rover && (
                    <button
                      ref={roverButtonRef}
                      onClick={() => setPopup((p) => !p)}
                      style={{
                        left: `${(rover as any).x_pct ?? 58}%`,
                        top: `${(rover as any).y_pct ?? 41}%`,
                      }}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out",
                        offline && "opacity-45 saturate-0",
                      )}
                      aria-label="Rover marker"
                    >
                      <span className="relative flex size-11 items-center justify-center rounded-full border border-sage/40 bg-card text-lg shadow-[var(--shadow-lift)]">
                        🚜
                        {!offline && (
                          <span className="absolute -inset-1 animate-ping rounded-full border border-sage/40" />
                        )}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {popup && (
            <div
              ref={roverPopupRef}
              className="absolute left-1/2 top-1/2 z-20 w-64 -translate-x-1/2 rounded-xl border border-border bg-popover p-4 shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium">{currentRover.id}</span>
                <StatusBadge tone={offline ? "offline" : "healthy"}>
                  {offline ? "Offline" : "Online"}
                </StatusBadge>
              </div>
              {offline ? (
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Connection lost · Last known location
                </p>
              ) : null}
              <dl className="mt-3 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Row</dt>
                  <dd>{currentRover.row}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Battery</dt>
                  <dd>{currentRover.battery}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Speed</dt>
                  <dd>{currentRover.speed} m/s</dd>
                </div>
              </dl>
              <p className="mt-2 text-[12px] text-muted-foreground">Updated {currentRover.lastComm || "just now"}</p>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps?q=${currentRover.lat || 22.572645},${currentRover.lng || 88.363892}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="size-3.5" /> Open in Google Maps
                </a>
                <button
                  onClick={copyCoords}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[13px] font-medium transition-colors hover:bg-accent"
                >
                  <Copy className="size-3.5" /> Copy Coordinates
                </button>
              </div>
            </div>
          )}

          {showLayers && (
            <div
              ref={layersMenuRef}
              className="absolute right-4 top-4 z-20 w-48 rounded-xl border border-border bg-popover p-3 shadow-[var(--shadow-lift)]"
            >
              <p className="mb-2 text-[12px] font-medium text-muted-foreground">Layers</p>
              <div className="space-y-1">
                {layerLabels.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={layers[key]}
                      onChange={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                      className="size-3.5 accent-[var(--sage)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-[12px] text-muted-foreground">
            <span>
              {currentRover.lat}, {currentRover.lng}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sage/50" /> Rows
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-healthy" /> Healthy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-warning" /> Stress
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-critical" /> Disease
              </span>
            </div>
          </div>
        )}
      </div>
      {footer ? <div className="border-t border-border">{footer}</div> : null}
    </div>
  );
}
