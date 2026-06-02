import raw from "@/app/data/schools.json";

export type YearMetrics = {
  year: string;
  provisional: boolean;
  raised: number;
  fundraised: number;
  internalRev: number;
  spent: number;
  balance: number;
  surplusIn: number;
  activityBudget: number;
  budgetRevenu: number;
  expenses: Record<string, number>;
  revenues: Record<string, number>;
  granularity: number;
  spendThrough: number;
  hoardRatio: number;
};

export type School = {
  code: string;
  name: string;
  sizeProxy: number;
  totalBudget: number;
  latest: YearMetrics;
  history: YearMetrics[];
  scores: { fundraising: number; spend: number; rigour: number };
  composite: number;
  grade: "A" | "B" | "C" | "D" | "F";
  rank: number;
};

export type Dataset = {
  meta: {
    years: string[];
    latestYear: string;
    provisional: string[];
    weights: { fundraising: number; spend: number; rigour: number };
    board: {
      schoolCount: number;
      latestYear: string;
      totalRaised: number;
      totalFundraised: number;
      totalSpent: number;
      totalBalance: number;
    };
    source: string;
  };
  schools: School[];
};

export const dataset = raw as unknown as Dataset;
export const schools = dataset.schools;
export const meta = dataset.meta;

export function getSchool(code: string): School | undefined {
  return schools.find((s) => s.code === code);
}

// ---- formatting helpers ----
export function money(n: number, cents = false): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: cents ? 2 : 0,
  }).format(n);
}

export function pct(n: number): string {
  return `${Math.round(n * 100)} %`;
}

export const GRADE_COLOR: Record<string, string> = {
  A: "#3f6f4e",
  B: "#6b8b3d",
  C: "#9a6b1f",
  D: "#c2641f",
  F: "#b5281b",
};
