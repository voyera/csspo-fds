"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GradeBadge } from "@/components/ui";
import { money, type School } from "@/lib/data";

type Key = "rank" | "raised" | "spent" | "balance" | "hoardRatio" | "composite";

const COLS: { key: Key; label: string; help: string }[] = [
  { key: "raised", label: "Amassé", help: "Argent amassé en 2024-25 (levées de fonds + dons + intérêts)" },
  { key: "spent", label: "Dépensé", help: "Dépensé pour les élèves en 2024-25" },
  { key: "balance", label: "Dort au fonds", help: "Argent non dépensé qui s'accumule" },
  { key: "hoardRatio", label: "Réserve", help: "Années de dépenses gardées en réserve" },
  { key: "composite", label: "Score", help: "Score global /100" },
];

function hoard(s: School) {
  return s.latest.hoardRatio >= 99 ? "∞" : `${s.latest.hoardRatio.toFixed(1)}×`;
}

export default function Leaderboard({ schools }: { schools: School[] }) {
  const [sort, setSort] = useState<Key>("rank");
  const [desc, setDesc] = useState(false);
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const get = (s: School) =>
      sort === "rank" ? s.rank : sort === "composite" ? s.composite : (s.latest[sort] as number);
    const norm = (t: string) =>
      t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return [...schools]
      .filter((s) => norm(s.name).includes(norm(q.trim())))
      .sort((a, b) => (desc ? get(b) - get(a) : get(a) - get(b)));
  }, [schools, sort, desc, q]);

  const click = (k: Key) => {
    if (k === sort) setDesc(!desc);
    else {
      setSort(k);
      setDesc(k !== "rank");
    }
  };
  const arrow = (k: Key) => (sort === k ? (desc ? " ↓" : " ↑") : "");

  return (
    <div className="space-y-3">
      {/* Filter — serves the top task: find my school */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 sm:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-inksoft">⌕</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrer par nom d'école…"
            aria-label="Filtrer par nom d'école"
            className="w-full rounded-md border border-rule bg-[#fbf8f1] py-2 pl-9 pr-3 font-mono text-sm placeholder:text-inksoft/70 focus:border-pen focus:outline-none focus:ring-1 focus:ring-pen"
          />
        </label>
        <span className="mono text-xs uppercase tracking-widest text-inksoft">
          {rows.length} / {schools.length} écoles
        </span>
      </div>

      {/* Desktop / tablet: ledger table */}
      <div className="doc hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink/70 text-left">
              <th className="px-3 py-3 font-mono text-[11px] uppercase tracking-widest text-inksoft">#</th>
              <th className="px-3 py-3 font-mono text-[11px] uppercase tracking-widest text-inksoft">École</th>
              <th className="px-2 py-3 text-center font-mono text-[11px] uppercase tracking-widest text-inksoft">Note</th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  title={c.help}
                  onClick={() => click(c.key)}
                  className="cursor-pointer select-none whitespace-nowrap px-3 py-3 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft hover:text-pen"
                >
                  {c.label}{arrow(c.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr
                key={s.code}
                className={`border-b border-rule/60 transition-colors hover:bg-paper2/60 ${i % 2 ? "bg-black/[0.015]" : ""}`}
              >
                <td className="mono tabular px-3 py-2.5 text-inksoft">{String(s.rank).padStart(2, "0")}</td>
                <td className="px-3 py-2.5">
                  <Link href={`/ecole/${s.code}`} className="font-medium hover:text-pen hover:underline">{s.name}</Link>
                </td>
                <td className="px-2 py-2.5 text-center">
                  <Link href={`/ecole/${s.code}`}><GradeBadge grade={s.grade} size="sm" /></Link>
                </td>
                <td className="mono tabular px-3 py-2.5 text-right">{money(s.latest.raised)}</td>
                <td className="mono tabular px-3 py-2.5 text-right">{money(s.latest.spent)}</td>
                <td className="mono tabular px-3 py-2.5 text-right">{money(s.latest.balance)}</td>
                <td className={`mono tabular px-3 py-2.5 text-right ${s.latest.hoardRatio >= 2 ? "text-pen" : "text-inksoft"}`}>{hoard(s)}</td>
                <td className="mono tabular px-3 py-2.5 text-right font-semibold">{s.composite}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards keep Note + Score visible */}
      <ul className="space-y-2 sm:hidden">
        {rows.map((s) => (
          <li key={s.code}>
            <Link href={`/ecole/${s.code}`} className="doc flex items-center gap-3 p-3">
              <span className="mono tabular text-inksoft">{String(s.rank).padStart(2, "0")}</span>
              <GradeBadge grade={s.grade} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{s.name}</div>
                <div className="mono tabular mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-inksoft">
                  <span>Amassé {money(s.latest.raised)}</span>
                  <span className={s.latest.hoardRatio >= 2 ? "text-pen" : ""}>Réserve {hoard(s)}</span>
                </div>
              </div>
              <span className="mono tabular text-right text-sm font-semibold">{s.composite}</span>
            </Link>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="py-6 text-center text-sm text-inksoft">Aucune école ne correspond à « {q} ».</p>
      )}

      {/* Persistent key — no hover/tooltip dependency */}
      <p className="mono text-[11px] leading-relaxed text-inksoft">
        <strong className="text-ink">Réserve</strong> = années de dépenses gardées en banque (solde ÷ dépenses
        annuelles) · <strong className="text-ink">∞</strong> = aucune dépense déclarée · <strong className="text-ink">Score</strong> /100.
      </p>
    </div>
  );
}
