"use client";

import { useState } from "react";
import { money, type YearMetrics } from "@/lib/data";

function LedgerList({
  items,
  total,
  accent,
}: {
  items: Record<string, number>;
  total: number;
  accent: string;
}) {
  const rows = Object.entries(items).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0)
    return <p className="py-3 text-sm italic text-inksoft">Aucun poste déclaré cette année.</p>;
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <ul className="space-y-1.5">
      {rows.map(([label, val]) => (
        <li key={label} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm">{label}</span>
              <span className="mono tabular shrink-0 text-sm">{money(val)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper2">
              <div className="h-full rounded-full" style={{ width: `${(val / max) * 100}%`, background: accent }} />
            </div>
          </div>
        </li>
      ))}
      <li className="grid grid-cols-[1fr_auto] gap-3 border-t border-rule pt-2 text-sm font-semibold">
        <span>Total</span>
        <span className="mono tabular">{money(total)}</span>
      </li>
    </ul>
  );
}

export default function BudgetSample({ history }: { history: YearMetrics[] }) {
  // default to the most recent year with real data (latest non-provisional),
  // falling back to the very latest year if all are provisional
  const complete = history.filter((h) => !h.provisional);
  const defaultYear = (complete[complete.length - 1] ?? history[history.length - 1]).year;
  const [year, setYear] = useState(defaultYear);
  const m = history.find((h) => h.year === year)!;

  return (
    <div className="doc p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono text-[11px] uppercase tracking-widest text-inksoft">
          Postes du fonds · sélectionnez une année
        </p>
        <div className="flex flex-wrap gap-1">
          {history.map((h) => (
            <button
              key={h.year}
              onClick={() => setYear(h.year)}
              aria-pressed={h.year === year}
              className={`mono rounded border px-2 py-1 text-xs tabular transition-colors ${
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
        <div>
          <h3 className="mb-3 flex items-baseline gap-2 font-display text-lg">
            <span aria-hidden>↑</span> D'où vient l'argent
          </h3>
          <LedgerList items={m.revenues} total={m.raised} accent="#9a6b1f" />
        </div>
        <div className="sm:border-l sm:border-rule sm:pl-8">
          <h3 className="mb-3 flex items-baseline gap-2 font-display text-lg">
            <span aria-hidden>↓</span> Où il est dépensé
          </h3>
          <LedgerList items={m.expenses} total={m.spent} accent="#3f6f4e" />
        </div>
      </div>

      {m.provisional && (
        <p className="mt-4 text-xs italic text-inksoft">
          * {m.year} : budget provisoire (rapport produit en début d'année), peu de dépenses encore inscrites.
        </p>
      )}
    </div>
  );
}
