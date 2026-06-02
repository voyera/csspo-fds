import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { meta } from "@/lib/data";

export const metadata = { title: "Méthodologie — Le Dossier FDS" };

export default function Methodologie() {
  const W = meta.weights;
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <Link href="/" className="mono text-xs uppercase tracking-widest text-pen hover:underline">
        ← Le palmarès
      </Link>

      <header>
        <Eyebrow n="§">Notes & sources</Eyebrow>
        <h1 className="mt-4 font-display text-5xl font-medium leading-none">Méthodologie</h1>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Qu'est-ce que le fonds à destination spéciale?</h2>
        <p className="leading-relaxed text-inksoft">
          Chaque école primaire administre un fonds alimenté principalement par les{" "}
          <strong className="text-ink">levées de fonds, les ventes et les dons</strong> des familles,
          ainsi que par les surplus reportés d'une année à l'autre. Cet argent doit servir à des
          activités pour les élèves : sorties éducatives, activités parascolaires, matériel, etc.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Source des données</h2>
        <p className="leading-relaxed text-inksoft">
          Rapports « État des catégories » (logiciel Dofin) obtenus par demande d'accès à
          l'information auprès du CSS des Portages-de-l'Outaouais, pour les exercices 2019-20 à
          2025-26. Chaque rapport détaille, par école, le budget, les dépenses, les revenus et la
          disponibilité (solde) de son FDS. Les chiffres extraits ont été{" "}
          <span className="penmark">validés au cent près</span> contre les totaux des rapports
          originaux.
        </p>
        <p className="text-sm text-inksoft">
          L'exercice <strong className="text-ink">2025-26</strong> est marqué « provisoire » : le
          rapport date d'octobre 2025, soit le tout début de l'année scolaire, et reflète surtout le
          budget. Les notes sont calculées sur <strong className="text-ink">{meta.latestYear}</strong>,
          dernière année complète.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Les trois dimensions de la note</h2>
        <ol className="space-y-4">
          {[
            { t: `💰 Capacité de financement · ${Math.round(W.fundraising * 100)} %`, d: "Combien l'école amasse, en valeur absolue et rapporté à sa taille (le budget du service de garde sert d'approximation du nombre d'élèves, faute de données d'effectif). Mesure la « puissance » de financement, pas une vertu en soi." },
            { t: `🎯 Argent dépensé pour les élèves · ${Math.round(W.spend * 100)} %`, d: "Le cœur de la reddition de comptes. Combine la part de l'argent disponible réellement dépensée et un facteur « anti-accumulation » : une école assise sur plusieurs années de réserve est pénalisée, car cet argent ne profite pas aux élèves actuels." },
            { t: `📋 Rigueur budgétaire · ${Math.round(W.rigour * 100)} %`, d: "À quel point l'école ventile ses dépenses en postes détaillés, l'écart entre son budget et ses résultats réels, et le fait qu'elle prévoie ou non ses revenus." },
          ].map((x, i) => (
            <li key={i} className="doc flex gap-4 p-5">
              <span className="mono text-2xl text-pen">{i + 1}</span>
              <div>
                <div className="font-display text-lg">{x.t}</div>
                <p className="mt-1 text-inksoft">{x.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="leading-relaxed text-inksoft">
          La note globale est la moyenne pondérée des trois dimensions :{" "}
          <strong className="text-ink">A</strong> (≥85), <strong className="text-ink">B</strong> (≥70),{" "}
          <strong className="text-ink">C</strong> (≥55), <strong className="text-ink">D</strong> (≥40),{" "}
          <strong className="text-ink">F</strong> (&lt;40).
        </p>
      </section>

      <section className="space-y-3 border-l-4 border-pen bg-paper2/50 p-5">
        <h2 className="font-display text-xl">Limites & mises en garde</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-inksoft">
          <li>Une réserve élevée n'est pas forcément un défaut : une école peut épargner pour un grand projet (cour d'école, voyage). Les notes posent des <em>questions</em>, elles ne portent pas de jugement définitif.</li>
          <li>Une école à 0 $ peut simplement ne pas tenir de levées de fonds, sans que ce soit répréhensible.</li>
          <li>Faute de données d'effectif, la taille est approximée par le budget du service de garde.</li>
          <li>Projet citoyen indépendant, sans affiliation avec le CSSPO. Les pondérations ci-dessus sont un choix éditorial et peuvent être ajustées.</li>
        </ul>
      </section>
    </div>
  );
}
