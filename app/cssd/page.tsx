import type { Metadata } from "next";
import Link from "next/link";
import CssdExplorer from "@/components/CssdExplorer";
import { Stat, Eyebrow } from "@/components/ui";
import { money } from "@/lib/data";
import { cssdMeta, cssdSchools, shortYear } from "@/lib/cssd";

export const metadata: Metadata = {
  title: "Données CSSD — Le Dossier FDS",
  description:
    "Les fonds à destination spéciale des écoles primaires du CSS des Draveurs (Gatineau) : données d'accès à l'information, sans notes — grand livre des fonds, campagnes de financement réelles et effectifs.",
};

export default function CssdPage() {
  const m = cssdMeta;
  const b = m.board;
  const sy = shortYear(m.snapshotYear);

  return (
    <div className="space-y-12">
      {/* Entête — neutre : c'est un explorateur de données, pas un palmarès */}
      <section className="rise">
        <Eyebrow n="01">Écoles primaires · Gatineau · CSS des Draveurs</Eyebrow>
        <h1 className="mt-5 font-display text-5xl font-medium leading-[0.98] tracking-tight sm:text-6xl">
          Les données du <span className="italic text-pen">CSS des Draveurs</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-inksoft">
          Une deuxième demande d'accès à l'information couvre les {b.schoolCount} écoles primaires du{" "}
          <strong className="font-medium text-ink">Centre de services scolaire des Draveurs</strong> (Gatineau).
          Voici ces documents, mis en tableau : le grand livre du fonds à destination spéciale de chaque
          école (2019-20 → 2023-24), les résultats réels de leurs campagnes de financement et leurs effectifs.
        </p>
      </section>

      {/* Pourquoi pas de notes — l'explication AVANT les chiffres */}
      <section className="rise doc border-l-4 px-6 py-6" style={{ borderLeftColor: "var(--pen)", animationDelay: "60ms" }}>
        <div className="eyebrow">Pourquoi pas de notes A–F ici?</div>
        <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
          Parce que les documents du CSSD ne mesurent pas la même chose que ceux du CSSPO.
        </p>
        <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
          <li>
            <strong className="font-medium text-ink">Ce qu'ils montrent</strong> : le grand livre comptable du
            fonds — des <em>ajouts</em> (transferts vers le fonds) et des <em>appropriations</em> (transferts
            hors du fonds quand des dépenses liées sont engagées).
          </li>
          <li>
            <strong className="font-medium text-ink">Ce qu'ils ne montrent pas</strong> : l'argent réel des
            campagnes. Une école a amassé 11&nbsp;270&nbsp;$ et dépensé 7&nbsp;245&nbsp;$ dans l'année — son
            fonds n'a enregistré qu'un transfert de 5&nbsp;416&nbsp;$.
          </li>
        </ul>
        <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
          Noter ces écoles avec la méthode du CSSPO serait comptablement invalide. Les données sont donc
          publiées <strong className="font-medium text-ink">sans notes ni classement</strong>, en ordre
          alphabétique.{" "}
          <Link href="/methodologie" className="text-pen underline decoration-pen/40 underline-offset-2">
            Détails en méthodologie →
          </Link>
        </p>
      </section>

      {/* Instantané cohérent : tout est daté du même exercice */}
      <section className="rise space-y-4" style={{ animationDelay: "120ms" }}>
        <Eyebrow n="02" as="h2">Instantané {m.snapshotYear} · les {b.schoolCount} écoles réunies</Eyebrow>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={`Campagnes ${sy} · revenus réels`} value={money(b.campRev)} hint="Résultats réels des campagnes de financement" />
          <Stat label={`Campagnes ${sy} · dépenses réelles`} value={money(b.campDep)} hint="Coûts des campagnes" />
          <Stat label={`FDS · ajouts ${sy}`} value={money(b.fundAdds)} hint="Transferts comptables vers les fonds" />
          <Stat label={`FDS · solde fin ${sy}`} value={money(b.fundClose)} hint="Solde comptable au 30 juin 2024" accent />
        </div>
        <p className="max-w-3xl text-sm text-inksoft">
          Aucun grand livre FDS 2024-25 et aucun résultat réel 2024-25 des campagnes ne figurent dans les
          documents reçus — le dernier exercice complet du CSSD est {m.snapshotYear} (le CSSPO, lui, est noté
          sur 2024-25 : les deux réseaux ne sont pas comparables directement).
        </p>
      </section>

      {/* Explorateur */}
      <section className="rise space-y-4" style={{ animationDelay: "180ms" }}>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Eyebrow n="03" as="h2">L'explorateur · {m.snapshotYear}</Eyebrow>
          <span className="mono shrink-0 text-xs uppercase tracking-widest text-inksoft">
            Sans notes · ordre alphabétique
          </span>
        </div>
        <p className="text-sm text-inksoft">
          Tapez le nom d'une école pour la trouver, cliquez un en-tête pour trier, ou une école pour son
          dossier détaillé. Chaque colonne indique l'exercice et la nature de la mesure.
        </p>
        <CssdExplorer schools={cssdSchools} snapshotYear={m.snapshotYear} />
      </section>

      {/* Provenance */}
      <section className="rise text-sm text-inksoft" style={{ animationDelay: "240ms" }}>
        <p className="max-w-3xl">
          Sources : rapports « Fonds à destination spéciale » (captures, 2019-20 → 2023-24) et prévisions
          budgétaires des établissements (PDF) obtenus par accès à l'information (octobre 2025). Montants en
          dollars entiers, rapprochés des totaux imprimés. Couverture des résultats réels de campagnes :
          2019-20, 2021-22 et 2023-24 pour toutes les écoles; 2020-21 pour 15 écoles (les autres PDF sont des
          numérisations).
        </p>
      </section>
    </div>
  );
}
