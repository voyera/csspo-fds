#!/usr/bin/env python3
"""
Turn the raw FDS extraction into the scored dataset the website consumes.

Produces app/data/schools.json:
  - per school: identity, 7-year history of money raised / spent / balance,
    and a v1 report-card (Fundraising power, Spend-through, Budgeting rigour
    -> composite A-F grade).
  - board-wide totals + methodology weights (so the site can explain itself).

Scoring is intentionally simple and transparent; weights live in WEIGHTS and
are surfaced on the methodology page so they can be tuned.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = json.loads((ROOT / "data" / "fds_raw.json").read_text())
OUT = ROOT / "app" / "data" / "schools.json"

# code -> (name, _unused, total operating budget)
# from the 2024-2025 "Budgets adoptés des établissements" summary.
# (middle value is no longer used in scoring; kept to avoid renumbering.)
SCHOOLS = {
    "001": ("Euclide-Lanthier", 515013, 984374),
    "002": ("Côte-du-Nord", 473436, 926813),
    "003": ("des Rapides-Deschênes", 481981, 981271),
    "004": ("Internationale du Mont-Bleu", 656030, 1295864),
    "005": ("Jean-de-Brébeuf", 353281, 768017),
    "006": ("Internationale du Village", 885911, 1791553),
    "007": ("du Lac-des-Fées", 560000, 1029578),
    "008": ("du Plateau", 648366, 1206591),
    "011": ("du Vieux-Verger", 435964, 797959),
    "012": ("du Grand-Boisé", 746089, 1302609),
    "013": ("Saint-Paul", 294424, 740448),
    "014": ("des Trois-Portages", 458776, 902026),
    "015": ("du Parc-de-la-Montagne", 530964, 1087252),
    "016": ("Saint-Jean-Bosco", 372725, 805055),
    "017": ("Notre-Dame", 190498, 615388),
    "018": ("du Dôme", 592346, 992059),
    "019": ("Saint-Rédempteur", 281785, 734718),
    "020": ("au Cœur-des-Collines", 377906, 898885),
    "026": ("du Marais", 501497, 1011807),
    "027": ("de la Vallée-des-Voyageurs", 393922, 941137),
    "028": ("des Deux-Ruisseaux", 767924, 1348392),
    "029": ("des Tournesols", 521506, 998403),
    "032": ("de l'Amérique-Française", 798644, 1386711),
    "033": ("des Cavaliers", 843906, 1472389),
    "034": ("de la Forêt", 794055, 1405816),
    "035": ("de la Petite-Ourse", 436110, 846848),
    "036": ("du Grand-Héron", 710230, 1263754),
    "037": ("de l'Aigle", 341232, 704153),
}

YEARS = ["19-20", "20-21", "21-22", "22-23", "23-24", "24-25", "25-26"]
LATEST = "24-25"            # latest fiscal year with full-year actuals
PROVISIONAL = ["25-26"]    # report dated 2025-10-06: ~3 months in, mostly budget

# expense accounts (depense column) grouped into human categories
EXPENSE_CATS = {
    "401": "Fournitures",
    "405": "Livres / revues",
    "406": "Matériel didactique",
    "407": "Aliments & boissons",
    "520": "Services spécialisés",
    "530": "Transport",
    "836": "Sorties éducatives",
}
STAFF_ACCTS = {"181", "201", "203", "204", "205", "206"}

# revenue accounts (revenu column) grouped into human categories
REVENUE_CATS = {
    "986": "Ventes & levées de fonds",
    "902": "Revenus internes / intérêts",
    "984": "Gala / événement",
}

WEIGHTS = {"fundraising": 0.20, "spend": 0.45, "rigour": 0.35}


def clamp(v, lo=0.0, hi=100.0):
    return max(lo, min(hi, v))


def year_metrics(rec):
    """Derived figures for one school in one year."""
    s = rec.get("summary") or {}
    accts = rec.get("accounts", {})
    raised = s.get("revenu", 0.0)
    spent = s.get("depense", 0.0)
    balance = s.get("disponibilite", 0.0)
    activity_budget = s.get("budget", 0.0)
    budget_revenu = rec.get("budget_revenu", 0.0)
    surplus_in = accts.get("890", {}).get("budget", 0.0)
    fundraised = accts.get("986", {}).get("revenu", 0.0)
    internal_rev = accts.get("902", {}).get("revenu", 0.0)

    expenses = {}
    for code, label in EXPENSE_CATS.items():
        v = accts.get(code, {}).get("depense", 0.0)
        if v:
            expenses[label] = round(v, 2)
    staff = round(sum(accts.get(c, {}).get("depense", 0.0) for c in STAFF_ACCTS), 2)
    if staff:
        expenses["Salaires & charges"] = staff
    granularity = len(expenses)

    revenues = {}
    for code, label in REVENUE_CATS.items():
        v = accts.get(code, {}).get("revenu", 0.0)
        if v:
            revenues[label] = round(v, 2)

    # proposed budget (budget column) — what the direction planned, often a
    # single lump line. Reveals how simple/detailed the initial budget was.
    exp_budget = {}
    for code, label in EXPENSE_CATS.items():
        v = accts.get(code, {}).get("budget", 0.0)
        if v:
            exp_budget[label] = round(v, 2)
    rev_budget = {}
    if budget_revenu:
        rev_budget["Ventes & levées de fonds"] = round(budget_revenu, 2)

    available = raised + surplus_in
    spend_through = (spent / available) if available > 0 else 0.0
    hoard_ratio = (balance / spent) if spent > 0 else (99.0 if balance > 0 else 0.0)

    return {
        "raised": round(raised, 2),
        "fundraised": round(fundraised, 2),
        "internalRev": round(internal_rev, 2),
        "spent": round(spent, 2),
        "balance": round(balance, 2),
        "surplusIn": round(surplus_in, 2),
        "activityBudget": round(activity_budget, 2),
        "budgetRevenu": round(budget_revenu, 2),
        "expenses": expenses,
        "revenues": revenues,
        "expBudget": exp_budget,
        "revBudget": rev_budget,
        "granularity": granularity,
        "spendThrough": round(spend_through, 4),
        "hoardRatio": round(hoard_ratio, 3),
    }


def fundraising_score(raised, cohort_max):
    # absolute amount raised, scaled so the top fundraiser = 100. No size
    # adjustment: this measures raw fundraising pull, not a per-student rate.
    return clamp(100 * raised / cohort_max) if cohort_max else 0.0


def spend_score(m):
    if m["spent"] <= 0:
        return 0.0
    through = 100 * min(1.2, m["spendThrough"]) / 1.2
    anti_hoard = 100 * clamp((3.0 - m["hoardRatio"]) / 3.0, 0, 1)
    return clamp(0.5 * through + 0.5 * anti_hoard)


def rigour_score(m):
    granularity = clamp((m["granularity"] - 1) / 6.0 * 100)
    # forecast accuracy: how close plan was to actuals (spend + revenue)
    def var(actual, plan):
        denom = max(actual, plan, 1.0)
        return abs(actual - plan) / denom
    acc = 1 - (var(m["spent"], m["activityBudget"]) + var(m["raised"], m["budgetRevenu"])) / 2
    accuracy = clamp(acc * 100)
    bonus = 8 if m["budgetRevenu"] > 0 else 0
    return clamp(0.4 * granularity + 0.5 * accuracy + bonus)


def grade(score):
    return ("A" if score >= 85 else "B" if score >= 70 else
            "C" if score >= 55 else "D" if score >= 40 else "F")


def main():
    # pass 1: per-school history + latest metrics
    schools = []
    for code, (name, sdg, total) in SCHOOLS.items():
        history = []
        for y in YEARS:
            rec = RAW.get(y, {}).get(code)
            if rec is None:
                continue
            m = year_metrics(rec)
            m["year"] = y
            m["provisional"] = y in PROVISIONAL
            history.append(m)
        latest = next((h for h in history if h["year"] == LATEST), None)
        if latest is None:
            continue
        schools.append({
            "code": code, "name": name, "totalBudget": total,
            "latest": latest, "history": history,
        })

    cohort_max = max(s["latest"]["raised"] for s in schools) or 1

    # pass 2: scores
    for s in schools:
        m = s["latest"]
        fs = fundraising_score(m["raised"], cohort_max)
        ss = spend_score(m)
        rs = rigour_score(m)
        composite = (WEIGHTS["fundraising"] * fs + WEIGHTS["spend"] * ss
                     + WEIGHTS["rigour"] * rs)
        s["scores"] = {"fundraising": round(fs), "spend": round(ss), "rigour": round(rs)}
        s["composite"] = round(composite, 1)
        s["grade"] = grade(composite)

    schools.sort(key=lambda x: x["composite"], reverse=True)
    for i, s in enumerate(schools, 1):
        s["rank"] = i

    board = {
        "schoolCount": len(schools),
        "latestYear": LATEST,
        "totalRaised": round(sum(s["latest"]["raised"] for s in schools), 2),
        "totalFundraised": round(sum(s["latest"]["fundraised"] for s in schools), 2),
        "totalSpent": round(sum(s["latest"]["spent"] for s in schools), 2),
        "totalBalance": round(sum(s["latest"]["balance"] for s in schools), 2),
    }

    out = {
        "meta": {
            "years": YEARS, "latestYear": LATEST, "provisional": PROVISIONAL,
            "weights": WEIGHTS, "board": board,
            "source": "CSS des Portages-de-l'Outaouais — Fonds à destination spéciale (ATIP, 2025-10)",
        },
        "schools": schools,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2))

    print(f"wrote {OUT}  ({len(schools)} schools)")
    print(f"  board raised {board['totalRaised']:,.0f}  spent {board['totalSpent']:,.0f}"
          f"  sitting unspent {board['totalBalance']:,.0f}")
    print("  top 3:", [(s["name"], s["grade"], s["composite"]) for s in schools[:3]])
    print("  bottom 3:", [(s["name"], s["grade"], s["composite"]) for s in schools[-3:]])


if __name__ == "__main__":
    main()
