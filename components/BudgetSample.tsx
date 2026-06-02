"use client";

import { useState } from "react";
import { money, type YearMetrics } from "@/lib/data";

type Item = { label: string; amount: number };
const sumItems = (a: Item[]) => a.reduce((s, x) => s + x.amount, 0);

/** Proposed budget: descriptive line items as the direction wrote them. */
function Proposed({ items }: { items: Item[] }) {
  const rows = [...items].sort((a, b) => b.amount - a.amount);
  return (
    <div className="rounded-md border border-dashed border-rule bg-paper2/40 p-3">
      <div className="mono text-[10px] uppercase tracking-widest text-inksoft">Proposé au budget</div>
      {rows.length === 0 ? (
        <p className="mt-1.5 text-sm italic text-inksoft">Aucun budget proposé cette année.</p>
      ) : (
        <ul className="mt-1.5 space-y-1.5">
          {rows.map((it, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-inksoft">{it.label}</span>
              <span className="mono tabular shrink-0">{money(it.amount)}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-3 border-t border-rule pt-1 text-sm font-semibold">
            <span>Total proposé</span>
            <span className="mono tabular">{money(sumItems(items))}</span>
          </li>
        </ul>
      )}
    </div>
  );
}

/** Actual (bank): itemized with bars. */
function Real({ items, total, accent }: { items: Record<string, number>; total: number; accent: string }) {
  const rows = Object.entries(items).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) return <p className="py-2 text-sm italic text-inksoft">Aucun mouvement déclaré.</p>;
  const max = Math.max(...rows.map((r) => Math.abs(r[1])));
  return (
    <ul className="space-y-1.5">
      {rows.map(([label, val]) => (
        <li key={label}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm">{label}</span>
            <span className="mono tabular shrink-0 text-sm">{money(val)}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper2">
            <div className="h-full rounded-full" style={{ width: `${(Math.abs(val) / max) * 100}%`, background: accent }} />
          </div>
        </li>
      ))}
      <li className="flex items-baseline justify-between gap-3 border-t border-rule pt-2 text-sm font-semibold">
        <span>Total réel</span>
        <span className="mono tabular">{money(total)}</span>
      </li>
    </ul>
  );
}

function Side({ arrow, title, budget, actual, actualTotal, accent }: {
  arrow: string; title: string; budget: Item[];
  actual: Record<string, number>; actualTotal: number; accent: string;
}) {
  const nB = budget.length;
  const nA = Object.keys(actual).length;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="flex items-baseline gap-2 font-display text-lg">
          <span aria-hidden>{arrow}</span> {title}
        </h3>
        <span className="mono text-[11px] text-inksoft">
          {nB} prévu{nB > 1 ? "s" : ""} → {nA} réel{nA > 1 ? "s" : ""}
        </span>
      </div>
      <Proposed items={budget} />
      <div className="mt-3">
        <div className="mono mb-1.5 text-[10px] uppercase tracking-widest text-inksoft">Réel au compte</div>
        <Real items={actual} total={actualTotal} accent={accent} />
      </div>
    </div>
  );
}

export default function BudgetSample({ history }: { history: YearMetrics[] }) {
  const complete = history.filter((h) => !h.provisional);
  const defaultYear = (complete[complete.length - 1] ?? history[history.length - 1]).year;
  const [year, setYear] = useState(defaultYear);
  const m = history.find((h) => h.year === year)!;
  const detailed = m.propSource === "annexe-d";

  return (
    <div className="doc p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-inksoft">
          Ce que la direction a <strong className="text-ink">inscrit au budget</strong> vs ce qui est
          réellement <strong className="text-ink">passé au compte</strong>. L'écart de détail révèle
          la complexité — ou la simplicité — du budget proposé.
        </p>
        <div className="flex flex-wrap gap-1">
          {history.map((h) => (
            <button
              key={h.year}
              onClick={() => setYear(h.year)}
              aria-pressed={h.year === year}
              className={`mono tabular rounded border px-2 py-1 text-xs transition-colors ${
                h.year === year
                  ? "border-pen bg-pen text-[#fbf8f1]"
                  : "border-rule text-inksoft hover:border-pen hover:text-pen"
              }`}
            >
              {h.year}
              {h.provisional ? "*" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-8 sm:grid-cols-2">
        <Side arrow="↑" title="D'où vient l'argent" budget={m.propRev} actual={m.revenues} actualTotal={m.raised} accent="#9a6b1f" />
        <div className="sm:border-l sm:border-rule sm:pl-8">
          <Side arrow="↓" title="Où il est dépensé" budget={m.propExp} actual={m.expenses} actualTotal={m.spent} accent="#3f6f4e" />
        </div>
      </div>

      <p className="mt-4 text-xs italic text-inksoft">
        {detailed
          ? "« Proposé au budget » : lignes telles qu'inscrites par la direction dans sa préparation budgétaire (Annexe D)."
          : "« Proposé au budget » : détail descriptif non disponible pour cette année — montant global tiré du rapport comptable."}
        {m.provisional && " · " + m.year + " est provisoire (rapport produit en début d'année)."}
      </p>
    </div>
  );
}
