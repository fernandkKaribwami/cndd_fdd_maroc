"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { membresApi, CELLULES_MAROC } from "@/lib/api";
import {
  Search, ChevronLeft, ChevronRight, Download, Briefcase,
  MapPin, Phone, ChevronRight as Go,
} from "lucide-react";

interface Travailleur {
  id: number; nom: string; prenom: string; sexe: string;
  ville_residence: string; telephone: string; email: string;
  cellule: string; statut_compte: string; statut_cotisation: string | null;
  date_adhesion: string;
}
interface PaginatedResponse { count: number; results: Travailleur[]; }

const COMPTE: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIF:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  INACTIF:  { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
  SUSPENDU: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
};
const COT: Record<string, { bg: string; text: string }> = {
  A_JOUR:    { bg: "#DCFCE7", text: "#15803D" },
  EN_RETARD: { bg: "#FEE2E2", text: "#B91C1C" },
  PARTIEL:   { bg: "#FEF3C7", text: "#92400E" },
  EXONERE:   { bg: "#F3F4F6", text: "#6B7280" },
};
const COT_LABEL: Record<string, string> = {
  A_JOUR: "À jour", EN_RETARD: "En retard", PARTIEL: "Partiel", EXONERE: "Exonéré",
};

function StatCard({ icon: Icon, count, label, color }: {
  icon: React.ElementType; count: number; label: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: color + "18" }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 leading-tight">{count}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Travailleurs() {
  const router = useRouter();
  const [data, setData]       = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [cellule, setCellule] = useState("");
  const [page, setPage]       = useState(1);
  const PAGE_SIZE = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page, page_size: PAGE_SIZE, statut_socio_pro: "TRAVAILLEUR",
      };
      if (search)  params.search  = search;
      if (cellule) params.cellule = cellule;
      const r = await membresApi.list(params);
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, cellule]);

  useEffect(() => { setPage(1); }, [search, cellule]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    const r = await membresApi.exportExcel({ statut_socio_pro: "TRAVAILLEUR" });
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a"); a.href = url; a.download = "travailleurs.xlsx"; a.click();
    window.URL.revokeObjectURL(url);
  };

  const total      = data?.count ?? 0;
  const totalPages = data ? Math.ceil(total / PAGE_SIZE) : 0;
  const aJour      = (data?.results ?? []).filter(t => t.statut_cotisation === "A_JOUR").length;
  const avecTel    = (data?.results ?? []).filter(t => t.telephone).length;

  const cellulesUniques = new Set((data?.results ?? []).map(t => t.cellule).filter(Boolean)).size;

  return (
    <AppLayout title="Travailleurs" subtitle={`${total} travailleurs et professionnels`}>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6 p-6"
        style={{ background: "linear-gradient(135deg, #111827 0%, #1e1040 100%)", minHeight: 110 }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }} />
          <div className="absolute -bottom-12 left-1/4 w-40 h-40 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #1EB53A, transparent 70%)" }} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Briefcase size={22} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Travailleurs CNDD-FDD</h2>
            <p className="text-sm text-gray-400 mt-0.5">CNDD-FDD Section Maroc · Membres professionnels</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Briefcase} count={total}          label="Total travailleurs" color="#8B5CF6" />
        <StatCard icon={MapPin}    count={cellulesUniques} label="Cellules présentes"  color="#3B82F6" />
        <StatCard icon={Phone}     count={avecTel}         label="Avec téléphone"      color="#F59E0B" />
        <StatCard icon={Briefcase} count={aJour}           label="À jour cotis."       color="#1EB53A" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 w-52"
          />
        </div>
        <select value={cellule} onChange={e => setCellule(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none">
          <option value="">Toutes les cellules</option>
          {CELLULES_MAROC.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="flex-1" />
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-colors">
          <Download size={14} /> Excel
        </motion.button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Travailleur", "Cellule", "Ville", "Téléphone", "Email", "Compte", "Cotisation"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="h-3.5 bg-gray-100 rounded-full animate-pulse"
                              style={{ width: `${40 + Math.random() * 40}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (data?.results ?? []).map((t, i) => {
                      const cpt = COMPTE[t.statut_compte] || COMPTE.INACTIF;
                      const cot = t.statut_cotisation ? COT[t.statut_cotisation] : null;
                      const celluleLabel = CELLULES_MAROC.find(c => c.value === t.cellule)?.label || t.cellule || "—";
                      return (
                        <motion.tr key={t.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => router.push(`/membres/${t.id}`)}
                          className="border-b border-gray-50 hover:bg-purple-50/40 cursor-pointer transition-colors group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}>
                                {t.prenom[0]}{t.nom[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{t.prenom} {t.nom}</p>
                                <p className="text-xs text-gray-400">{t.date_adhesion ? `Adhésion ${new Date(t.date_adhesion).getFullYear()}` : "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {t.cellule
                              ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">{celluleLabel}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm">{t.ville_residence || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm">{t.telephone || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-sm max-w-[180px] truncate">{t.email || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: cpt.bg, color: cpt.text }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cpt.dot }} />
                              {t.statut_compte}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {cot && t.statut_cotisation
                              ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{ background: cot.bg, color: cot.text }}>{COT_LABEL[t.statut_cotisation] || t.statut_cotisation}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-3 py-3.5">
                            <Go size={14} className="text-gray-300 group-hover:text-purple-400 transition-colors" />
                          </td>
                        </motion.tr>
                      );
                    })
                }
              </AnimatePresence>
              {!loading && data?.results?.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Aucun travailleur trouvé</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">Page {page} / {totalPages} · {total} résultats</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
