import { GRADE_COLOR } from "@/lib/data";

export function GradeBadge({ grade, size = "md" }: { grade: string; size?: "sm" | "md" | "lg" }) {
  const dim =
    size === "lg" ? "h-20 w-20 text-5xl" : size === "sm" ? "h-8 w-8 text-lg" : "h-12 w-12 text-2xl";
  const rot = size === "lg" ? "-4deg" : "-2deg";
  return (
    <span
      className={`stamp tabular ${dim}`}
      style={{ color: GRADE_COLOR[grade], transform: `rotate(${rot})` }}
      title={`Note ${grade}`}
    >
      {grade}
    </span>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#3f6f4e" : value >= 55 ? "#9a6b1f" : value >= 40 ? "#c2641f" : "#b5281b";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-inksoft">{label}</span>
        <span className="mono tabular text-sm font-medium">{value}<span className="text-inksoft">/100</span></span>
      </div>
      <div className="mt-1.5 h-[6px] w-full overflow-hidden rounded-full bg-paper2">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`doc px-4 py-4 ${accent ? "border-l-4" : ""}`} style={accent ? { borderLeftColor: "var(--pen)" } : undefined}>
      <div className="eyebrow">{label}</div>
      <div className="mono tabular mt-2 text-2xl font-medium leading-none">{value}</div>
      {hint && <div className="mt-2 text-sm text-inksoft">{hint}</div>}
    </div>
  );
}

export function Eyebrow({ n, children, as }: { n?: string; children: React.ReactNode; as?: "h2" }) {
  const Label = as ?? "span";
  return (
    <div className="flex items-center gap-3">
      {n && <span className="mono text-xs text-pen">{n}</span>}
      <Label className="eyebrow">{children}</Label>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

export function GradeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-inksoft">
      <span className="mono uppercase tracking-widest">Échelle</span>
      {[
        ["A", "exemplaire"],
        ["B", "solide"],
        ["C", "passable"],
        ["D", "faible"],
        ["F", "préoccupant"],
      ].map(([g, w]) => (
        <span key={g} className="inline-flex items-center gap-1.5">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold"
            style={{ color: GRADE_COLOR[g], borderColor: GRADE_COLOR[g] }}
          >
            {g}
          </span>
          {w}
        </span>
      ))}
    </div>
  );
}
