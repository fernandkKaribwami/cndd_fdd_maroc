"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, User, GraduationCap, CreditCard, Phone, Mail, MapPin,
  Calendar, Award, CheckCircle, XCircle, Clock, AlertCircle, TrendingUp,
  Edit2, Building,
} from "lucide-react";
import { membresApi, cotisationsApi } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProfilEtudiant {
  cycle_detail: { nom: string }; domaine_detail: { nom: string };
  filiere_detail: { nom: string }; niveau_detail: { nom: string };
  etablissement: string; ville_etudes: string;
  annee_academique: string; statut_parcours: string;
}
interface Membre {
  id: number; nom: string; prenom: string; sexe: string;
  date_naissance: string | null; telephone: string; email: string;
  ville_residence: string; date_arrivee_maroc: string | null;
  categorie_affiliation: string; statut_socio_pro: string;
  statut_compte: string; date_adhesion: string; observations: string;
  profil_etudiant: ProfilEtudiant | null;
}
interface Cotisation {
  id: number; annee: number; trimestre: number;
  montant_attendu: number; montant_paye: number;
  statut: string; statut_display: string;
  mode_paiement: string; date_paiement: string | null;
}
interface Resume {
  cotisations: Cotisation[]; total_du: number; total_paye: number; solde: number; taux: number;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = { ABAGUMYABANGA: "Abagumyabanga", SYMPATHISANT: "Sympathisant", DIASPORA: "Diaspora" };
const CAT_COLORS: Record<string, string> = { ABAGUMYABANGA: "#CE1126", SYMPATHISANT: "#1EB53A", DIASPORA: "#3B82F6" };

const COT_CONFIG: Record<string, { bg: string; text: string; icon: React.ElementType; barColor: string }> = {
  A_JOUR:    { bg: "#DCFCE7", text: "#15803D", icon: CheckCircle,  barColor: "#22C55E" },
  EN_RETARD: { bg: "#FEE2E2", text: "#B91C1C", icon: XCircle,      barColor: "#EF4444" },
  PARTIEL:   { bg: "#FEF3C7", text: "#92400E", icon: Clock,        barColor: "#F59E0B" },
  EXONERE:   { bg: "#F3F4F6", text: "#6B7280", icon: AlertCircle,  barColor: "#9CA3AF" },
};
const COMPTE: Record<string, { dot: string; text: string; bg: string }> = {
  ACTIF:    { dot: "#22C55E", text: "#15803D", bg: "#DCFCE7" },
  INACTIF:  { dot: "#9CA3AF", text: "#6B7280", bg: "#F3F4F6" },
  SUSPENDU: { dot: "#EF4444", text: "#B91C1C", bg: "#FEE2E2" },
};
const PARCOURS: Record<string, { bg: string; text: string; label: string }> = {
  EN_COURS:      { bg: "#DBEAFE", text: "#1E40AF", label: "En cours" },
  DIPLOME:       { bg: "#DCFCE7", text: "#14532D", label: "Diplômé" },
  ABANDON:       { bg: "#FEE2E2", text: "#991B1B", label: "Abandon" },
  REORIENTATION: { bg: "#FEF3C7", text: "#92400E", label: "Réorientation" },
};

// ─── Composants helper ──────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, accent = "#6B7280" }: { icon: React.ElementType; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${accent}12` }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function CotBadge({ statut }: { statut: string }) {
  const c = COT_CONFIG[statut]; if (!c) return null;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: c.bg, color: c.text }}>
      <Icon size={11} /> {statut === "A_JOUR" ? "À jour" : statut === "EN_RETARD" ? "Retard" : statut === "PARTIEL" ? "Partiel" : "Exonéré"}
    </span>
  );
}

export default function MembreDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [membre, setMembre] = useState<Membre | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profil" | "cotisations">("profil");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      membresApi.get(Number(id)),
      cotisationsApi.resumeMembre(Number(id)),
    ]).then(([m, c]) => { setMembre(m.data); setResume(c.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout title="Profil membre">
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-4 border-red-200 border-t-red-600" />
        </div>
      </AppLayout>
    );
  }

  if (!membre) {
    return <AppLayout title="Introuvable"><div className="text-center py-20 text-gray-400">Membre non trouvé.</div></AppLayout>;
  }

  const taux = resume?.taux ?? 0;
  const catColor = CAT_COLORS[membre.categorie_affiliation] || "#CE1126";
  const cpteStyle = COMPTE[membre.statut_compte] || COMPTE.INACTIF;

  const cotParAnnee: Record<number, Cotisation[]> = {};
  (resume?.cotisations || []).forEach(c => {
    if (!cotParAnnee[c.annee]) cotParAnnee[c.annee] = [];
    cotParAnnee[c.annee].push(c);
  });

  return (
    <AppLayout title="Profil membre" subtitle={`${membre.prenom} ${membre.nom}`}>

      {/* ── Retour ──────────────────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 mb-5 transition-colors"
      >
        <ArrowLeft size={15} /> Retour à la liste
      </motion.button>

      {/* ── Hero card ─────────────────────────────────────────────
          Fond sombre avec drapeaux CNDD bien visibles              */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl overflow-hidden mb-5"
        style={{ minHeight: 200 }}
      >
        {/* Fond sombre dégradé */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, #111827 0%, ${catColor}22 60%, #0d1117 100%)`,
        }} />

        {/* ── Images CNDD-FDD décoration hero ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Aigle gauche */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-3, 2, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute"
            style={{ top: "50%", left: "4%", transform: "translateY(-50%)", opacity: 0.24, width: 135, filter: "invert(1) brightness(1.1)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_aigle.png" alt="" style={{ width: 135, height: "auto", display: "block" }} draggable={false} />
          </motion.div>
          {/* Logo centre-haut */}
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [2, -2, 2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute"
            style={{ top: "6%", left: "36%", opacity: 0.18, width: 110 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_logo.png" alt="" style={{ width: 110, height: "auto", display: "block", borderRadius: 6 }} draggable={false} />
          </motion.div>
          {/* Aigle droite — plus grand */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [4, -3, 4] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute"
            style={{ top: "50%", right: "3%", transform: "translateY(-50%)", opacity: 0.28, width: 155, filter: "invert(1) brightness(1.1)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_aigle.png" alt="" style={{ width: 155, height: "auto", display: "block" }} draggable={false} />
          </motion.div>
          {/* Logo bas */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute"
            style={{ bottom: "4%", left: "23%", opacity: 0.13, width: 75 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_logo.png" alt="" style={{ width: 75, height: "auto", display: "block", borderRadius: 4 }} draggable={false} />
          </motion.div>

          {/* Halos de couleur */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-25"
            style={{ background: `radial-gradient(circle, ${catColor}, transparent 70%)` }} />
          <div className="absolute -bottom-16 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-15"
            style={{ background: "radial-gradient(circle, #1EB53A, transparent 70%)" }} />

          {/* Bande tricolore haut */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1" style={{ background: "#CE1126" }} />
            <div className="flex-1 bg-white opacity-80" />
            <div className="flex-1" style={{ background: "#1EB53A" }} />
          </div>
        </div>

        {/* Contenu hero */}
        <div className="relative z-10 p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
            className="relative flex-shrink-0"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold"
              style={{
                background: `linear-gradient(135deg, ${catColor}, ${catColor}88)`,
                boxShadow: `0 8px 24px ${catColor}44`,
              }}>
              {membre.prenom[0]}{membre.nom[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900"
              style={{ background: cpteStyle.dot }} />
          </motion.div>

          {/* Infos texte */}
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h2 className="text-2xl font-extrabold text-white">{membre.prenom} {membre.nom}</h2>
                {/* Aigle CNDD dans le titre — signature */}
                <div style={{ opacity: 0.75, width: 34, filter: "invert(1) brightness(1.1)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/cndd_aigle.png" alt="" style={{ width: 34, height: "auto", display: "block" }} draggable={false} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: `${catColor}30`, color: catColor === "#CE1126" ? "#ff9090" : catColor === "#1EB53A" ? "#5edb78" : "#93c5fd" }}>
                  {CAT_LABELS[membre.categorie_affiliation] || membre.categorie_affiliation}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  {membre.sexe === "M" ? "Homme" : "Femme"}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: `${cpteStyle.dot}30`, color: cpteStyle.dot }}>
                  {membre.statut_compte}
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                Membre depuis le {new Date(membre.date_adhesion).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </motion.div>
          </div>

          {/* Taux cotisations */}
          {resume && (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="text-center sm:text-right flex-shrink-0">
              <p className="text-4xl font-extrabold text-white tabular-nums">{taux}%</p>
              <p className="text-xs mt-1 mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>Taux de cotisation</p>
              <div className="w-28 h-2.5 rounded-full overflow-hidden mx-auto sm:ml-auto sm:mr-0"
                style={{ background: "rgba(255,255,255,0.12)" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${taux}%` }} transition={{ duration: 1.2, delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: taux >= 80 ? "#22C55E" : taux >= 50 ? "#F59E0B" : "#CE1126" }} />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit mb-5 shadow-sm">
        {(["profil", "cotisations"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="relative px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ color: tab === t ? "#ffffff" : "#9CA3AF" }}
          >
            {tab === t && (
              <motion.div layoutId="tab-indicator"
                className="absolute inset-0 rounded-lg"
                style={{ background: "linear-gradient(135deg, #CE1126, #991010)" }} />
            )}
            <span className="relative flex items-center gap-2">
              {t === "profil" ? <><User size={14} /> Profil</> : <><CreditCard size={14} /> Cotisations</>}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Onglet Profil ──────────────────────────────────────── */}
        {tab === "profil" && (
          <motion.div key="profil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Infos personnelles */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <User size={15} className="text-red-500" /> Informations personnelles
                </h3>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <Edit2 size={13} />
                </motion.button>
              </div>
              <InfoRow icon={Phone} label="Téléphone" value={membre.telephone} accent="#1EB53A" />
              <InfoRow icon={Mail} label="Email" value={membre.email} accent="#3B82F6" />
              <InfoRow icon={MapPin} label="Ville de résidence" value={membre.ville_residence} accent="#8B5CF6" />
              <InfoRow icon={Calendar} label="Date de naissance"
                value={membre.date_naissance ? new Date(membre.date_naissance).toLocaleDateString("fr-FR") : "—"} accent="#F59E0B" />
              <InfoRow icon={Calendar} label="Arrivée au Maroc"
                value={membre.date_arrivee_maroc ? new Date(membre.date_arrivee_maroc).toLocaleDateString("fr-FR") : "—"} accent="#EC4899" />
              <InfoRow icon={Award} label="Catégorie CNDD-FDD"
                value={CAT_LABELS[membre.categorie_affiliation] || membre.categorie_affiliation} accent={catColor} />
              {membre.observations && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-medium text-amber-700 mb-1">Observations</p>
                  <p className="text-sm text-amber-800">{membre.observations}</p>
                </div>
              )}
            </div>

            {/* Profil académique */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap size={15} className="text-green-500" /> Profil académique
              </h3>
              {membre.profil_etudiant ? (
                <div className="space-y-3">
                  {/* Card cycle/filière */}
                  <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)", border: "1px solid #BBF7D0" }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                        {membre.profil_etudiant.cycle_detail?.nom}
                      </span>
                      {(() => {
                        const p = PARCOURS[membre.profil_etudiant.statut_parcours];
                        return p ? <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: p.bg, color: p.text }}>{p.label}</span> : null;
                      })()}
                    </div>
                    <p className="font-extrabold text-gray-900 text-lg leading-tight">{membre.profil_etudiant.filiere_detail?.nom}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{membre.profil_etudiant.domaine_detail?.nom}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Award, label: "Niveau", value: membre.profil_etudiant.niveau_detail?.nom, c: "#3B82F6" },
                      { icon: Calendar, label: "Année académique", value: membre.profil_etudiant.annee_academique, c: "#8B5CF6" },
                    ].map(({ icon: I, label, value, c }) => (
                      <div key={label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <I size={12} style={{ color: c }} />
                          <p className="text-xs text-gray-400 font-medium">{label}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                    <div className="col-span-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Building size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-400 font-medium">Établissement</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{membre.profil_etudiant.etablissement}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{membre.profil_etudiant.ville_etudes}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-300">
                  <GraduationCap size={44} className="mb-3" />
                  <p className="text-sm font-medium text-gray-400">Pas de profil académique</p>
                  <p className="text-xs text-gray-300 mt-1">Statut : {membre.statut_socio_pro}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Onglet Cotisations ─────────────────────────────────── */}
        {tab === "cotisations" && (
          <motion.div key="cot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total dû", value: `${(resume?.total_du || 0).toLocaleString()} MAD`, bg: "#F9FAFB", border: "#E5E7EB", text: "#374151" },
                { label: "Total payé", value: `${(resume?.total_paye || 0).toLocaleString()} MAD`, bg: "#F0FDF4", border: "#BBF7D0", text: "#15803D" },
                { label: "Solde restant", value: `${(resume?.solde || 0).toLocaleString()} MAD`, bg: (resume?.solde || 0) === 0 ? "#F0FDF4" : "#FEF2F2", border: (resume?.solde || 0) === 0 ? "#BBF7D0" : "#FECACA", text: (resume?.solde || 0) === 0 ? "#15803D" : "#B91C1C" },
              ].map((k, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-4" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                  <p className="text-xs font-medium text-gray-500 mb-1">{k.label}</p>
                  <p className="text-lg font-extrabold" style={{ color: k.text }}>{k.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Barre globale */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-red-500" />
                  <p className="text-sm font-bold text-gray-800">Taux de recouvrement global</p>
                </div>
                <span className="text-2xl font-extrabold"
                  style={{ color: taux >= 80 ? "#15803D" : taux >= 50 ? "#D97706" : "#B91C1C" }}>
                  {taux}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${taux}%` }} transition={{ duration: 1.3, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: taux >= 80 ? "linear-gradient(90deg, #22C55E, #16A34A)" : taux >= 50 ? "linear-gradient(90deg, #F59E0B, #D97706)" : "linear-gradient(90deg, #CE1126, #991010)" }}
                />
              </div>
            </div>

            {/* Par année */}
            {Object.keys(cotParAnnee).length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
                <CreditCard size={44} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">Aucune cotisation enregistrée</p>
              </div>
            ) : (
              Object.entries(cotParAnnee).sort(([a], [b]) => Number(b) - Number(a)).map(([annee, cots], ai) => (
                <motion.div key={annee} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ai * 0.08 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800">Année {annee}</p>
                    <span className="text-xs text-gray-400">{cots.length} trimestre(s)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-50">
                    {[1, 2, 3, 4].map(t => {
                      const c = cots.find(x => x.trimestre === t);
                      const pct = c ? Math.min((c.montant_paye / c.montant_attendu) * 100, 100) : 0;
                      const barColor = c ? COT_CONFIG[c.statut]?.barColor || "#9CA3AF" : "#E5E7EB";
                      return (
                        <div key={t} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400">T{t}</span>
                            {c ? <CotBadge statut={c.statut} /> : <span className="text-xs text-gray-200">—</span>}
                          </div>
                          {c ? (
                            <>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: ai * 0.08 + t * 0.06 }}
                                  className="h-full rounded-full" style={{ background: barColor }} />
                              </div>
                              <p className="text-sm font-bold text-gray-800">
                                {c.montant_paye.toLocaleString()}
                                <span className="text-xs font-normal text-gray-400"> / {c.montant_attendu} MAD</span>
                              </p>
                              {c.date_paiement && (
                                <p className="text-xs text-gray-400 mt-1">{new Date(c.date_paiement).toLocaleDateString("fr-FR")}</p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-gray-300 mt-2">Non généré</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
