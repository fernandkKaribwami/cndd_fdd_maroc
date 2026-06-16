"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UserPlus, UserCog } from "lucide-react";
import { membresApi, referentielsApi } from "@/lib/api";

interface Ref { id: number; nom: string; }

interface MembreFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  membreId?: number; // si fourni → mode édition
}

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-colors placeholder:text-gray-300";
const SELECT_CLS = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-colors cursor-pointer";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ num, label, accent = "#CE1126" }: { num: number; label: string; accent?: string }) {
  return (
    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{ background: accent }}>
        {num}
      </span>
      {label}
    </h3>
  );
}

const EMPTY_FORM = {
  nom: "", prenom: "", sexe: "M",
  date_naissance: "", telephone: "", email: "",
  ville_residence: "", date_arrivee_maroc: "",
  categorie_affiliation: "DIASPORA",
  statut_socio_pro: "AUTRE",
  statut_compte: "ACTIF",
  observations: "",
};

const EMPTY_PROFIL = {
  cycle: "", domaine: "", filiere: "", niveau: "",
  etablissement: "", ville_etudes: "",
  annee_academique: "2025-2026", statut_parcours: "EN_COURS",
};

export default function MembreFormModal({ open, onClose, onSuccess, membreId }: MembreFormModalProps) {
  const isEdit = !!membreId;
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError]       = useState("");
  const [isEtudiant, setIsEtudiant] = useState(false);
  const [cycles, setCycles]     = useState<Ref[]>([]);
  const [domaines, setDomaines] = useState<Ref[]>([]);
  const [filieres, setFilieres] = useState<Ref[]>([]);
  const [niveaux, setNiveaux]   = useState<Ref[]>([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [profil, setProfil]     = useState(EMPTY_PROFIL);

  // Charger les référentiels
  useEffect(() => {
    if (!open) return;
    referentielsApi.getCycles().then(r  => setCycles(r.data.results   || r.data));
    referentielsApi.getDomaines().then(r => setDomaines(r.data.results || r.data));
    referentielsApi.getNiveaux().then(r  => setNiveaux(r.data.results  || r.data));
  }, [open]);

  // Charger les filières selon le domaine
  useEffect(() => {
    if (profil.domaine) {
      referentielsApi.getFilieres(Number(profil.domaine))
        .then(r => setFilieres(r.data.results || r.data));
    }
  }, [profil.domaine]);

  // Mode édition : pré-remplir le formulaire
  useEffect(() => {
    if (!open || !membreId) {
      setForm(EMPTY_FORM);
      setProfil(EMPTY_PROFIL);
      setIsEtudiant(false);
      return;
    }
    setFetching(true);
    membresApi.get(membreId).then(r => {
      const m = r.data;
      setForm({
        nom:                  m.nom || "",
        prenom:               m.prenom || "",
        sexe:                 m.sexe || "M",
        date_naissance:       m.date_naissance || "",
        telephone:            m.telephone || "",
        email:                m.email || "",
        ville_residence:      m.ville_residence || "",
        date_arrivee_maroc:   m.date_arrivee_maroc || "",
        categorie_affiliation: m.categorie_affiliation || "DIASPORA",
        statut_socio_pro:     m.statut_socio_pro || "AUTRE",
        statut_compte:        m.statut_compte || "ACTIF",
        observations:         m.observations || "",
      });
      if (m.profil_etudiant) {
        const p = m.profil_etudiant;
        const domaineId = String(p.domaine || "");
        setProfil({
          cycle:            String(p.cycle || ""),
          domaine:          domaineId,
          filiere:          String(p.filiere || ""),
          niveau:           String(p.niveau || ""),
          etablissement:    p.etablissement || "",
          ville_etudes:     p.ville_etudes || "",
          annee_academique: p.annee_academique || "2025-2026",
          statut_parcours:  p.statut_parcours || "EN_COURS",
        });
        // Charger les filières du domaine
        if (domaineId) {
          referentielsApi.getFilieres(Number(domaineId))
            .then(r2 => setFilieres(r2.data.results || r2.data));
        }
        setIsEtudiant(true);
      } else {
        setIsEtudiant(m.statut_socio_pro === "ETUDIANT");
      }
    }).finally(() => setFetching(false));
  }, [open, membreId]);

  useEffect(() => {
    if (!membreId) setIsEtudiant(form.statut_socio_pro === "ETUDIANT");
  }, [form.statut_socio_pro, membreId]);

  const set    = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setPro = (k: string, v: string) => setProfil(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (isEtudiant && profil.cycle) {
        payload.profil_etudiant = {
          cycle: Number(profil.cycle), domaine: Number(profil.domaine),
          filiere: Number(profil.filiere), niveau: Number(profil.niveau),
          etablissement: profil.etablissement, ville_etudes: profil.ville_etudes,
          annee_academique: profil.annee_academique, statut_parcours: profil.statut_parcours,
        };
      }
      Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
      if (isEdit) {
        await membresApi.update(membreId!, payload);
      } else {
        await membresApi.create(payload);
      }
      onSuccess(); onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } };
      setError(JSON.stringify(e?.response?.data || "Erreur lors de l'enregistrement"));
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>

            {/* Bande tricolore */}
            <div className="flex h-1.5 rounded-t-2xl overflow-hidden">
              <div className="flex-1 bg-red-600"/>
              <div className="flex-1 bg-white border-y border-gray-100"/>
              <div className="flex-1 bg-green-500"/>
            </div>

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEdit ? "bg-blue-50 border border-blue-100" : "bg-red-50 border border-red-100"}`}>
                  {isEdit
                    ? <UserCog size={16} className="text-blue-600" />
                    : <UserPlus size={16} className="text-red-600" />}
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-base">
                    {isEdit ? "Modifier le membre" : "Nouveau membre"}
                  </h2>
                  <p className="text-xs text-gray-400">CNDD-FDD Section Maroc</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </motion.button>
            </div>

            {fetching ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-red-400" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* 1 — Identité */}
                <div>
                  <SectionTitle num={1} label="Identité" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nom *">
                      <input required className={INPUT_CLS} value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="NIYONKURU" />
                    </Field>
                    <Field label="Prénom *">
                      <input required className={INPUT_CLS} value={form.prenom} onChange={e => set("prenom", e.target.value)} placeholder="Jean" />
                    </Field>
                    <Field label="Sexe *">
                      <select required className={SELECT_CLS} value={form.sexe} onChange={e => set("sexe", e.target.value)}>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </Field>
                    <Field label="Date de naissance">
                      <input type="date" className={INPUT_CLS} value={form.date_naissance || ""} onChange={e => set("date_naissance", e.target.value)} />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-gray-100"/>

                {/* 2 — Contact */}
                <div>
                  <SectionTitle num={2} label="Contact & Résidence" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Téléphone">
                      <input className={INPUT_CLS} value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="+212 6XX XXX XXX" />
                    </Field>
                    <Field label="Email">
                      <input type="email" className={INPUT_CLS} value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemple.com" />
                    </Field>
                    <Field label="Ville de résidence">
                      <input className={INPUT_CLS} value={form.ville_residence} onChange={e => set("ville_residence", e.target.value)} placeholder="Casablanca" />
                    </Field>
                    <Field label="Arrivée au Maroc">
                      <input type="date" className={INPUT_CLS} value={form.date_arrivee_maroc || ""} onChange={e => set("date_arrivee_maroc", e.target.value)} />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-gray-100"/>

                {/* 3 — Affiliation */}
                <div>
                  <SectionTitle num={3} label="Affiliation CNDD-FDD" />
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Catégorie *">
                      <select required className={SELECT_CLS} value={form.categorie_affiliation} onChange={e => set("categorie_affiliation", e.target.value)}>
                        <option value="ABAGUMYABANGA">Abagumyabanga</option>
                        <option value="SYMPATHISANT">Sympathisant</option>
                        <option value="DIASPORA">Diaspora</option>
                      </select>
                    </Field>
                    <Field label="Statut socio-pro *">
                      <select required className={SELECT_CLS} value={form.statut_socio_pro} onChange={e => set("statut_socio_pro", e.target.value)}>
                        <option value="ETUDIANT">Étudiant</option>
                        <option value="TRAVAILLEUR">Travailleur</option>
                        <option value="SANS_ACTIVITE">Sans activité</option>
                        <option value="AUTRE">Autre</option>
                      </select>
                    </Field>
                    <Field label="Statut compte">
                      <select className={SELECT_CLS} value={form.statut_compte} onChange={e => set("statut_compte", e.target.value)}>
                        <option value="ACTIF">Actif</option>
                        <option value="INACTIF">Inactif</option>
                        <option value="SUSPENDU">Suspendu</option>
                      </select>
                    </Field>
                  </div>
                </div>

                {/* 4 — Profil étudiant */}
                <AnimatePresence>
                  {isEtudiant && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: "hidden" }}>
                      <div className="border-t border-gray-100 mb-5"/>
                      <SectionTitle num={4} label="Profil académique" accent="#1EB53A" />
                      <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                        <Field label="Cycle">
                          <select className={SELECT_CLS} value={profil.cycle} onChange={e => setPro("cycle", e.target.value)}>
                            <option value="">Sélectionner</option>
                            {cycles.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                          </select>
                        </Field>
                        <Field label="Domaine">
                          <select className={SELECT_CLS} value={profil.domaine} onChange={e => setPro("domaine", e.target.value)}>
                            <option value="">Sélectionner</option>
                            {domaines.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                          </select>
                        </Field>
                        <Field label="Filière">
                          <select className={SELECT_CLS} value={profil.filiere} onChange={e => setPro("filiere", e.target.value)}>
                            <option value="">Sélectionner</option>
                            {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                          </select>
                        </Field>
                        <Field label="Niveau">
                          <select className={SELECT_CLS} value={profil.niveau} onChange={e => setPro("niveau", e.target.value)}>
                            <option value="">Sélectionner</option>
                            {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
                          </select>
                        </Field>
                        <Field label="Établissement">
                          <input className={INPUT_CLS} value={profil.etablissement} onChange={e => setPro("etablissement", e.target.value)} placeholder="ENSIAS, EMI…" />
                        </Field>
                        <Field label="Ville d'études">
                          <input className={INPUT_CLS} value={profil.ville_etudes} onChange={e => setPro("ville_etudes", e.target.value)} placeholder="Rabat" />
                        </Field>
                        <Field label="Année académique">
                          <input className={INPUT_CLS} value={profil.annee_academique} onChange={e => setPro("annee_academique", e.target.value)} placeholder="2025-2026" />
                        </Field>
                        <Field label="Statut parcours">
                          <select className={SELECT_CLS} value={profil.statut_parcours} onChange={e => setPro("statut_parcours", e.target.value)}>
                            <option value="EN_COURS">En cours</option>
                            <option value="DIPLOME">Diplômé</option>
                            <option value="ABANDON">Abandon</option>
                            <option value="REORIENTATION">Réorientation</option>
                          </select>
                        </Field>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="border-t border-gray-100"/>

                <Field label="Observations">
                  <textarea value={form.observations} onChange={e => set("observations", e.target.value)}
                    rows={2} placeholder="Notes éventuelles…"
                    className={INPUT_CLS + " resize-y"} />
                </Field>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-xl px-4 py-3 text-sm bg-red-50 border border-red-100 text-red-700">
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-1">
                  <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                  </motion.button>
                  <motion.button type="submit" disabled={loading}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{
                      background: isEdit
                        ? "linear-gradient(135deg, #2563EB, #1d4ed8)"
                        : "linear-gradient(135deg, #CE1126, #991010)",
                      boxShadow: isEdit
                        ? "0 4px 16px rgba(37,99,235,0.25)"
                        : "0 4px 16px rgba(206,17,38,0.25)",
                    }}>
                    {loading && <Loader2 size={15} className="animate-spin"/>}
                    {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Enregistrer le membre"}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
