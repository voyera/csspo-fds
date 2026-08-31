#!/usr/bin/env python3
"""
Produit app/data/cssd_schools.json — le jeu de données CSSD consommé par le
site. AUCUNE note, aucun rang : un explorateur de données.

Contrat central (revue contradictoire 2026-08-30) : chaque valeur budgétaire
est une OBSERVATION TYPÉE {measureYear, documentYear, columnRole} avant toute
sélection. Les trois colonnes d'un PDF de prévisions N sont :
  colonne 0 → forecast  (Prévisions N)
  colonne 1 → revised   (Révisions N-1)
  colonne 2 → actual    (Résultats N-2)
Seul `actual` est un résultat réel. Les règles de sélection sont explicites et
des barrières de publication (asserts) échouent le build plutôt que de
laisser passer une prévision déguisée en réel.

Sémantique CSSD (≠ CSSPO) : le grand livre FDS enregistre des TRANSFERTS
(ajouts vers le fonds, appropriations hors du fonds), pas le revenu/dépense
des campagnes. Les champs gardent leurs noms comptables — jamais `raised`,
`spent` ni `hoardRatio`.

Zéro vs absent : dans la ligne Clientèle, « - » (parse 0) signifie « sans
objet » (école inexistante), jamais 0 élève → traduit en absence. Dans les
campagnes, 0 est un vrai zéro (aucune campagne budgétée/réalisée).
"""
import json
import locale
import sys
import unicodedata
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
D = SITE / "data" / "cssd"
OUT = SITE / "app" / "data" / "cssd_schools.json"

FDS = json.loads((D / "cssd_fds_raw.json").read_text())
BUD = json.loads((D / "cssd_budget_raw.json").read_text())
MAN = json.loads((D / "cssd_manifest.json").read_text())
PROV = json.loads((D / "provenance.json").read_text())

SNAPSHOT = "2023-2024"          # dernier exercice avec grand livre FDS + réels campagnes
LEDGER_YEARS = ["2019-2020", "2020-2021", "2021-2022", "2022-2023", "2023-2024"]
ROLES = ["forecast", "revised", "actual"]

# Réels de campagnes attendus, par exercice mesuré → nombre d'écoles
# (2019-20 via PDF 21-22 ; 2020-21 via les 15 PDF 22-23 numériques ;
#  2021-22 via PDF 23-24 ; 2023-24 via PDF 25-26). RIEN pour 2022-23 ni 2024-25.
EXPECTED_ACTUAL_COVERAGE = {"2019-2020": 27, "2020-2021": 15,
                            "2021-2022": 28, "2023-2024": 28}
FORBIDDEN_ACTUAL_YEARS = {"2022-2023", "2024-2025"}

# Ruptures de continuité DANS LA SOURCE (miroir des KNOWN_BREAKS du
# validateur d'archive) : affichées sur la page de l'école concernée.
CONTINUITY_BREAKS = {
    ("065", "2021-2022"):
        "Rupture de continuité dans la source : le rapport 2020-21 imprime un "
        "solde de fin de 3 284 $, mais celui-ci ouvre à 970 $ (écart de "
        "2 314 $ que les documents reçus n'expliquent pas).",
}


def prev_year(y):
    a, b = y.split("-")
    return f"{int(a)-1}-{int(b)-1}"


def fail(msg):
    print(f"BARRIÈRE DE PUBLICATION: {msg}", file=sys.stderr)
    sys.exit(1)


def observations():
    """Aplati cssd_budget_raw.json en observations typées."""
    obs = []
    for doc_year, schools in BUD.items():
        for code, rec in schools.items():
            if rec.get("status") != "ok":
                continue
            years = rec["columnYears"]
            if years[0] != doc_year or years[1] != prev_year(doc_year) \
               or years[2] != prev_year(prev_year(doc_year)):
                fail(f"{doc_year} {code}: colonnes {years} ≠ (N, N-1, N-2)")
            for i, my in enumerate(years):
                role = ROLES[i]
                if rec.get("clientele") and rec["clientele"].get(my, 0) > 0:
                    obs.append({"kind": "enrollment", "code": code,
                                "measureYear": my, "documentYear": doc_year,
                                "role": role, "value": rec["clientele"][my]})
                if rec.get("campagnes"):
                    c = rec["campagnes"][my]
                    obs.append({"kind": "campaign", "code": code,
                                "measureYear": my, "documentYear": doc_year,
                                "role": role, "rev": c["rev"], "dep": c["dep"]})
    return obs


def select(obs, kind, code):
    """measureYear -> observation retenue : actual > revised > forecast.
    Au sein d'un même rôle, un (documentYear, rôle) est unique par école —
    aucun conflit d'ordre de tableau possible."""
    pick = {}
    rank = {"actual": 0, "revised": 1, "forecast": 2}
    for o in obs:
        if o["kind"] != kind or o["code"] != code:
            continue
        cur = pick.get(o["measureYear"])
        if cur is None or rank[o["role"]] < rank[cur["role"]]:
            pick[o["measureYear"]] = o
        elif cur is not None and rank[o["role"]] == rank[cur["role"]]:
            fail(f"{kind} {code} {o['measureYear']}: deux observations de rôle {o['role']}")
    return pick


def main():
    obs = observations()

    # ---- barrières de publication sur les réels de campagnes ----
    actuals = [o for o in obs if o["kind"] == "campaign" and o["role"] == "actual"]
    for o in actuals:
        if o["measureYear"] in FORBIDDEN_ACTUAL_YEARS:
            fail(f"réel de campagne fabriqué pour {o['measureYear']} ({o['code']})")
    cov = {}
    for o in actuals:
        cov[o["measureYear"]] = cov.get(o["measureYear"], 0) + 1
    if cov != EXPECTED_ACTUAL_COVERAGE:
        fail(f"couverture des réels {cov} ≠ attendue {EXPECTED_ACTUAL_COVERAGE}")

    codes = sorted(MAN["schools"].keys())
    schools = []
    for code in codes:
        name = MAN["schools"][code]
        note = MAN["identityNotes"].get(code)

        ledger = {}
        for y in LEDGER_YEARS:
            rec = FDS.get(y, {}).get(code)
            if rec is None:
                continue
            t = rec["totals"]
            # re-vérification de l'identité des totaux (défense en profondeur)
            if abs(t["open"] + t["add"] - t["approp"] - t["close"]) > 5:
                fail(f"identité des totaux {y} {code}")
            entry = {"totals": t, "format": rec["format"],
                     "projects": rec.get("projects", [])}
            if rec.get("incompleteLines"):
                entry["incompleteLines"] = True
            if rec.get("note"):
                entry["note"] = rec["note"]
            if rec.get("derivedOpen"):
                entry["derivedOpen"] = True
            if (code, y) in CONTINUITY_BREAKS:
                entry["continuityNote"] = CONTINUITY_BREAKS[(code, y)]
            ledger[y] = entry

        enr = {y: {"value": o["value"], "role": o["role"],
                   "documentYear": o["documentYear"]}
               for y, o in select(obs, "enrollment", code).items()}
        camp_actual = {o["measureYear"]: {"rev": o["rev"], "dep": o["dep"],
                                          "documentYear": o["documentYear"]}
                       for o in actuals if o["code"] == code}
        camp_budget = {o["measureYear"]: {"rev": o["rev"], "dep": o["dep"]}
                       for o in obs
                       if o["kind"] == "campaign" and o["code"] == code
                       and o["role"] == "forecast"}

        s = {"code": code, "name": name, "ledger": ledger,
             "enrollment": enr, "campaignActuals": camp_actual,
             "campaignBudgets": camp_budget}
        if note:
            s["identityNote"] = note
        # 081 et 097 : DEUX séries comptables distinctes, jamais fusionnées
        if code == "081":
            s["relatedCode"] = "097"
        if code == "097":
            s["relatedCode"] = "081"
        schools.append(s)

    # tri alphabétique fr (ordre par défaut de l'explorateur : PAS un palmarès)
    def sort_key(s):
        n = unicodedata.normalize("NFD", s["name"])
        return "".join(c for c in n if not unicodedata.combining(c)).lower()
    schools.sort(key=sort_key)

    # barrière : 081 et 097 présents séparément
    if not ({"081", "097"} <= {s["code"] for s in schools}):
        fail("081/097 doivent rester deux séries distinctes")

    snap = [s for s in schools if SNAPSHOT in s["ledger"]]
    board = {
        "schoolCount": len(snap),
        "fundClose": sum(s["ledger"][SNAPSHOT]["totals"]["close"] for s in snap),
        "fundAdds": sum(s["ledger"][SNAPSHOT]["totals"]["add"] for s in snap),
        "fundApprops": sum(s["ledger"][SNAPSHOT]["totals"]["approp"] for s in snap),
        "campRev": sum(s["campaignActuals"].get(SNAPSHOT, {}).get("rev", 0) for s in snap),
        "campDep": sum(s["campaignActuals"].get(SNAPSHOT, {}).get("dep", 0) for s in snap),
    }

    out = {
        "meta": {
            "network": "cssd",
            "networkName": "Centre de services scolaire des Draveurs",
            "snapshotYear": SNAPSHOT,
            "ledgerYears": LEDGER_YEARS,
            "actualCoverage": EXPECTED_ACTUAL_COVERAGE,
            "board": board,
            "provenance": PROV,
            "source": "CSS des Draveurs — accès à l'information (2025-10) ; "
                      "montants en dollars entiers, rapprochés des totaux imprimés",
        },
        "schools": schools,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"écrit {OUT.relative_to(SITE)} — {len(schools)} écoles, "
          f"réels campagnes {cov}, solde FDS {SNAPSHOT}: {board['fundClose']:,} $")


if __name__ == "__main__":
    main()
