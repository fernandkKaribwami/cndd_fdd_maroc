"use client";

import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const DEFAULT_COLORS = ["#CE1126", "#1EB53A", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];

const CARD = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5";
const TITLE = "text-sm font-bold text-gray-800 mb-4";
const AXIS_STYLE = { fill: "#9CA3AF", fontSize: 11 };
const GRID = "#F3F4F6";
const TIP_STYLE = {
  contentStyle: { background: "#1F2937", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, padding: "8px 12px" },
  itemStyle: { color: "#D1D5DB" },
  cursor: { fill: "rgba(0,0,0,0.04)" },
};

interface PieDataItem { name: string; value: number; }
interface TrimestresItem {
  trimestre: string; a_jour: number; total: number; taux: number;
  [key: string]: string | number;
}
interface LineDataItem { name: string; annee: string; count: number; [k: string]: string | number; }

export function RepartitionPieChart({ data, title, colors }: { data: PieDataItem[]; title: string; colors?: string[] }) {
  const cols = colors || DEFAULT_COLORS;
  return (
    <div className={CARD}>
      <p className={TITLE}>{title}</p>
      {data.length === 0
        ? <div className="h-48 flex items-center justify-center text-sm text-gray-400">Aucune donnée</div>
        : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={cols[i % cols.length]} />)}
              </Pie>
              <Tooltip {...TIP_STYLE} formatter={(v) => [`${v}`, "Membres"]} />
              <Legend formatter={(v) => <span style={{ color: "#6B7280", fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )
      }
    </div>
  );
}

export function CotisationBarChart({ data }: { data: TrimestresItem[] }) {
  return (
    <div className={CARD}>
      <p className={TITLE}>Cotisations par trimestre {new Date().getFullYear()}</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="trimestre" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip {...TIP_STYLE} />
          <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Total" />
          <Bar dataKey="a_jour" fill="#1EB53A" radius={[4, 4, 0, 0]} name="À jour" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EvolutionLineChart({ data }: { data: LineDataItem[] }) {
  return (
    <div className={CARD}>
      <p className={TITLE}>Évolution des adhésions</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="evoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#CE1126" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#CE1126" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis dataKey="annee" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <Tooltip {...TIP_STYLE} />
          <Area type="monotone" dataKey="count" stroke="#CE1126" strokeWidth={2.5}
            fill="url(#evoGrad)" dot={{ fill: "#CE1126", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#fff", stroke: "#CE1126", strokeWidth: 2 }}
            name="Adhésions" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
