import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";
import { Stat, Eyebrow, GradeLegend } from "@/components/ui";
import { schools, meta, money } from "@/lib/data";

export default function Home() {
  const b = meta.board;
  const reserveYears = b.totalBalance / b.totalSpent;
  const topHoarder = [...schools].sort((a, b) => b.latest.balance - a.latest.balance)[0];

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="rise grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <Eyebrow n="01">Écoles primaires · Gatineau · CSSPO</Eyebrow>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[0.98] tracking-tight sm:text-6xl">
            Où va l'argent des{" "}
            <span className="italic text-pen">levées de fonds</span>?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-inksoft">
            <span className="float-left mr-2 mt-1 font-display text-6xl font-medium leading-[0.7] text-ink">L</span>
            e <strong className="font-medium text-ink">fonds à destination spéciale</strong> de
            chaque école est rempli par les levées de fonds et les dons des familles. Voici, pour les{" "}
            {b.schoolCount} écoles primaires du CSS des Portages-de-l'Outaouais, combien chacune
            amasse, à quel point elle <em>dépense réellement</em> cet argent pour les élèves, et avec
            quelle rigueur elle le budgète — le tout résumé en une note de A à F.
          </p>
        </div>

        <div className="doc border-l-4 px-6 py-6" style={{ borderLeftColor: "var(--pen)" }}>
          <div className="eyebrow">Le constat</div>
          <p className="mt-3 font-display text-2xl leading-snug">
            <span className="mono tabular text-pen">{money(b.totalBalance)}</span> d'argent amassé{" "}
            <span className="penmark">dort dans les fonds</span> — près d'une année complète de
            dépenses.
          </p>
          <p className="mt-3 text-sm text-inksoft">
            L'école{" "}
            <Link href={`/ecole/${topHoarder.code}`} className="font-medium text-ink underline decoration-pen/40 underline-offset-2 hover:text-pen">
              {topHoarder.name}
            </Link>{" "}
            conserve à elle seule {money(topHoarder.latest.balance)} en réserve.
          </p>
        </div>
      </section>

      {/* Ledger summary */}
      <section className="rise space-y-4" style={{ animationDelay: "80ms" }}>
        <Eyebrow n="02" as="h2">Bilan {b.latestYear} · les 28 écoles réunies</Eyebrow>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={`Amassé ${b.latestYear}`} value={money(b.totalRaised)} hint="Levées de fonds, dons, intérêts" />
          <Stat label="Dépensé pour les élèves" value={money(b.totalSpent)} />
          <Stat label="Dort dans les fonds" value={money(b.totalBalance)} hint={`≈ ${reserveYears.toFixed(1)} an de dépenses`} accent />
          <Stat label="Écoles · années" value={`${b.schoolCount} · 7`} hint="2019-20 → 2025-26" />
        </div>
      </section>

      {/* Leaderboard */}
      <section className="rise space-y-4" style={{ animationDelay: "160ms" }}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Eyebrow n="03" as="h2">Le palmarès</Eyebrow>
          <Link href="/methodologie" className="mono shrink-0 text-xs uppercase tracking-widest text-pen hover:underline">
            Comment les notes sont calculées →
          </Link>
        </div>
        <GradeLegend />
        <p className="text-sm text-inksoft">
          Tapez le nom d'une école pour la trouver, cliquez un en-tête pour trier, ou une école pour
          son bulletin détaillé.
        </p>
        <Leaderboard schools={schools} />
      </section>
    </div>
  );
}
