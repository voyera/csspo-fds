# Le Dossier FDS — bulletin des fonds à destination spéciale

Site de transparence citoyenne sur les **fonds à destination spéciale (FDS)** des
**28 écoles primaires** du *Centre de services scolaire des Portages-de-l'Outaouais*
(Gatineau). Pour chaque école, le site montre combien elle amasse par les levées de
fonds et les dons, à quel point elle **dépense réellement** cet argent pour les élèves,
et avec quelle **rigueur** elle le budgète — le tout résumé en une note de **A à F**,
sur sept exercices (2019-20 → 2025-26).

> Données obtenues par **demande d'accès à l'information** auprès du CSSPO (octobre 2025).
> Projet citoyen indépendant, sans affiliation avec le centre de services scolaire.

---

## Qu'est-ce que le fonds à destination spéciale ?

Chaque école administre un fonds alimenté principalement par les **levées de fonds, les
ventes et les dons** des familles, ainsi que par les **surplus reportés** d'une année à
l'autre. Cet argent doit servir à des activités pour les élèves : sorties éducatives,
activités parascolaires, matériel, etc.

Les rapports « État des catégories » (logiciel Dofin) détaillent, par école et par
exercice, le **budget**, les **dépenses**, les **revenus** et la **disponibilité** (solde)
du FDS, ventilés par compte.

---

## Pile technique

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS** · **Recharts**
- Rendu entièrement statique (SSG) — se déploie tel quel sur **Vercel**, sans serveur
- Extraction des PDF en **Python** (`pdfplumber`)
- Typographie : *Fraunces* (titres), *Newsreader* (texte), *Spline Sans Mono* (chiffres)

---

## Structure du projet

```
csspo-fds-site/
├── app/
│   ├── page.tsx              # Palmarès (accueil) : bilan + tableau classé
│   ├── ecole/[code]/page.tsx # Bulletin détaillé d'une école
│   ├── methodologie/page.tsx # Sources, calcul des notes, mises en garde
│   ├── layout.tsx            # En-tête, navigation, pied de page, polices
│   ├── globals.css           # Système de design (couleurs, grain, styles)
│   └── data/schools.json     # Données finales consommées par le site (généré)
├── components/
│   ├── Leaderboard.tsx       # Tableau classé + filtre par nom (+ vue mobile)
│   ├── BudgetSample.tsx      # Échantillon du budget par année (revenus vs dépenses)
│   ├── charts.tsx            # Graphiques Recharts
│   ├── Nav.tsx               # Navigation avec état « vous êtes ici »
│   └── ui.tsx                # Badge de note, barres de score, statistiques, légende
├── lib/
│   └── data.ts               # Types, chargement des données, formatage ($, %, couleurs)
├── scripts/
│   ├── extract_fds.py        # PDF → data/fds_raw.json (extraction par coordonnées)
│   ├── build_data.py         # Métriques + notes → app/data/schools.json
│   └── validate.py           # Vérifie l'extraction contre les totaux connus de 24-25
└── data/fds_raw.json         # Extraction brute (généré)
```

---

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## Régénérer les données

Le fichier `app/data/schools.json` est versionné, donc **Vercel n'a pas besoin de Python**
au moment du build. Pour le régénérer à partir des PDF :

```bash
npm run data         # extract_fds.py  puis  build_data.py
```

Cette commande nécessite Python 3 et `pdfplumber` :

```bash
python3 -m pip install --user pdfplumber
```

Le chemin vers les PDF source est défini en haut de `scripts/extract_fds.py`
(`FDS_DIR`). Pour vérifier l'exactitude de l'extraction :

```bash
python3 scripts/validate.py    # doit afficher « ALL OK »
```

---

## Méthodologie des notes

La note globale est la **moyenne pondérée** de trois dimensions, calculées sur la
dernière année complète (**2024-25**). Les pondérations sont définies dans
`scripts/build_data.py` (`WEIGHTS`) et peuvent être ajustées.

| Dimension | Poids | Ce qu'elle mesure |
|---|---|---|
| 💰 **Capacité de financement** | 20 % | Combien l'école amasse, en valeur absolue et rapporté à sa taille (le budget du service de garde sert d'approximation du nombre d'élèves). |
| 🎯 **Argent dépensé pour les élèves** | 45 % | Part de l'argent disponible réellement dépensée + facteur « anti-accumulation » : une école assise sur plusieurs années de réserve est pénalisée. |
| 📋 **Rigueur budgétaire** | 35 % | Détail de la ventilation des dépenses, écart budget/réel, et présence d'une prévision de revenus. |

**Échelle :** A (≥ 85) · B (≥ 70) · C (≥ 55) · D (≥ 40) · F (< 40).

### Mises en garde

- Une **réserve élevée n'est pas forcément un défaut** : une école peut épargner pour un
  grand projet. Les notes posent des *questions*, elles ne portent pas de jugement définitif.
- Une école à **0 $** peut simplement ne pas tenir de levées de fonds.
- Faute de données d'effectif, la **taille** est approximée par le budget du service de garde.
- L'exercice **2025-26** est marqué « provisoire » : le rapport date du début de l'année
  scolaire et reflète surtout le budget. Il est exclu du calcul des notes.

---

## Déploiement (Vercel)

1. Pousser le dépôt sur GitHub.
2. Importer le projet dans Vercel (**aucune configuration requise** — Next.js détecté).

Ou directement depuis le dossier :

```bash
npx vercel          # aperçu
npx vercel --prod   # production
```

---

## Source des données

Rapports « État des catégories » (Dofin) du **CSS des Portages-de-l'Outaouais**, exercices
2019-20 à 2025-26, obtenus par demande d'accès à l'information (octobre 2025). Les chiffres
extraits ont été **validés au cent près** contre les totaux des rapports originaux.
