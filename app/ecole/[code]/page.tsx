import Link from "next/link";
import { notFound } from "next/navigation";
import { BalanceTrend, RaisedVsSpent } from "@/components/charts";
import BudgetSample from "@/components/BudgetSample";
import { GradeBadge, ScoreBar, Stat, Eyebrow } from "@/components/ui";
import { getSchool, schools, meta, money, pct } from "@/lib/data";

export function generateStaticParams() {
  return schools.map((s) => ({ code: s.code }));
}

export function generateMetadata({ params }: { params: { code: string } }) {
  const s = getSchool(params.code);
  return { title: s ? `${s.name} — bulletin FDS` : "École introuvable" };
}

function narrative(s: NonNullable<ReturnType<typeof getSchool>>): string {
  const m = s.latest;
  const bits: string[] = [];
  if (m.hoardRatio >= 2)
    bits.push(
      `L'école conserve l'équivalent de ${m.hoardRatio.toFixed(1)} années de dépenses (${money(
        m.balance
      )}) en réserve — un coussin nettement supérieur à la moyenne.`
    );
  else if (m.hoardRatio <= 0.6 && m.spent > 0)
    bits.push(`L'école dépense l'essentiel de ce qu'elle amasse : peu d'argent dort dans le fonds.`);
  if (m.spendThrough >= 1)
    bits.push(`En ${meta.latestYear}, elle a dépensé plus qu'elle n'a amassé, puisant dans ses surplus.`);
  if (m.budgetRevenu === 0)
    bits.push(`Elle n'inscrit aucune prévision de revenus à son budget, ce qui limite la rigueur budgétaire.`);
  if (m.granularity >= 6) bits.push(`Sa ventilation des dépenses est détaillée (${m.granularity} postes).`);
  else if (m.granularity <= 3) bits.push(`Sa ventilation des dépenses est peu détaillée (${m.granularity} postes).`);
  return bits.join(" ");
}

export default function SchoolPage({ params }: { params: { code: string } }) {
  const s = getSchool(params.code);
  if (!s) notFound();
  const m = s.latest;
  const W = meta.weights;

  return (
    <div className="space-y-12">
      <Link href="/" className="mono text-xs uppercase tracking-widest text-pen hover:underline">
        ← Le palmarès
      </Link>

      {/* Masthead */}
      <header className="rise flex flex-wrap items-end justify-between gap-6 border-b-2 border-ink/70 pb-6">
        <div>
          <div className="eyebrow">
            Bulletin · École {s.code} · {s.rank}<sup>e</sup> rang sur {schools.length}
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium leading-none sm:text-5xl">{s.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="eyebrow">Note globale</div>
            <div className="mono tabular text-3xl font-medium leading-none">{s.composite}<span className="text-inksoft text-xl">/100</span></div>
          </div>
          <GradeBadge grade={s.grade} size="lg" />
        </div>
      </header>

      {/* Ledger figures */}
      <section className="rise grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: "60ms" }}>
        <Stat label={`Amassé ${meta.latestYear}`} value={money(m.raised)} hint={`dont ${money(m.fundraised)} en ventes/levées`} />
        <Stat label="Dépensé pour les élèves" value={money(m.spent)} hint={`${pct(Math.min(1.5, m.spendThrough))} de l'argent disponible`} />
        <Stat label="Dort dans le fonds" value={money(m.balance)} accent={m.hoardRatio >= 2} />
        <Stat label="Réserve accumulée" value={m.hoardRatio >= 99 ? "∞" : `${m.hoardRatio.toFixed(1)} ans`} hint="de dépenses en banque" />
      </section>

      {/* Report card */}
      <section className="rise space-y-4" style={{ animationDelay: "120ms" }}>
        <Eyebrow n="A" as="h2">Le bulletin</Eyebrow>
        <div className="doc p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <ScoreBar label={`💰 Financement · ${Math.round(W.fundraising * 100)} %`} value={s.scores.fundraising} />
            <ScoreBar label={`🎯 Dépensé pour les élèves · ${Math.round(W.spend * 100)} %`} value={s.scores.spend} />
            <ScoreBar label={`📋 Rigueur budgétaire · ${Math.round(W.rigour * 100)} %`} value={s.scores.rigour} />
          </div>
          {narrative(s) && (
            <p className="mt-6 border-t border-rule pt-5 font-display text-lg italic leading-relaxed text-ink">
              {narrative(s)}
            </p>
          )}
        </div>
      </section>

      {/* Trends — exclude provisional in-progress years (incomplete actuals) */}
      {(() => {
        const complete = s.history.filter((h) => !h.provisional);
        return (
          <section className="rise space-y-4" style={{ animationDelay: "180ms" }}>
            <Eyebrow n="B" as="h2">Au fil des ans</Eyebrow>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="doc p-5">
                <h3 className="font-display text-xl">Amassé vs dépensé</h3>
                <p className="mb-3 mono text-[11px] uppercase tracking-widest text-inksoft">par année scolaire complète</p>
                <RaisedVsSpent history={complete} />
              </div>
              <div className="doc p-5">
                <h3 className="font-display text-xl">L'argent qui s'accumule</h3>
                <p className="mb-3 mono text-[11px] uppercase tracking-widest text-inksoft">solde non dépensé en fin d'année</p>
                <BalanceTrend history={complete} />
              </div>
            </div>
          </section>
        );
      })()}

      {/* Budget sample */}
      <section className="rise space-y-4" style={{ animationDelay: "240ms" }}>
        <Eyebrow n="C" as="h2">Échantillon du budget · revenus vs dépenses</Eyebrow>
        <BudgetSample history={s.history} />
      </section>

      <p className="text-sm text-inksoft">
        Source : {meta.source}. Voir la{" "}
        <Link href="/methodologie" className="text-pen underline underline-offset-2">méthodologie</Link>{" "}
        pour l'interprétation des notes.
      </p>
    </div>
  );
}
