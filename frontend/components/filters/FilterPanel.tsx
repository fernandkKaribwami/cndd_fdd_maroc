"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { referentielsApi, VILLES_MAROC } from "@/lib/api";

interface FilterValues {
  categorie_affiliation?: string;
  statut_compte?: string;
  statut_socio_pro?: string;
  ville_residence?: string;
  cycle?: string;
  domaine?: string;
  filiere?: string;
  niveau?: string;
  annee_academique?: string;
  statut_cotisation?: string;
  annee_cotisation?: string;
  [key: string]: string | undefined;
}

interface FilterPanelProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  showEtudiantFilters?: boolean;
  showCotisationFilters?: boolean;
}

const SELECT_CLS = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 mt-1 cursor-pointer";
const INPUT_CLS  = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 mt-1";
const LABEL_CLS  = "text-[10px] font-bold uppercase tracking-widest text-gray-400";

function SectionDivider({ label, color = "#CE1126" }: { label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
      <div className="flex-1 h-px bg-gray-100"/>
    </div>
  );
}

export default function FilterPanel({
  filters, onChange, showEtudiantFilters = true, showCotisationFilters = true,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [cycles, setCycles]   = useState<{ id: number; nom: string }[]>([]);
  const [domaines, setDomaines] = useState<{ id: number; nom: string }[]>([]);
  const [niveaux, setNiveaux]  = useState<{ id: number; nom: string }[]>([]);

  useEffect(() => {
    referentielsApi.getCycles().then(r  => setCycles(r.data.results   || r.data));
    referentielsApi.getDomaines().then(r => setDomaines(r.data.results || r.data));
    referentielsApi.getNiveaux().then(r  => setNiveaux(r.data.results  || r.data));
  }, []);

  const activeCount = Object.values(filters).filter(Boolean).length;
  const set  = (key: string, value: string) => onChange({ ...filters, [key]: value || undefined });
  const reset = () => onChange({});

  return (
    <div className="relative">
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all bg-white"
        style={
          open || activeCount > 0
            ? { borderColor: "#CE1126", color: "#CE1126", background: "#FFF5F5" }
            : { borderColor: "#E5E7EB", color: "#6B7280" }
        }>
        <Filter size={14} />
        Filtres
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-red-600 text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 mt-2 w-72 p-4 rounded-2xl z-50 bg-white"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 16px 48px rgba(0,0,0,0.12)" }}>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-sm">Filtres</h3>
              <div className="flex gap-2 items-center">
                {activeCount > 0 && (
                  <button onClick={reset} className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold">
                    <X size={11} /> Réinitialiser
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Catégorie</label>
                <select className={SELECT_CLS} value={filters.categorie_affiliation || ""} onChange={e => set("categorie_affiliation", e.target.value)}>
                  <option value="">Toutes</option>
                  <option value="ABAGUMYABANGA">Abagumyabanga</option>
                  <option value="SYMPATHISANT">Sympathisant</option>
                  <option value="DIASPORA">Diaspora</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Statut compte</label>
                <select className={SELECT_CLS} value={filters.statut_compte || ""} onChange={e => set("statut_compte", e.target.value)}>
                  <option value="">Tous</option>
                  <option value="ACTIF">Actif</option>
                  <option value="INACTIF">Inactif</option>
                  <option value="SUSPENDU">Suspendu</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Statut socio-pro</label>
                <select className={SELECT_CLS} value={filters.statut_socio_pro || ""} onChange={e => set("statut_socio_pro", e.target.value)}>
                  <option value="">Tous</option>
                  <option value="ETUDIANT">Étudiant</option>
                  <option value="TRAVAILLEUR">Travailleur</option>
                  <option value="SANS_ACTIVITE">Sans activité</option>
                </select>
              </div>

              <div>
                <label className={LABEL_CLS}>Ville de résidence</label>
                <select className={SELECT_CLS} value={filters.ville_residence || ""} onChange={e => set("ville_residence", e.target.value)}>
                  <option value="">Toutes</option>
                  {VILLES_MAROC.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {showEtudiantFilters && (
                <>
                  <SectionDivider label="Profil académique" color="#1EB53A" />
                  <div>
                    <label className={LABEL_CLS}>Cycle</label>
                    <select className={SELECT_CLS} value={filters.cycle || ""} onChange={e => set("cycle", e.target.value)}>
                      <option value="">Tous</option>
                      {cycles.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Domaine</label>
                    <select className={SELECT_CLS} value={filters.domaine || ""} onChange={e => set("domaine", e.target.value)}>
                      <option value="">Tous</option>
                      {domaines.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Niveau</label>
                    <select className={SELECT_CLS} value={filters.niveau || ""} onChange={e => set("niveau", e.target.value)}>
                      <option value="">Tous</option>
                      {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Année académique</label>
                    <input type="text" placeholder="ex: 2025-2026" className={INPUT_CLS}
                      value={filters.annee_academique || ""} onChange={e => set("annee_academique", e.target.value)} />
                  </div>
                </>
              )}

              {showCotisationFilters && (
                <>
                  <SectionDivider label="Cotisations" color="#CE1126" />
                  <div>
                    <label className={LABEL_CLS}>Statut cotisation</label>
                    <select className={SELECT_CLS} value={filters.statut_cotisation || ""} onChange={e => set("statut_cotisation", e.target.value)}>
                      <option value="">Tous</option>
                      <option value="A_JOUR">À jour</option>
                      <option value="EN_RETARD">En retard</option>
                      <option value="PARTIEL">Partiel</option>
                      <option value="EXONERE">Exonéré</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Année cotisation</label>
                    <input type="number" placeholder={String(new Date().getFullYear())} className={INPUT_CLS}
                      value={filters.annee_cotisation || ""} onChange={e => set("annee_cotisation", e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
