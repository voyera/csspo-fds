import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Stat, Eyebrow } from "@/components/ui";
import { money } from "@/lib/data";
import {
  cssdMeta,
  cssdSchools,
  getCssdSchool,
  shortYear,
  ROLE_LABEL,
  CSSD_TERMS,
  type LedgerYear,
} from "@/lib/cssd";

export function generateStaticParams() {
  return cssdSchools.map((s) => ({ code: s.code }));
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const s = getCssdSchool(params.code);
  return {
    title: s ? `École ${s.name} (CSSD) — Le Dossier FDS` : "École — Le Dossier FDS",
    description: s
      ? `Fonds à destination spéciale et campagnes de financement de l'école ${s.name} (CSS des Draveurs) — données d'accès à l'information, sans note.`
      : undefined,
  };
}

function LedgerTable({ year, entry }: { year: string; entry: LedgerYear }) {
  const t = entry.totals;
  const summaryOnly = entry.format === "summary-4-lignes";
  return (
    <div className="doc scroll-x">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink/70 px-3 py-2.5">
        <span className="font-display text-lg font-medium">{year}</span>
        {summaryOnly && (
          <span className="mono text-[11px] uppercase tracking-widest text-inksoft">
            Sommaire seulement — pas de détail par projet dans la source
          </span>
        )}
      </div>

      {entry.incompleteLines && (
        <div className="border-b border-rule bg-[#faf1df] px-3 py-2.5 text-sm text-ink">
          <strong className="font-medium">Liste partielle.</strong> {entry.note} Les totaux imprimés
          ci-dessous restent exacts; la ventilation par projet, elle, est incomplète.
        </div>
      )}

      {entry.continuityNote && (
        <div className="border-b border-rule bg-[#faf1df] px-3 py-2.5 text-sm text-ink">
          <strong className="font-medium">À noter.</strong> {entry.continuityNote}
        </div>
      )}

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-rule text-left">
            <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-inksoft">Projet</th>
            <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Solde début</th>
            <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Ajouts</th>
            <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Appropriations</th>
            <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Solde fin</th>
          </tr>
        </thead>
        <tbody>
          {entry.projects.map((p) => (
            <tr key={p.label} className="border-b border-rule/60">
              <td className="px-3 py-2">
                {p.label}
                {p.sourceAnomaly && (
                  <span className="ml-1 cursor-help text-pen" title={p.sourceAnomaly}>†</span>
                )}
              </td>
              <td className="mono tabular px-3 py-2 text-right">{money(p.open)}</td>
              <td className="mono tabular px-3 py-2 text-right">{money(p.add)}</td>
              <td className="mono tabular px-3 py-2 text-right">{p.approp ? `(${money(p.approp)})` : "—"}</td>
              <td className="mono tabular px-3 py-2 text-right">{money(p.close)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-ink/70 font-medium">
            <td className="px-3 py-2">
              {entry.incompleteLines ? "Totaux imprimés (complets)" : "Total"}
              {entry.derivedOpen && (
                <span
                  className="ml-1 cursor-help text-pen"
                  title={entry.note ?? "Solde début dérivé de l'identité comptable (cellule vierge dans la source)."}
                >
                  †
                </span>
              )}
            </td>
            <td className="mono tabular px-3 py-2 text-right">{money(t.open)}</td>
            <td className="mono tabular px-3 py-2 text-right">{money(t.add)}</td>
            <td className="mono tabular px-3 py-2 text-right">{t.approp ? `(${money(t.approp)})` : "—"}</td>
            <td className="mono tabular px-3 py-2 text-right">{money(t.close)}</td>
          </tr>
        </tbody>
      </table>

      {entry.projects.some((p) => p.sourceAnomaly) && (
        <p className="px-3 py-2 text-[12px] leading-relaxed text-inksoft">
          † Anomalie du document source (les chiffres imprimés sont reproduits tels quels) :{" "}
          {entry.projects.find((p) => p.sourceAnomaly)?.sourceAnomaly}
        </p>
      )}

      {entry.derivedOpen && (
        <p className="px-3 py-2 text-[12px] leading-relaxed text-inksoft">
          † {entry.note ??
            "Solde début dérivé de l'identité comptable (cellule vierge dans le document source)."}
        </p>
      )}
    </div>
  );
}

export default function CssdSchoolPage({ params }: { params: { code: string } }) {
  const s = getCssdSchool(params.code);
  if (!s) notFound();

  const m = cssdMeta;
  const snap = m.snapshotYear;
  const sy = shortYear(snap);
  const related = s.relatedCode ? getCssdSchool(s.relatedCode) : undefined;

  const ledgerYears = m.ledgerYears.filter((y) => s.ledger[y]).reverse();
  const enrLatest = s.enrollment[snap];
  // même ordre que le grand livre : du plus récent au plus ancien
  const campYears = Array.from(
    new Set([...Object.keys(s.campaignBudgets), ...Object.keys(s.campaignActuals)]),
  )
    .sort()
    .reverse();

  return (
    <div className="space-y-12">
      <section className="rise">
        <Eyebrow n="—">
          <Link href="/cssd" className="hover:text-pen hover:underline">Données CSSD</Link>
          <span className="mx-2 text-inksoft">/</span>École {s.code}
        </Eyebrow>
        <h1 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          École {s.name}
        </h1>
        <p className="mt-3 max-w-2xl text-inksoft">
          CSS des Draveurs · code d'établissement {s.code}
          {enrLatest && (
            <>
              {" "}· {enrLatest.value} élèves en {snap} ({ROLE_LABEL[enrLatest.role]})
            </>
          )}
        </p>
        {s.identityNote && (
          <p className="mt-3 max-w-2xl border-l-2 border-pen/50 pl-3 text-sm text-inksoft">{s.identityNote}</p>
        )}
        {related && (
          <p className="mt-2 max-w-2xl border-l-2 border-pen/50 pl-3 text-sm text-inksoft">
            Dossier antérieur possiblement lié :{" "}
            <Link href={`/ecole/cssd/${related.code}`} className="text-pen underline decoration-pen/40 underline-offset-2">
              école {related.name} (code {related.code})
            </Link>
            . Les deux séries comptables sont présentées séparément — la transition n'est pas confirmée.
          </p>
        )}
      </section>

      {s.ledger[snap] && (
        <section className="rise space-y-4" style={{ animationDelay: "60ms" }}>
          <Eyebrow n="01" as="h2">Instantané {snap}</Eyebrow>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label={`Campagnes ${sy} · revenus réels`}
              value={s.campaignActuals[snap] ? money(s.campaignActuals[snap].rev) : "n/d"}
            />
            <Stat
              label={`Campagnes ${sy} · dépenses réelles`}
              value={s.campaignActuals[snap] ? money(s.campaignActuals[snap].dep) : "n/d"}
            />
            <Stat label={`FDS · ajouts ${sy}`} value={money(s.ledger[snap].totals.add)} />
            <Stat label={`FDS · solde fin ${sy}`} value={money(s.ledger[snap].totals.close)} accent />
          </div>
          <p className="max-w-3xl text-sm text-inksoft">{CSSD_TERMS.close}.</p>
        </section>
      )}

      {campYears.length > 0 && (
        <section className="rise space-y-4" style={{ animationDelay: "120ms" }}>
          <Eyebrow n="02" as="h2">Campagnes de financement · budget vs réel</Eyebrow>
          <div className="doc scroll-x">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-ink/70 text-left">
                  <th className="px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-inksoft">Exercice</th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Revenus prévus</th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Revenus réels</th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Dépenses prévues</th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Dépenses réelles</th>
                  <th className="px-3 py-2 text-right font-mono text-[11px] uppercase tracking-widest text-inksoft">Surplus réel</th>
                </tr>
              </thead>
              <tbody>
                {campYears.map((y) => {
                  const bud = s.campaignBudgets[y];
                  const act = s.campaignActuals[y];
                  const surplus = act ? act.rev - act.dep : undefined;
                  return (
                    <tr key={y} className="border-b border-rule/60">
                      <td className="mono tabular px-3 py-2">{y}</td>
                      <td className="mono tabular px-3 py-2 text-right">{bud ? money(bud.rev) : <span className="cursor-help text-inksoft" title="Non disponible dans les documents reçus">n/d</span>}</td>
                      <td className="mono tabular px-3 py-2 text-right font-medium">{act ? money(act.rev) : <span className="cursor-help font-normal text-inksoft" title="Non disponible dans les documents reçus">n/d</span>}</td>
                      <td className="mono tabular px-3 py-2 text-right">{bud ? money(bud.dep) : <span className="cursor-help text-inksoft" title="Non disponible dans les documents reçus">n/d</span>}</td>
                      <td className="mono tabular px-3 py-2 text-right font-medium">{act ? money(act.dep) : <span className="cursor-help font-normal text-inksoft" title="Non disponible dans les documents reçus">n/d</span>}</td>
                      <td className="mono tabular px-3 py-2 text-right">
                        {surplus === undefined ? (
                          <span className="cursor-help text-inksoft" title="Non disponible dans les documents reçus">n/d</span>
                        ) : surplus < 0 ? (
                          `(${money(-surplus)})`
                        ) : (
                          money(surplus)
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="max-w-3xl text-[12px] leading-relaxed text-inksoft">
            « Réels » = colonne Résultats des prévisions budgétaires produites deux ans plus tard; « prévus » =
            budget de l'exercice. {CSSD_TERMS.campDep}. n/d = non disponible dans les documents reçus (PDF
            numérisés ou exercice absent).
          </p>
          <p className="max-w-3xl text-[12px] leading-relaxed text-inksoft">
            Un surplus (ou déficit) de campagne ne se rend au fonds à destination spéciale que si l'école l'y
            transfère explicitement (un « ajout » au grand livre ci-dessous). Quand aucun ajout correspondant
            n'y figure, les documents reçus ne précisent pas où le surplus est allé.
          </p>
        </section>
      )}

      <section className="rise space-y-4" style={{ animationDelay: "180ms" }}>
        <Eyebrow n="03" as="h2">Grand livre du fonds à destination spéciale</Eyebrow>
        <p className="max-w-3xl text-sm text-inksoft">
          Reproduction des rapports obtenus, exercice par exercice. {CSSD_TERMS.add}; {CSSD_TERMS.approp}.
        </p>
        <div className="space-y-6">
          {ledgerYears.map((y) => (
            <LedgerTable key={y} year={y} entry={s.ledger[y]} />
          ))}
        </div>
      </section>

      <section className="rise text-sm text-inksoft" style={{ animationDelay: "240ms" }}>
        <p className="max-w-3xl">
          Données obtenues par accès à l'information auprès du CSS des Draveurs (octobre 2025). Montants en
          dollars entiers, rapprochés des totaux imprimés des documents originaux. Aucune note n'est attribuée
          aux écoles du CSSD — <Link href="/methodologie" className="text-pen underline decoration-pen/40 underline-offset-2">voir la méthodologie</Link>.
        </p>
      </section>
    </div>
  );
}
