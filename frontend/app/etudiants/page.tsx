"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { membresApi, referentielsApi } from "@/lib/api";
import {
  Search, ChevronLeft, ChevronRight, Download, GraduationCap,
  BookOpen, Building2, Award, ChevronRight as Go,
} from "lucide-react";

interface ProfilEtudiant {
  etablissement: string | null; ville_etudes: string | null;
  annee_academique: string | null; statut_parcours: string | null;
  filiere_detail: { id: number; nom: string } | null;
  niveau_detail: { id: number; nom: string } | null;
  cycle_detail: { id: number; nom: string } | null;
}
interface Etudiant {
  id: number; nom: string; prenom: string; sexe: string;
  ville_residence: string; statut_compte: string;
  profil_etudiant: ProfilEtudiant | null;
  statut_cotisation: string | null;
}
interface PaginatedResponse { count: number; results: Etudiant[]; }
interface RefItem { id: number; nom: string; }

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
const COT_LABEL: Record<string, string> = { A_JOUR: "À jour", EN_RETARD: "En retard", PARTIEL: "Partiel", EXONERE: "Exonéré" };

const ANNEES = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return `${y}-${y+1}`;
});

function StatCard({ icon: Icon, count, label, color }: { icon: React.ElementType; count: number; label: string; color: string }) {
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

export default function EtudiantsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [annee, setAnnee] = useState("");
  const [filiere, setFiliere] = useState("");
  const [niveau, setNiveau] = useState("");
  const [page, setPage] = useState(1);
  const [filieres, setFilieres] = useState<RefItem[]>([]);
  const [niveaux, setNiveaux] = useState<RefItem[]>([]);
  const PAGE_SIZE = 25;

  useEffect(() => {
    Promise.all([referentielsApi.getFilieres(), referentielsApi.getNiveaux()])
      .then(([f, n]) => { setFilieres(f.data.results || f.data); setNiveaux(n.data.results || n.data); })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (annee) params.annee_academique = annee;
      if (filiere) params.filiere = filiere;
      if (niveau) params.niveau = niveau;
      const r = await membresApi.etudiants(params);
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, annee, filiere, niveau]);

  useEffect(() => { setPage(1); }, [search, annee, filiere, niveau]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    const r = await membresApi.exportExcel({ statut_socio_pro: "ETUDIANT" });
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a"); a.href = url; a.download = "etudiants.xlsx"; a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const total = data?.count ?? 0;
  const etablissements = new Set((data?.results ?? []).map(e => e.profil_etudiant?.etablissement).filter(Boolean)).size;
  const aJour = (data?.results ?? []).filter(e => e.statut_cotisation === "A_JOUR").length;

  return (
    <AppLayout title="Étudiants" subtitle={`${total} étudiants inscrits`}>

      {/* Hero banner */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6 p-6"
        style={{ background: "linear-gradient(135deg, #111827 0%, #1a2740 100%)", minHeight: 110 }}>
        {/* Drapeaux décoratifs */}
        {[
          { top: "12%", left: "2%", size: 70, opacity: 0.18, rot: -8 },
          { top: "20%", right: "6%", size: 90, opacity: 0.14, rot: 6 },
          { top: "5%",  right: "22%", size: 55, opacity: 0.10, rot: -4 },
        ].map((d, i) => (
          <motion.div key={i} className="absolute pointer-events-none"
            style={{ top: d.top, left: d.left, right: d.right, width: d.size, opacity: d.opacity, transform: `rotate(${d.rot}deg)` }}
            animate={{ y: [0, -5, 0], rotate: [d.rot, d.rot + 2, d.rot] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}>
            <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
              <rect width="30" height="60" fill="#CE1126"/>
              <rect x="30" width="30" height="60" fill="#1EB53A"/>
              <rect x="60" width="30" height="60" fill="#FFFFFF"/>
              <circle cx="45" cy="30" r="12" fill="black" opacity="0.85"/>
              <text x="45" y="35" textAnchor="middle" fontSize="12" fill="white">🦅</text>
            </svg>
          </motion.div>
        ))}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
            <GraduationCap size={22} className="text-blue-400"/>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Étudiants CNDD-FDD</h2>
            <p className="text-sm text-gray-400 mt-0.5">CNDD-FDD Section Maroc · Membres étudiants</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={GraduationCap} count={total} label="Total étudiants" color="#3B82F6"/>
        <StatCard icon={BookOpen} count={filieres.length} label="Filières" color="#8B5CF6"/>
        <StatCard icon={Building2} count={etablissements} label="Établissements" color="#F59E0B"/>
        <StatCard icon={Award} count={aJour} label="À jour cotis." color="#1EB53A"/>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 w-52"/>
        </div>
        <select value={annee} onChange={e => setAnnee(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none">
          <option value="">Toutes les années</option>
          {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {filieres.length > 0 && (
          <select value={filiere} onChange={e => setFiliere(e.target.value)}
            className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none">
            <option value="">Toutes filières</option>
            {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
          </select>
        )}
        {niveaux.length > 0 && (
          <select value={niveau} onChange={e => setNiveau(e.target.value)}
            className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none">
            <option value="">Tous niveaux</option>
            {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
          </select>
        )}
        <div className="flex-1"/>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors">
          <Download size={14}/> Excel
        </motion.button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Étudiant","Établissement","Filière","Niveau","Année acad.","Statut parcours","Compte","Cotisation"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
                <th className="w-8"/>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading
                  ? Array.from({length: 8}).map((_,i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({length:9}).map((_,j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{width: `${40+Math.random()*40}%`}}/>
                          </td>
                        ))}
                      </tr>
                    ))
                  : (data?.results ?? []).map((e, i) => {
                      const cpt = COMPTE[e.statut_compte] || COMPTE.INACTIF;
                      const cot = e.statut_cotisation ? COT[e.statut_cotisation] : null;
                      return (
                        <motion.tr key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => router.push(`/membres/${e.id}`)}
                          className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}>
                                {e.prenom[0]}{e.nom[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{e.prenom} {e.nom}</p>
                                <p className="text-xs text-gray-400">{e.ville_residence || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm max-w-[160px] truncate">{e.profil_etudiant?.etablissement || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm">{e.profil_etudiant?.filiere_detail?.nom || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm">{e.profil_etudiant?.niveau_detail?.nom || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5">
                            {e.profil_etudiant?.annee_academique
                              ? <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{e.profil_etudiant.annee_academique}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium text-gray-500">{e.profil_etudiant?.statut_parcours || <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ background: cpt.bg, color: cpt.text }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cpt.dot }}/>
                              {e.statut_compte}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {cot && e.statut_cotisation
                              ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                                  style={{ background: cot.bg, color: cot.text }}>{COT_LABEL[e.statut_cotisation] || e.statut_cotisation}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-3 py-3.5">
                            <Go size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors"/>
                          </td>
                        </motion.tr>
                      );
                    })
                }
              </AnimatePresence>
              {!loading && data?.results?.length === 0 && (
                <tr><td colSpan={9} className="text-center py-16 text-gray-400">
                  <GraduationCap size={40} className="mx-auto mb-3 opacity-30"/>
                  <p className="text-sm font-medium">Aucun étudiant trouvé</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">Page {page} / {totalPages} · {data?.count} résultats</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white">
                <ChevronLeft size={14}/>
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white">
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
