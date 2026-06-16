"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { cotisationsApi } from "@/lib/api";
import {
  Search, ChevronLeft, ChevronRight, Download, Plus,
  CheckCircle, XCircle, Clock, AlertCircle, DollarSign, Loader2, X,
} from "lucide-react";

interface Cotisation {
  id: number; membre: number; membre_nom: string;
  annee: number; trimestre: number; trimestre_display: string;
  montant_attendu: number; montant_paye: number;
  statut: string; statut_display: string;
  mode_paiement: string; date_paiement: string | null; commentaire: string;
}
interface PaginatedResponse { count: number; results: Cotisation[]; }

const COT_CFG: Record<string, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
  A_JOUR:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E", icon: CheckCircle },
  EN_RETARD: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", icon: XCircle },
  PARTIEL:   { bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B", icon: Clock },
  EXONERE:   { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF", icon: AlertCircle },
};
const COT_LBL: Record<string, string> = { A_JOUR: "À jour", EN_RETARD: "En retard", PARTIEL: "Partiel", EXONERE: "Exonéré" };
const MODE_LBL: Record<string, string> = { ESPECES: "Espèces", VIREMENT: "Virement", MOBILE_MONEY: "Mobile Money", AUTRE: "Autre" };

// ─── Modal paiement ─────────────────────────────────────────────────────────────
function ModalPaiement({ cot, onClose, onOk }: { cot: Cotisation; onClose: () => void; onOk: () => void }) {
  const [montant, setMontant] = useState(String(cot.montant_attendu - cot.montant_paye));
  const [mode, setMode] = useState("ESPECES");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handlePay = async () => {
    setErr(""); setLoading(true);
    try {
      await cotisationsApi.payer(cot.id, { montant_paye: parseFloat(montant), mode_paiement: mode, commentaire });
      onOk();
    } catch { setErr("Erreur lors de l'enregistrement."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 flex"><div className="flex-1 bg-red-500"/><div className="flex-1 bg-white"/><div className="flex-1 bg-green-500"/></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Enregistrer un paiement</h2>
              <p className="text-xs text-gray-400 mt-0.5">{cot.membre_nom} · {cot.annee} T{cot.trimestre}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <X size={15} />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Attendu</span><span className="font-semibold text-gray-800">{cot.montant_attendu.toLocaleString()} MAD</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Déjà payé</span><span className="font-semibold text-green-700">{cot.montant_paye.toLocaleString()} MAD</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5"><span className="font-bold text-gray-700">Reste</span><span className="font-extrabold text-red-700">{(cot.montant_attendu - cot.montant_paye).toLocaleString()} MAD</span></div>
          </div>
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Montant payé (MAD)</label>
              <input type="number" value={montant} onChange={e => setMontant(e.target.value)} min="0" step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mode de paiement</label>
              <select value={mode} onChange={e => setMode(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100">
                {Object.entries(MODE_LBL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Commentaire</label>
              <input value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Optionnel…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100" />
            </div>
          </div>
          {err && <p className="text-sm text-red-600 mt-3 bg-red-50 px-3 py-2 rounded-lg">{err}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handlePay} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #1EB53A, #15803D)", boxShadow: "0 4px 12px rgba(30,181,58,0.25)" }}>
              {loading ? <><Loader2 size={14} className="animate-spin" /> Traitement…</> : <><CheckCircle size={14} /> Valider</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Modal génération ───────────────────────────────────────────────────────────
function ModalGenerer({ onClose, onOk }: { onClose: () => void; onOk: () => void }) {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ crees: number; existants: number } | null>(null);

  const handleGen = async () => {
    setLoading(true);
    try {
      const r = await cotisationsApi.genererTrimestre(annee, trimestre);
      setResult(r.data);
      onOk();
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1.5 flex"><div className="flex-1 bg-red-500"/><div className="flex-1 bg-white"/><div className="flex-1 bg-green-500"/></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Générer cotisations</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400"><X size={15}/></button>
          </div>
          {result ? (
            <div className="text-center py-3">
              <CheckCircle size={40} className="mx-auto text-green-500 mb-3"/>
              <p className="font-bold text-gray-800 mb-1">{result.crees} cotisations créées</p>
              <p className="text-sm text-gray-500">{result.existants} déjà existantes</p>
              <button onClick={onClose} className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">Fermer</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Année</label>
                  <input type="number" value={annee} onChange={e => setAnnee(parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Trimestre</label>
                  <select value={trimestre} onChange={e => setTrimestre(parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100">
                    {[1,2,3,4].map(t => <option key={t} value={t}>T{t}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">Génère une cotisation par membre actif. Les existantes ne sont pas modifiées.</p>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600">Annuler</button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGen} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #CE1126, #991010)" }}>
                  {loading ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>} Générer
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────────
export default function CotisationsPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState("");
  const [statut, setStatut] = useState("");
  const [page, setPage] = useState(1);
  const [payModal, setPayModal] = useState<Cotisation | null>(null);
  const [genModal, setGenModal] = useState(false);
  const PAGE_SIZE = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, page_size: PAGE_SIZE, annee };
      if (trimestre) params.trimestre = trimestre;
      if (statut) params.statut = statut;
      if (search) params.search = search;
      const r = await cotisationsApi.list(params);
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, annee, trimestre, statut, search]);

  useEffect(() => { setPage(1); }, [annee, trimestre, statut, search]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    const r = await cotisationsApi.exportExcel({ annee, trimestre, statut });
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a"); a.href = url; a.download = `cotisations_${annee}.xlsx`; a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;
  const stats = (data?.results || []).reduce((acc, c) => { acc[c.statut] = (acc[c.statut] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <AppLayout title="Cotisations" subtitle={`Gestion des cotisations ${annee}`}>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {Object.entries(COT_CFG).map(([s, c]) => {
          const Icon = c.icon;
          return (
            <motion.button key={s} whileHover={{ y: -1 }}
              onClick={() => setStatut(statut === s ? "" : s)}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 text-left transition-all shadow-sm border-2"
              style={{ borderColor: statut === s ? c.dot : "#F3F4F6" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: c.bg }}>
                <Icon size={17} style={{ color: c.text }} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-gray-900">{stats[s] || 0}</p>
                <p className="text-xs font-medium text-gray-500">{COT_LBL[s]}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Rechercher membre…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-100 w-52"/>
        </div>
        <select value={annee} onChange={e => setAnnee(parseInt(e.target.value))}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none font-semibold text-gray-700">
          {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={trimestre} onChange={e => setTrimestre(e.target.value)}
          className="py-2.5 px-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none text-gray-700">
          <option value="">Tous les trimestres</option>
          {[1,2,3,4].map(t => <option key={t} value={t}>T{t}</option>)}
        </select>
        <div className="flex-1"/>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors">
          <Download size={14}/> Excel
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setGenModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #CE1126, #991010)", boxShadow: "0 4px 12px rgba(206,17,38,0.25)" }}>
          <Plus size={14}/> Générer cotisations
        </motion.button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Membre","Période","Attendu","Payé","Solde","Statut","Mode","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({length: 8}).map((_,i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({length:8}).map((_,j) => (
                        <td key={j} className="px-4 py-3.5"><div className="h-3.5 bg-gray-100 rounded-full animate-pulse"/></td>
                      ))}
                    </tr>
                  ))
                : (data?.results ?? []).map((c,i) => {
                    const cfg = COT_CFG[c.statut] || COT_CFG.EN_RETARD;
                    const solde = c.montant_attendu - c.montant_paye;
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-gray-900">{c.membre_nom}</td>
                        <td className="px-4 py-3.5 text-gray-600">{c.annee} T{c.trimestre}</td>
                        <td className="px-4 py-3.5 font-medium text-gray-700">{c.montant_attendu.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-semibold text-green-700">{c.montant_paye.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-semibold" style={{ color: solde > 0 ? "#B91C1C" : "#15803D" }}>
                          {solde > 0 ? `-${solde.toLocaleString()}` : "✓"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: cfg.bg, color: cfg.text }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }}/>
                            {COT_LBL[c.statut] || c.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{c.mode_paiement ? MODE_LBL[c.mode_paiement] || c.mode_paiement : "—"}</td>
                        <td className="px-4 py-3.5">
                          {c.statut !== "A_JOUR" && c.statut !== "EXONERE" && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setPayModal(c)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                              style={{ background: "linear-gradient(135deg, #1EB53A, #15803D)" }}>
                              <DollarSign size={11}/> Payer
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })
              }
              {!loading && data?.results?.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <DollarSign size={40} className="mx-auto mb-3 opacity-30"/>
                  <p className="text-sm font-medium">Aucune cotisation trouvée</p>
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

      <AnimatePresence>
        {payModal && <ModalPaiement cot={payModal} onClose={() => setPayModal(null)} onOk={() => { setPayModal(null); fetchData(); }}/>}
        {genModal && <ModalGenerer onClose={() => setGenModal(false)} onOk={() => { setGenModal(false); fetchData(); }}/>}
      </AnimatePresence>
    </AppLayout>
  );
}
