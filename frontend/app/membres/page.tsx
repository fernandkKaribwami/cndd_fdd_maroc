"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import FilterPanel from "@/components/filters/FilterPanel";
import MembreFormModal from "@/components/membres/MembreFormModal";
import { membresApi, CELLULES_MAROC } from "@/lib/api";
import {
  Plus, Download, Search, ChevronLeft, ChevronRight,
  Users, ChevronRight as Go, Pencil, Upload, FileText,
  FileSpreadsheet, Loader2, X, SlidersHorizontal,
} from "lucide-react";

interface Membre {
  id: number; nom: string; prenom: string; sexe: string;
  categorie_affiliation: string; statut_socio_pro: string;
  statut_compte: string; ville_residence: string;
  cellule: string; date_adhesion: string; statut_cotisation: string | null;
}
interface PaginatedResponse {
  count: number; next: string | null; previous: string | null; results: Membre[];
}

/* ── Mappings labels ──────────────────────────────────────────────── */
const CELLULE_LABEL: Record<string, string> = Object.fromEntries(
  CELLULES_MAROC.map(c => [c.value, c.label.replace("Cellule ", "")])
);
const CELLULE_SHORT: Record<string, string> = {
  TANGER_TETOUAN_OUJDA: "Tanger-Tétouan",
  KENITRA:              "Kénitra",
  AGADIR:               "Agadir",
  RABAT_SALE:           "Rabat-Salé",
  LAAYOUNE_DAKHLA:      "Laâyoune-Dakhla",
  FEZ_MEKNES:           "Fès-Meknès",
  CASABLANCA:           "Casablanca",
  AUTRE:                "Autre",
};
const CAT_LABEL  = { ABAGUMYABANGA: "Abagumyabanga", SYMPATHISANT: "Sympathisant", DIASPORA: "Diaspora" } as const;
const CAT_COLOR: Record<string, { bg: string; text: string }> = {
  ABAGUMYABANGA: { bg: "#FEE2E2", text: "#991B1B" },
  SYMPATHISANT:  { bg: "#DCFCE7", text: "#14532D" },
  DIASPORA:      { bg: "#DBEAFE", text: "#1E40AF" },
};
const COMPTE_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIF:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  INACTIF:  { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
  SUSPENDU: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
};
const COT_COLOR: Record<string, { bg: string; text: string }> = {
  A_JOUR:    { bg: "#DCFCE7", text: "#15803D" },
  EN_RETARD: { bg: "#FEE2E2", text: "#B91C1C" },
  PARTIEL:   { bg: "#FEF3C7", text: "#92400E" },
  EXONERE:   { bg: "#F3F4F6", text: "#6B7280" },
};
const COT_LABEL: Record<string, string> = { A_JOUR: "À jour", EN_RETARD: "En retard", PARTIEL: "Partiel", EXONERE: "Exonéré" };
const STATUT_LABEL: Record<string, string> = { ETUDIANT: "Étudiant", TRAVAILLEUR: "Travailleur", SANS_ACTIVITE: "Sans activité", AUTRE: "Autre" };

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
      {[35, 18, 18, 14, 14].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-100 rounded-full animate-pulse" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  );
}

const STATUT_FILTERS = [
  { value: "",            label: "Tous" },
  { value: "ETUDIANT",   label: "Étudiants" },
  { value: "TRAVAILLEUR",label: "Travailleurs" },
  { value: "SANS_ACTIVITE", label: "Sans activité" },
];

export default function MembresPage() {
  const router = useRouter();
  const [data, setData]             = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filters, setFilters]       = useState<Record<string, string | undefined>>({});
  const [page, setPage]             = useState(1);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<number | undefined>();
  const [importing, setImporting]   = useState(false);
  const [importResult, setImportResult] = useState<{
    crees: number; ignores?: number; extraits?: number;
    erreurs: { ligne?: number; index?: number; erreur: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef  = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await membresApi.list({ ...filters, page, page_size: PAGE_SIZE, search: search || undefined });
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, page, search]);

  useEffect(() => { setPage(1); }, [filters, search]);
  useEffect(() => { load(); }, [load]);

  const setFilter = (key: string, val: string | undefined) =>
    setFilters(f => ({ ...f, [key]: val || undefined }));

  const clearFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    try {
      const r = await membresApi.importExcel(file); setImportResult(r.data); load();
    } catch { setImportResult({ crees: 0, erreurs: [{ erreur: "Erreur lors de l'import Excel" }] }); }
    finally { setImporting(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    try {
      const r = await membresApi.importPdf(file); setImportResult(r.data); load();
    } catch { setImportResult({ crees: 0, erreurs: [{ erreur: "Erreur lors de l'import PDF" }] }); }
    finally { setImporting(false); if (pdfInputRef.current) pdfInputRef.current.value = ""; }
  };

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <AppLayout title="Membres" subtitle={data ? `${data.count} membre${data.count !== 1 ? "s" : ""} enregistré${data.count !== 1 ? "s" : ""}` : undefined}>

      {/* ── Toolbar principal ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Recherche */}
        <div className="flex-1 min-w-52 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher nom, prénom…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all" />
        </div>

        {/* Filtres avancés */}
        <FilterPanel filters={filters} onChange={setFilters} />

        {/* Séparateur + actions secondaires */}
        <div className="flex items-center gap-1.5 ml-auto">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors"
            title="Exporter en Excel">
            <Download size={14} /> <span className="hidden sm:inline">Export</span>
          </motion.button>

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          <input ref={pdfInputRef}  type="file" accept=".pdf"       className="hidden" onChange={handleImportPdf} />

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()} disabled={importing}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors disabled:opacity-60"
            title="Importer depuis Excel">
            {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span className="hidden sm:inline">Excel</span>
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => pdfInputRef.current?.click()} disabled={importing}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700 transition-colors disabled:opacity-60"
            title="Importer depuis PDF ABAGUMYABANGA">
            {importing ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            <span className="hidden sm:inline">PDF</span>
          </motion.button>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleTemplateDownload}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            title="Télécharger le modèle Excel">
            <FileSpreadsheet size={14} />
          </motion.button>
        </div>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setEditId(undefined); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #CE1126, #991010)", boxShadow: "0 4px 12px rgba(206,17,38,0.25)" }}>
          <Plus size={14} /> <span className="hidden sm:inline">Ajouter</span>
        </motion.button>
      </div>

      {/* ── Tabs cellule ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2 scrollbar-hide">
        <button
          onClick={() => setFilter("cellule", undefined)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
            !filters.cellule
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
          }`}>
          <SlidersHorizontal size={11} />
          Toutes les cellules
        </button>

        {CELLULES_MAROC.map(c => {
          const active = filters.cellule === c.value;
          return (
            <button key={c.value}
              onClick={() => setFilter("cellule", active ? undefined : c.value)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                active
                  ? "text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-700"
              }`}
              style={active ? { background: "linear-gradient(135deg,#6366F1,#4338CA)", borderColor: "#6366F1" } : {}}>
              {CELLULE_SHORT[c.value] || c.label.replace("Cellule ", "")}
            </button>
          );
        })}
      </div>

      {/* ── Filtres rapides statut + reset ────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {STATUT_FILTERS.map(s => {
          const active = (filters.statut_socio_pro || "") === s.value;
          return (
            <button key={s.value}
              onClick={() => setFilter("statut_socio_pro", s.value || undefined)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                active
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-red-200 hover:text-red-600"
              }`}>
              {s.label}
            </button>
          );
        })}

        {activeFilterCount > 0 && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all ml-auto">
            <X size={11} /> Effacer les filtres ({activeFilterCount})
          </button>
        )}
      </div>

      {/* ── Résultat import ───────────────────────────────────────── */}
      <AnimatePresence>
        {importResult && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
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
                <span className="ml-2 opacity-70">
                  · {importResult.extraits} extraits du PDF
                  {importResult.ignores ? `, ${importResult.ignores} déjà existants` : ""}
                </span>
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

      {/* ── Table ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Cellule</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Profil</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Compte</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Cotisation</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : (data?.results ?? []).map((m, i) => {
                      const cat = CAT_COLOR[m.categorie_affiliation];
                      const cpt = COMPTE_COLOR[m.statut_compte] || COMPTE_COLOR.INACTIF;
                      const cot = m.statut_cotisation ? COT_COLOR[m.statut_cotisation] : null;
                      return (
                        <motion.tr key={m.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15, delay: i * 0.02 }}
                          onClick={() => router.push(`/membres/${m.id}`)}
                          className="border-b border-gray-50 hover:bg-gray-50/80 cursor-pointer transition-colors group">

                          {/* Membre */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 transition-transform group-hover:scale-105"
                                style={{ background: `linear-gradient(135deg, ${cat?.text || "#CE1126"}, ${(cat?.text || "#CE1126") + "99"})` }}>
                                {m.prenom[0]}{m.nom[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{m.prenom} {m.nom}</p>
                                <p className="text-xs text-gray-400">{m.sexe === "M" ? "Homme" : "Femme"}{m.ville_residence ? ` · ${m.ville_residence}` : ""}</p>
                              </div>
                            </div>
                          </td>

                          {/* Cellule — toujours visible */}
                          <td className="px-4 py-3.5">
                            {m.cellule
                              ? <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: "rgba(99,102,241,0.1)", color: "#4338CA" }}>
                                  {CELLULE_SHORT[m.cellule] || CELLULE_LABEL[m.cellule] || m.cellule}
                                </span>
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>

                          {/* Catégorie */}
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            {cat
                              ? <Badge bg={cat.bg} text={cat.text} label={CAT_LABEL[m.categorie_affiliation as keyof typeof CAT_LABEL] || m.categorie_affiliation} />
                              : <span className="text-gray-400">—</span>}
                          </td>

                          {/* Profil socio-pro */}
                          <td className="px-4 py-3.5 text-xs text-gray-500 hidden md:table-cell">
                            {STATUT_LABEL[m.statut_socio_pro] || m.statut_socio_pro}
                          </td>

                          {/* Compte */}
                          <td className="px-4 py-3.5">
                            <Badge bg={cpt.bg} text={cpt.text} dot={cpt.dot} label={m.statut_compte} />
                          </td>

                          {/* Cotisation */}
                          <td className="px-4 py-3.5 hidden sm:table-cell">
                            {cot && m.statut_cotisation
                              ? <Badge bg={cot.bg} text={cot.text} label={COT_LABEL[m.statut_cotisation] || m.statut_cotisation} />
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>

                          {/* Actions */}
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
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Aucun membre trouvé</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="mt-2 text-xs text-red-500 hover:underline">
                      Effacer les filtres
                    </button>
                  )}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">
              Page {page} / {totalPages} · {data?.count} résultat{(data?.count ?? 0) !== 1 ? "s" : ""}
            </p>
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
        onSuccess={() => { load(); setShowModal(false); setEditId(undefined); }}
      />
    </AppLayout>
  );
}
