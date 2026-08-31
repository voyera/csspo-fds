"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/data";
import { shortYear, type CssdSchool } from "@/lib/cssd";

// Explorateur de données — PAS un palmarès : ordre alphabétique par défaut,
// aucune note, aucun rang. L'exercice et la nature (réel/comptable) de chaque
// mesure sont dans l'en-tête de colonne.

type Key = "name" | "enrollment" | "campRev" | "campDep" | "fundClose";

export default function CssdExplorer({
  schools,
  snapshotYear,
}: {
  schools: CssdSchool[];
  snapshotYear: string;
}) {
  const [sort, setSort] = useState<Key>("name");
  const [desc, setDesc] = useState(false);
  const [q, setQ] = useState("");
  const sy = shortYear(snapshotYear);

  const val = (s: CssdSchool, k: Key): number | string => {
    switch (k) {
      case "name":
        return s.name;
      case "enrollment":
        return s.enrollment[snapshotYear]?.value ?? -1;
      case "campRev":
        return s.campaignActuals[snapshotYear]?.rev ?? -1;
      case "campDep":
        return s.campaignActuals[snapshotYear]?.dep ?? -1;
      case "fundClose":
        return s.ledger[snapshotYear]?.totals.close ?? -1;
    }
  };

  const rows = useMemo(() => {
    const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const list = schools.filter(
      (s) => s.ledger[snapshotYear] && norm(`${s.code} ${s.name}`).includes(norm(q.trim())),
    );
    return list.sort((a, b) => {
      const va = val(a, sort);
      const vb = val(b, sort);
      const cmp =
        typeof va === "string"
          ? (va as string).localeCompare(vb as string, "fr")
          : (va as number) - (vb as number);
      return desc ? -cmp : cmp;
    });
  }, [schools, snapshotYear, sort, desc, q]);

  const click = (k: Key) => {
    if (k === sort) setDesc(!desc);
    else {
      setSort(k);
      setDesc(k !== "name");
    }
  };
  const arrow = (k: Key) => (sort === k ? (desc ? " ↓" : " ↑") : "");

  const COLS: { key: Key; label: string; help: string }[] = [
    { key: "enrollment", label: `Élèves ${sy}`, help: `Clientèle réelle ${snapshotYear} (prévisions budgétaires 2025-26)` },
    { key: "campRev", label: `Campagnes ${sy} revenus réels`, help: `Revenus réels des campagnes de financement en ${snapshotYear}` },
    { key: "campDep", label: `Campagnes ${sy} dépenses réelles`, help: `Dépenses réelles des campagnes (coûts) en ${snapshotYear}` },
    { key: "fundClose", label: `Solde FDS fin ${sy}`, help: `Solde comptable du fonds au 30 juin — pas une mesure de dépenses` },
  ];

  const cell = (n: number | undefined, kind: "money" | "int") =>
    n === undefined ? (
      <span className="cursor-help text-inksoft" title="Non disponible dans les documents reçus">
        n/d
      </span>
    ) : kind === "money" ? (
      money(n)
    ) : (
      n
    );

  const ariaSort = (k: Key): "ascending" | "descending" | "none" =>
    sort === k ? (desc ? "descending" : "ascending") : "none";

  return (
    <div className="space-y-3">
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
          {rows.length} écoles · ordre {sort === "name" ? "alphabétique" : "trié"}
        </span>
      </div>

      {/* Desktop */}
      <div className="doc scroll-x hidden sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink/70 text-left">
              <th aria-sort={ariaSort("name")} className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => click("name")}
                  className="cursor-pointer select-none font-mono text-[11px] uppercase tracking-widest text-inksoft hover:text-pen"
                >
                  École{arrow("name")}
                </button>
              </th>
              {COLS.map((c) => (
                <th key={c.key} aria-sort={ariaSort(c.key)} className="px-3 py-3 text-right">
                  <button
                    type="button"
                    title={c.help}
                    onClick={() => click(c.key)}
                    className="cursor-pointer select-none text-right font-mono text-[11px] uppercase tracking-widest text-inksoft hover:text-pen"
                  >
                    {c.label}
                    {arrow(c.key)}
                  </button>
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
                <td className="px-3 py-2.5">
                  <Link href={`/ecole/cssd/${s.code}`} className="font-medium hover:text-pen hover:underline">
                    {s.name}
                  </Link>
                  <span className="mono ml-2 text-[11px] text-inksoft">{s.code}</span>
                </td>
                <td className="mono tabular px-3 py-2.5 text-right">
                  {cell(s.enrollment[snapshotYear]?.value, "int")}
                </td>
                <td className="mono tabular px-3 py-2.5 text-right">
                  {cell(s.campaignActuals[snapshotYear]?.rev, "money")}
                </td>
                <td className="mono tabular px-3 py-2.5 text-right">
                  {cell(s.campaignActuals[snapshotYear]?.dep, "money")}
                </td>
                <td className="mono tabular px-3 py-2.5 text-right">
                  {cell(s.ledger[snapshotYear]?.totals.close, "money")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-2 sm:hidden">
        {rows.map((s) => (
          <li key={s.code}>
            <Link href={`/ecole/cssd/${s.code}`} className="doc flex items-center gap-3 p-3">
              <span className="mono tabular text-inksoft">{s.code}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{s.name}</div>
                <div className="mono tabular mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-inksoft">
                  <span>Campagnes {sy} : {cell(s.campaignActuals[snapshotYear]?.rev, "money")}</span>
                  <span>Solde FDS : {cell(s.ledger[snapshotYear]?.totals.close, "money")}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="py-6 text-center text-sm text-inksoft">Aucune école ne correspond à « {q} ».</p>
      )}

      <p className="mono text-[11px] leading-relaxed text-inksoft">
        <strong className="text-ink">Revenus / dépenses des campagnes</strong> = résultats réels {snapshotYear} (colonne « Résultats »
        des prévisions budgétaires 2025-26) · <strong className="text-ink">Solde FDS</strong> = solde comptable du fonds au 30 juin —
        il ne permet pas, à lui seul, de conclure que l'argent est inutilisé · <strong className="text-ink">n/d</strong> = non
        disponible dans les documents reçus.
      </p>
    </div>
  );
}
