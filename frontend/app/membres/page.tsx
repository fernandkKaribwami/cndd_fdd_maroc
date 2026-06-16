"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import FilterPanel from "@/components/filters/FilterPanel";
import MembreFormModal from "@/components/membres/MembreFormModal";
import { membresApi } from "@/lib/api";
import { Plus, Download, Search, ChevronLeft, ChevronRight, Users, ChevronRight as Go, Pencil, Upload, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import { CELLULES_MAROC } from "@/lib/api";

interface Membre {
  id: number; nom: string; prenom: string; sexe: string;
  categorie_affiliation: string; statut_socio_pro: string;
  statut_compte: string; ville_residence: string;
  cellule: string; date_adhesion: string; statut_cotisation: string | null;
}

const CELLULE_LABEL: Record<string, string> = Object.fromEntries(
  CELLULES_MAROC.map(c => [c.value, c.label.replace("Cellule ", "")])
);
interface PaginatedResponse {
  count: number; next: string | null; previous: string | null; results: Membre[];
}

const CAT = { ABAGUMYABANGA: "Abagumyabanga", SYMPATHISANT: "Sympathisant", DIASPORA: "Diaspora" } as const;
const CAT_COLOR: Record<string, { bg: string; text: string }> = {
  ABAGUMYABANGA: { bg: "#FEE2E2", text: "#991B1B" },
  SYMPATHISANT:  { bg: "#DCFCE7", text: "#14532D" },
  DIASPORA:      { bg: "#DBEAFE", text: "#1E40AF" },
};
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

function Badge({ bg, text, label, dot }: { bg: string; text: string; label: string; dot?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: bg, color: text }}>
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dot }} />}
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[35, 20, 15, 15, 15, 15].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function MembresPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ crees: number; ignores?: number; extraits?: number; erreurs: { ligne?: number; index?: number; erreur: string }[] } | null>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const pdfInputRef     = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 25;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await membresApi.list({ ...filters, page, page_size: PAGE_SIZE, search: search || undefined });
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, page, search]);

  useEffect(() => { setPage(1); }, [filters, search]);
  useEffect(() => { fetch(); }, [fetch]);

  const handleExport = async () => {
    const r = await membresApi.exportExcel(filters);
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a"); a.href = url; a.download = "membres.xlsx"; a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleTemplateDownload = async () => {
    const r = await membresApi.templateImport();
    const url = window.URL.createObjectURL(new Blob([r.data]));
    const a = document.createElement("a"); a.href = url; a.download = "modele_import_membres.xlsx"; a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const r = await membresApi.importExcel(file);
      setImportResult(r.data);
      fetch();
    } catch {
      setImportResult({ crees: 0, erreurs: [{ erreur: "Erreur lors de l'import Excel" }] });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const r = await membresApi.importPdf(file);
      setImportResult(r.data);
      fetch();
    } catch {
      setImportResult({ crees: 0, erreurs: [{ erreur: "Erreur lors de l'import PDF" }] });
    } finally {
      setImporting(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <AppLayout title="Membres" subtitle={data ? `${data.count} membres enregistrés` : undefined}>

      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-56 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher nom, email, téléphone…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all" />
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-green-300 hover:text-green-700 transition-colors">
          <Download size={14} /> Exporter
        </motion.button>

        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
        <input ref={pdfInputRef}  type="file" accept=".pdf"       className="hidden" onChange={handleImportPdf} />

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => fileInputRef.current?.click()} disabled={importing}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-60">
          {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Excel
        </motion.button>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => pdfInputRef.current?.click()} disabled={importing}
          title="Importer depuis un PDF ABAGUMYABANGA"
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-colors disabled:opacity-60">
          {importing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          PDF
        </motion.button>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleTemplateDownload}
          title="Télécharger le modèle Excel d'import"
          className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
          <FileSpreadsheet size={14} /> Modèle
        </motion.button>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setEditId(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #CE1126, #991010)", boxShadow: "0 4px 12px rgba(206,17,38,0.25)" }}>
          <Plus size={14} /> Ajouter un membre
        </motion.button>
      </div>

      {/* ── Résultat import ──────────────────────────────────────── */}
      <AnimatePresence>
        {importResult && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className={`flex items-start justify-between gap-4 px-4 py-3 rounded-xl border text-sm mb-4 ${
              importResult.erreurs.length === 0
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}>
            <div>
              <span className="font-bold">
                {importResult.crees} membre{importResult.crees !== 1 ? "s" : ""} créé{importResult.crees !== 1 ? "s" : ""}
              </span>
              {importResult.extraits !== undefined && (
                <span className="ml-2 opacity-70">· {importResult.extraits} extraits du PDF{importResult.ignores ? `, ${importResult.ignores} déjà existants` : ""}</span>
              )}
              {importResult.erreurs.length > 0 && (
                <ul className="mt-1 text-xs space-y-0.5 opacity-80">
                  {importResult.erreurs.slice(0, 3).map((e, i) => (
                    <li key={i}>{e.ligne !== undefined ? `Ligne ${e.ligne} : ` : ""}{e.erreur}</li>
                  ))}
                  {importResult.erreurs.length > 3 && (
                    <li>…et {importResult.erreurs.length - 3} autre(s) erreur(s)</li>
                  )}
                </ul>
              )}
            </div>
            <button onClick={() => setImportResult(null)} className="flex-shrink-0 opacity-50 hover:opacity-100 mt-0.5">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Table ───────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {["Membre", "Catégorie", "Cellule", "Ville", "Profil", "Compte", "Cotisation"].map((h, i) => (
                  <th key={h} className={`text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider ${i === 2 ? "hidden lg:table-cell" : ""} ${i === 3 ? "hidden md:table-cell" : ""} ${i === 4 ? "hidden xl:table-cell" : ""}`}>
                    {h}
                  </th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : (data?.results ?? []).map((m, i) => {
                      const cat = CAT_COLOR[m.categorie_affiliation];
                      const cpt = COMPTE[m.statut_compte] || COMPTE.INACTIF;
                      const cot = m.statut_cotisation ? COT[m.statut_cotisation] : null;
                      return (
                        <motion.tr key={m.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15, delay: i * 0.02 }}
                          onClick={() => router.push(`/membres/${m.id}`)}
                          className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer transition-colors group"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition-transform group-hover:scale-105"
                                style={{ background: `linear-gradient(135deg, ${cat?.text || "#CE1126"}, ${(cat?.text || "#CE1126") + "99"})` }}>
                                {m.prenom[0]}{m.nom[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{m.prenom} {m.nom}</p>
                                <p className="text-xs text-gray-400">{m.sexe === "M" ? "Homme" : "Femme"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {cat
                              ? <Badge bg={cat.bg} text={cat.text} label={CAT[m.categorie_affiliation as keyof typeof CAT] || m.categorie_affiliation} />
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            {m.cellule
                              ? <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">{CELLULE_LABEL[m.cellule] || m.cellule}</span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-600 text-sm hidden md:table-cell">{m.ville_residence || "—"}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs hidden xl:table-cell">
                            {m.statut_socio_pro === "ETUDIANT" ? "Étudiant" : m.statut_socio_pro === "TRAVAILLEUR" ? "Travailleur" : "Autre"}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge bg={cpt.bg} text={cpt.text} dot={cpt.dot} label={m.statut_compte} />
                          </td>
                          <td className="px-4 py-3.5">
                            {cot && m.statut_cotisation
                              ? <Badge bg={cot.bg} text={cot.text} label={COT_LABEL[m.statut_cotisation] || m.statut_cotisation} />
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                onClick={e => { e.stopPropagation(); setEditId(m.id); setShowModal(true); }}
                                className="w-7 h-7 rounded-lg border border-gray-100 flex items-center justify-center text-gray-300 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                                title="Modifier">
                                <Pencil size={12} />
                              </motion.button>
                              <Go size={14} className="text-gray-300 group-hover:text-red-400 transition-colors" />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                }
              </AnimatePresence>

              {!loading && data?.results?.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Aucun membre trouvé</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">Page {page} / {totalPages} · {data?.count} résultats</p>
            <div className="flex gap-1.5">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-red-300 hover:text-red-600 bg-white transition-colors">
                <ChevronLeft size={14} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:border-red-300 hover:text-red-600 bg-white transition-colors">
                <ChevronRight size={14} />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      <MembreFormModal
        open={showModal}
        membreId={editId}
        onClose={() => { setShowModal(false); setEditId(undefined); }}
        onSuccess={() => { fetch(); setShowModal(false); setEditId(undefined); }}
      />
    </AppLayout>
  );
}
