"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { RepartitionPieChart, CotisationBarChart, EvolutionLineChart } from "@/components/charts/DashboardCharts";
import { dashboardApi } from "@/lib/api";
import {
  Users, GraduationCap, TrendingUp, AlertTriangle,
  Briefcase, CheckCircle, Clock, ArrowRight,
} from "lucide-react";

interface DashboardData {
  totaux: { membres: number; actifs: number; etudiants: number; travailleurs: number; inactifs: number };
  par_categorie: { categorie_affiliation: string; count: number }[];
  par_cycle: { cycle__nom: string; count: number }[];
  par_ville: { ville_residence: string; count: number }[];
  cotisations: {
    annee: number; total_attendu: number; total_paye: number; taux_recouvrement: number;
    par_trimestre: { trimestre: string; a_jour: number; total: number; taux: number }[];
    en_retard: number;
  };
  evolution_adhesions: { annee: number; count: number }[];
  derniers_membres: { id: number; nom: string; prenom: string; categorie_affiliation: string; statut_compte: string; date_adhesion: string }[];
}

const CAT_LABELS: Record<string, string> = {
  ABAGUMYABANGA: "Abagumyabanga", SYMPATHISANT: "Sympathisant", DIASPORA: "Diaspora",
};
const CAT_COLORS: Record<string, string> = {
  ABAGUMYABANGA: "#CE1126", SYMPATHISANT: "#1EB53A", DIASPORA: "#3B82F6",
};
const COMPTE_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIF:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  INACTIF:  { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
  SUSPENDU: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
};

function KpiCard({ icon: Icon, label, value, sub, accent, delay = 0, href }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  accent: string; delay?: number; href?: string;
}) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2, shadow: "lg" }}
      className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-default"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15` }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {href && <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />}
    </motion.div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats().then((r) => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppLayout title="Tableau de bord">
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-4 border-red-200 border-t-red-600" />
        </div>
      </AppLayout>
    );
  }

  const taux = data?.cotisations.taux_recouvrement ?? 0;

  const categorieData = (data?.par_categorie || []).map(i => ({
    name: CAT_LABELS[i.categorie_affiliation] || i.categorie_affiliation,
    value: i.count,
  }));
  const cycleData = (data?.par_cycle || []).map(i => ({ name: i.cycle__nom || "Non renseigné", value: i.count }));
  const evolutionData = (data?.evolution_adhesions || []).map(i => ({ name: String(i.annee), annee: String(i.annee), count: i.count }));

  return (
    <AppLayout title="Tableau de bord" subtitle={`Vue d'ensemble — ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}>

      {/* ── Bandeau hero ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl mb-6 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1a0508 60%, #0a1a0a 100%)",
          minHeight: 140,
        }}
      >
        {/* Halos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #CE1126, transparent 70%)" }} />
          <div className="absolute -bottom-16 left-1/3 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #1EB53A, transparent 70%)" }} />
        </div>

        {/* Images CNDD-FDD en décoration du hero */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-5 pointer-events-none">
          <motion.div animate={{ y: [0, -8, 0], rotate: [-5, -2, -5] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{ opacity: 0.22, width: 95 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_logo.png" alt="" style={{ width: 95, height: "auto", display: "block" }} draggable={false} />
          </motion.div>
          <motion.div animate={{ y: [0, -12, 0], rotate: [3, 7, 3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 0.28, width: 130 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_aigle.png" alt="" style={{ width: 130, height: "auto", display: "block", filter: "invert(1) brightness(1.1)" }} draggable={false} />
          </motion.div>
          <motion.div animate={{ y: [0, -7, 0], rotate: [5, 2, 5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ opacity: 0.18, width: 78 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_logo.png" alt="" style={{ width: 78, height: "auto", display: "block" }} draggable={false} />
          </motion.div>
        </div>

        <div className="relative z-10 p-6">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px #22c55e" }} />
            <p className="text-xs font-semibold text-green-400 uppercase tracking-widest">Système actif</p>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Plateforme CNDD-FDD Maroc
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            {data?.totaux.membres} membres enregistrés · {data?.totaux.actifs} actifs · {data?.totaux.etudiants} étudiants
          </p>
        </div>
      </motion.div>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Users} label="Membres total" value={data?.totaux.membres || 0}
          sub={`${data?.totaux.actifs || 0} actifs`} accent="#CE1126" delay={0} href="/membres" />
        <KpiCard icon={GraduationCap} label="Étudiants" value={data?.totaux.etudiants || 0}
          sub="Profil académique" accent="#1EB53A" delay={0.07} href="/etudiants" />
        <KpiCard icon={Briefcase} label="Travailleurs" value={data?.totaux.travailleurs || 0}
          sub="Statut professionnel" accent="#3B82F6" delay={0.14} />
        <KpiCard icon={TrendingUp} label="Recouvrement" value={`${taux}%`}
          sub={`Cotisations ${data?.cotisations.annee || ""}`} accent="#F59E0B" delay={0.21} href="/cotisations" />
      </div>

      {/* ── Barre recouvrement + alertes ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Barre */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-gray-800">Recouvrement des cotisations {data?.cotisations.annee}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {(data?.cotisations.total_paye || 0).toLocaleString()} / {(data?.cotisations.total_attendu || 0).toLocaleString()} MAD collectés
              </p>
            </div>
            <span className="text-2xl font-extrabold" style={{ color: taux >= 80 ? "#1EB53A" : taux >= 50 ? "#F59E0B" : "#CE1126" }}>
              {taux}%
            </span>
          </div>
          <div className="h-4 rounded-full bg-gray-100 overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${taux}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
              className="h-full rounded-full"
              style={{
                background: taux >= 80
                  ? "linear-gradient(90deg, #1EB53A, #16A34A)"
                  : taux >= 50
                  ? "linear-gradient(90deg, #F59E0B, #D97706)"
                  : "linear-gradient(90deg, #CE1126, #991010)",
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(data?.cotisations.par_trimestre || []).map((t, i) => (
              <div key={i} className="text-center p-2 rounded-xl bg-gray-50">
                <p className="text-xs font-bold text-gray-500">{t.trimestre}</p>
                <p className="text-sm font-extrabold mt-0.5" style={{ color: t.taux >= 80 ? "#1EB53A" : t.taux >= 50 ? "#F59E0B" : "#CE1126" }}>
                  {t.taux}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alertes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
        >
          <p className="text-sm font-bold text-gray-800 mb-3">Alertes</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#FEF2F2" }}>
              <AlertTriangle size={16} style={{ color: "#DC2626" }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#991B1B" }}>{data?.cotisations.en_retard || 0} en retard</p>
                <p className="text-xs" style={{ color: "#B91C1C" }}>Cotisations non payées</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F0FDF4" }}>
              <CheckCircle size={16} style={{ color: "#16A34A" }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#14532D" }}>{data?.totaux.actifs || 0} membres actifs</p>
                <p className="text-xs" style={{ color: "#15803D" }}>Comptes opérationnels</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#FFF7ED" }}>
              <Clock size={16} style={{ color: "#D97706" }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#92400E" }}>{data?.totaux.inactifs || 0} inactifs</p>
                <p className="text-xs" style={{ color: "#B45309" }}>À relancer</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Graphiques ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <RepartitionPieChart data={categorieData} title="Répartition par catégorie" colors={["#CE1126", "#1EB53A", "#3B82F6"]} />
        <RepartitionPieChart data={cycleData} title="Étudiants par cycle" />
        <CotisationBarChart data={data?.cotisations.par_trimestre || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EvolutionLineChart data={evolutionData} />

        {/* Derniers membres */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-800">Derniers membres inscrits</p>
            <Link href="/membres" className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
              Voir tous <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.derniers_membres || []).map((m, i) => {
              const style = COMPTE_STYLE[m.statut_compte] || COMPTE_STYLE.INACTIF;
              const catColor = CAT_COLORS[m.categorie_affiliation] || "#6B7280";
              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                >
                  <Link href={`/membres/${m.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}99)` }}>
                        {m.prenom[0]}{m.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{m.prenom} {m.nom}</p>
                        <p className="text-xs text-gray-400">{CAT_LABELS[m.categorie_affiliation] || m.categorie_affiliation}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
                        <span className="text-xs font-medium" style={{ color: style.text }}>{m.statut_compte}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            {!data?.derniers_membres?.length && (
              <p className="text-sm text-gray-400 text-center py-6">Aucun membre enregistré</p>
            )}
          </div>
        </motion.div>

        {/* Top villes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <p className="text-sm font-bold text-gray-800 mb-4">Répartition par ville</p>
          <div className="space-y-2">
            {(data?.par_ville || []).slice(0, 6).map((v, i) => {
              const max = data?.par_ville[0]?.count || 1;
              const pct = Math.round((v.count / max) * 100);
              return (
                <div key={v.ville_residence} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 truncate">{v.ville_residence || "Inconnue"}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.07 }}
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? "#CE1126" : i === 1 ? "#1EB53A" : "#3B82F6" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{v.count}</span>
                </div>
              );
            })}
            {!data?.par_ville?.length && (
              <p className="text-sm text-gray-400 text-center py-4">Aucune donnée</p>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
