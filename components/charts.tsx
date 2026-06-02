"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearMetrics } from "@/lib/data";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const fmtFull = (n: number) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);

const INK = "#211d17";
const PEN = "#b5281b";
const LEDGER = "#3f6f4e";
const GOLD = "#9a6b1f";
const AXIS = { fontFamily: "var(--font-mono)", fontSize: 11, fill: "#5a5347" };
const PIE_COLORS = ["#3f6f4e", "#9a6b1f", "#7a5230", "#b5281b", "#5a6b8b", "#6b8b3d", "#a8742f", "#475247"];

const tipStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  background: "#fbf8f1",
  border: "1px solid #cfc4ad",
  borderRadius: 6,
};

export function RaisedVsSpent({ history }: { history: YearMetrics[] }) {
  const data = history.map((h) => ({
    year: h.year + (h.provisional ? "*" : ""),
    "Argent amassé": h.raised,
    "Argent dépensé": h.spent,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#cfc4ad" vertical={false} />
        <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={{ stroke: "#cfc4ad" }} />
        <YAxis tickFormatter={fmt} tick={AXIS} width={52} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={tipStyle} cursor={{ fill: "#0000000a" }} />
        <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
        <Bar dataKey="Argent amassé" fill={GOLD} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Argent dépensé" fill={LEDGER} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BalanceTrend({ history }: { history: YearMetrics[] }) {
  const data = history.map((h) => ({
    year: h.year + (h.provisional ? "*" : ""),
    "Solde accumulé": h.balance,
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PEN} stopOpacity={0.45} />
            <stop offset="100%" stopColor={PEN} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke="#cfc4ad" vertical={false} />
        <XAxis dataKey="year" tick={AXIS} tickLine={false} axisLine={{ stroke: "#cfc4ad" }} />
        <YAxis tickFormatter={fmt} tick={AXIS} width={52} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={tipStyle} />
        <Area type="monotone" dataKey="Solde accumulé" stroke={PEN} fill="url(#bal)" strokeWidth={2} dot={{ r: 2, fill: PEN }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ExpenseBreakdown({ expenses }: { expenses: Record<string, number> }) {
  const data = Object.entries(expenses)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  if (data.length === 0) return <p className="text-sm text-inksoft">Aucune dépense déclarée.</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={52} outerRadius={92} paddingAngle={2} stroke="#fbf8f1" strokeWidth={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => fmtFull(v)} contentStyle={tipStyle} />
        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
