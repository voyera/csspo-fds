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
        <h2 className="font-display text-2xl">Source des données — CSSPO</h2>
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

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Source des données — CSS des Draveurs (CSSD)</h2>
        <p className="leading-relaxed text-inksoft">
          Une deuxième demande d'accès à l'information (octobre 2025) couvre les écoles primaires du
          CSS des Draveurs : rapports « Fonds à destination spéciale » (captures d'écran, un rapport
          par école, 2019-20 → 2023-24) et prévisions budgétaires des établissements (PDF, 2019-20 →
          2023-24 et 2025-26).
        </p>
        <p className="leading-relaxed text-inksoft">
          Ces documents ne mesurent pas la même chose que ceux du CSSPO. Les rapports FDS du CSSD
          montrent le <strong className="text-ink">grand livre comptable du fonds</strong> — des{" "}
          <em>ajouts</em> (transferts vers le fonds) et des <em>appropriations</em> (transferts hors du
          fonds quand des dépenses liées sont engagées) — et non les revenus et dépenses des campagnes
          de financement. Exemple vérifié : en 2023-24, une école a réellement amassé 11&nbsp;270&nbsp;$
          en campagnes et dépensé 7&nbsp;245&nbsp;$, alors que son fonds n'enregistrait qu'un ajout de
          5&nbsp;416&nbsp;$ et aucune appropriation. Les revenus et dépenses{" "}
          <strong className="text-ink">réels</strong> des campagnes proviennent, eux, de la colonne
          « Résultats » des prévisions budgétaires produites deux ans plus tard — disponibles pour
          2019-20, 2021-22 et 2023-24 (et 2020-21 pour 15 écoles; les autres PDF sont des
          numérisations illisibles par machine).
        </p>
        <p className="leading-relaxed text-inksoft">
          <strong className="text-ink">C'est pourquoi les écoles du CSSD ne reçoivent pas de note
          A–F :</strong> appliquer la méthode du CSSPO à un grand livre de transferts serait
          comptablement invalide. Il n'existe par ailleurs aucun grand livre FDS 2024-25 ni aucun
          résultat réel 2024-25 de campagnes dans les documents reçus — le dernier exercice complet du
          CSSD est 2023-24, alors que le CSSPO est noté sur 2024-25. Les deux réseaux ne sont donc pas
          comparables entre eux, et le site ne les classe jamais l'un contre l'autre.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-inksoft">
          <li>
            Les montants du CSSD sont en <strong className="text-ink">dollars entiers</strong> : ils
            sont <span className="penmark">rapprochés des totaux imprimés</span> des documents
            originaux (identités comptables, totaux et continuité des soldes entre exercices, plus une
            contre-lecture indépendante par reconnaissance de caractères), jamais « au cent près ».
          </li>
          <li>
            Les anomalies des documents sources sont affichées telles quelles avec un avertissement sur
            la page concernée (listes de projets partielles, incohérence interne de ±180&nbsp;$ dans un
            rapport, solde restaté entre deux exercices, cellule vierge) — jamais corrigées en douce.
          </li>
          <li>
            L'école de la Traversée change de code (081 → 097) en 2023-24 avec une baisse d'effectif
            marquée : les deux dossiers sont présentés comme des séries distinctes, la transition
            n'étant pas confirmée. L'école 076 apparaît en 2023-24 sous deux noms selon le document
            (« Des Sentiers » / « École Lavigne »).
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Les trois dimensions de la note (CSSPO seulement)</h2>
        <ol className="space-y-4">
          {[
            { t: `💰 Capacité de financement · ${Math.round(W.fundraising * 100)} %`, d: "Combien l'école amasse en argent (levées de fonds, dons, intérêts), sans aucun ajustement selon la taille de l'école : on mesure la puissance de financement brute, pas un montant par élève. L'école qui amasse le plus obtient 100, les autres en proportion directe. Exemple : en 2024-25, l'école de la Forêt a amassé le plus (133 876 $) et obtient donc 100 ; Euclide-Lanthier, avec 72 107 $, obtient 54 (soit 72 107 ÷ 133 876). C'est une mesure de capacité, pas une vertu — amasser beaucoup reflète souvent un quartier plus aisé qu'un meilleur effort." },
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
          <li>La capacité de financement n'est pas ajustée selon le nombre d'élèves : une grande école part avantagée sur cette dimension (c'est l'une des raisons pour lesquelles elle ne pèse que 20 % de la note).</li>
          <li>Projet citoyen indépendant, sans affiliation avec le CSSPO. Les pondérations ci-dessus sont un choix éditorial et peuvent être ajustées.</li>
        </ul>
      </section>
    </div>
  );
}
