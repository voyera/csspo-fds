import raw from "@/app/data/cssd_schools.json";

// Sémantique CSSD ≠ CSSPO : le grand livre FDS enregistre des transferts
// comptables, pas les dépenses des campagnes. Les types gardent le
// vocabulaire comptable — jamais raised/spent/hoardRatio ici.

export type LedgerTotals = { open: number; add: number; approp: number; close: number };

export type LedgerProject = LedgerTotals & { label: string; sourceAnomaly?: string };

export type LedgerYear = {
  totals: LedgerTotals;
  format: string;
  projects: LedgerProject[];
  incompleteLines?: boolean;
  note?: string;
  derivedOpen?: boolean;
  continuityNote?: string;
};

export type CssdSchool = {
  code: string;
  name: string;
  identityNote?: string;
  relatedCode?: string;
  ledger: Record<string, LedgerYear>;
  enrollment: Record<string, { value: number; role: "actual" | "revised" | "forecast"; documentYear: string }>;
  campaignActuals: Record<string, { rev: number; dep: number; documentYear: string }>;
  campaignBudgets: Record<string, { rev: number; dep: number }>;
};

export type CssdDataset = {
  meta: {
    network: string;
    networkName: string;
    snapshotYear: string;
    ledgerYears: string[];
    actualCoverage: Record<string, number>;
    board: {
      schoolCount: number;
      fundClose: number;
      fundAdds: number;
      fundApprops: number;
      campRev: number;
      campDep: number;
    };
    source: string;
  };
  schools: CssdSchool[];
};

export const cssd = raw as unknown as CssdDataset;
export const cssdSchools = cssd.schools;
export const cssdMeta = cssd.meta;

export function getCssdSchool(code: string): CssdSchool | undefined {
  return cssdSchools.find((s) => s.code === code);
}

// Libellés au point d'usage (revue contradictoire) : chaque terme comptable
// est défini là où il est affiché, pas seulement en méthodologie.
export const CSSD_TERMS = {
  add: "Ajouts au fonds — transferts comptables vers le FDS",
  approp:
    "Appropriations — transferts hors du FDS lorsque des dépenses liées sont engagées ; ne représentent pas à elles seules les dépenses des campagnes",
  close:
    "Solde comptable de fin d'exercice — ne permet pas de conclure que l'argent est inutilisé",
  campRev: "Revenus réels des campagnes de financement",
  campDep: "Dépenses réelles des campagnes de financement — coûts des campagnes",
} as const;

export const ROLE_LABEL: Record<string, string> = {
  actual: "réel",
  revised: "révisé",
  forecast: "prévu",
};

export function shortYear(y: string): string {
  const [a, b] = y.split("-");
  return `${a.slice(2)}-${b.slice(2)}`;
}
