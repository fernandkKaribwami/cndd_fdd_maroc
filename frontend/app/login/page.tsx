"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "@/lib/auth";
import { Eye, EyeOff, Loader2, Shield, Mail, Code2 } from "lucide-react";
import CnddBackground from "@/components/layout/CnddBackground";

const DEVELOPER = {
  name:  "Fernand Karibwami",
  email: "fernand.karibwami@usmba.ac.ma",
  title: "Développeur Full-Stack",
};

export default function LoginPage() {
  const router = useRouter();
  const [username,     setUsername]     = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) { router.replace("/"); }
    else { setError("Identifiants incorrects. Veuillez réessayer."); }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden" style={{ background: "#090e18" }}>

      {/* ═══════════════════════════════════════════════════════
          PANNEAU GAUCHE — Visuel CNDD-FDD animé
      ═══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0b1520 0%, #111827 55%, #0a120a 100%)" }}>

        {/* Background animé avec aigle + logo SVG */}
        <CnddBackground theme="dark" />

        {/* Halos colorés CNDD */}
        <motion.div animate={{ scale:[1,1.35,1], opacity:[0.12,0.24,0.12] }}
          transition={{ duration:10, repeat:Infinity, ease:"easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle, #CE1126 0%, transparent 70%)", zIndex:1 }}/>
        <motion.div animate={{ scale:[1.2,1,1.2], opacity:[0.08,0.18,0.08] }}
          transition={{ duration:14, repeat:Infinity, ease:"easeInOut" }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle, #1EB53A 0%, transparent 70%)", zIndex:1 }}/>
        <motion.div animate={{ x:[-10,10,-10], y:[0,-15,0] }}
          transition={{ duration:18, repeat:Infinity, ease:"easeInOut" }}
          className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle, rgba(206,17,38,0.06) 0%, transparent 70%)", zIndex:1 }}/>

        {/* Contenu central */}
        <div className="relative flex flex-col items-center justify-center flex-1 px-12 z-10">

          {/* Grand aigle animé — vraie photo */}
          <motion.div
            animate={{ y:[0,-14,0], rotate:[-1.5,1.5,-1.5] }}
            transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
            className="mb-6"
            style={{ filter:"invert(1) brightness(1.1) drop-shadow(0 0 40px rgba(30,181,58,0.30)) drop-shadow(0 0 80px rgba(206,17,38,0.18))", width:220 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_aigle.png" alt="Aigle CNDD-FDD" style={{ width:220, height:"auto", display:"block" }} draggable={false} />
          </motion.div>

          {/* Logo CNDD-FDD animé — vraie photo */}
          <motion.div
            animate={{ y:[0,-7,0] }}
            transition={{ duration:5, repeat:Infinity, ease:"easeInOut", delay:0.8 }}
            className="mb-7"
            style={{ filter:"drop-shadow(0 6px 24px rgba(0,0,0,0.55))", width:240 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/cndd_logo.png" alt="Logo CNDD-FDD" style={{ width:240, height:"auto", display:"block", borderRadius:8 }} draggable={false} />
          </motion.div>

          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.5 }} className="text-center">
            <h2 className="text-xl font-extrabold text-white mb-1 tracking-wide">
              Conseil National pour la Défense de la Démocratie
            </h2>
            <p className="text-sm font-semibold" style={{ color:"#1EB53A" }}>
              Forces pour la Défense de la Démocratie
            </p>
            <p className="text-xs mt-2" style={{ color:"rgba(255,255,255,0.28)" }}>
              Section Maroc — Plateforme de gestion
            </p>
          </motion.div>

          {/* Barre tricolore */}
          <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }}
            transition={{ delay:0.6, duration:1 }}
            className="flex h-1.5 w-56 rounded-full overflow-hidden mt-7">
            <div className="flex-1" style={{ background:"#CE1126" }}/>
            <div className="flex-1 bg-white"/>
            <div className="flex-1" style={{ background:"#1EB53A" }}/>
          </motion.div>

          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
            className="text-xs mt-3 font-bold tracking-[0.22em] uppercase"
            style={{ color:"rgba(255,255,255,0.18)" }}>
            ABAGUMYABANGA
          </motion.p>
        </div>

        {/* Crédit développeur — bas gauche */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}
          className="relative z-10 px-8 pb-5 flex items-center gap-2">
          <Code2 size={12} style={{ color:"rgba(255,255,255,0.25)" }}/>
          <p className="text-xs" style={{ color:"rgba(255,255,255,0.22)" }}>
            Développé par <span className="font-semibold" style={{ color:"rgba(255,255,255,0.4)" }}>
              {DEVELOPER.name}
            </span>
          </p>
          <span style={{ color:"rgba(255,255,255,0.12)" }}>·</span>
          <a href={`mailto:${DEVELOPER.email}`}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color:"rgba(30,181,58,0.55)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#1EB53A")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(30,181,58,0.55)")}>
            <Mail size={10}/> {DEVELOPER.email}
          </a>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PANNEAU DROIT — Formulaire de connexion
      ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center justify-center w-full lg:w-[460px] flex-shrink-0 relative"
        style={{ background:"#111827" }}>

        {/* Ligne verticale décorative (séparation) */}
        <div className="hidden lg:block absolute left-0 top-8 bottom-8 w-px"
          style={{ background:"linear-gradient(to bottom, transparent, rgba(206,17,38,0.4) 30%, rgba(30,181,58,0.4) 70%, transparent)" }}/>

        {/* Background mobile */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity:0.35 }}>
          <CnddBackground theme="dark" />
        </div>

        <motion.div initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
          transition={{ duration:0.45, ease:[0.4,0,0.2,1] }}
          className="w-full max-w-sm px-8 py-10 relative z-10">

          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:4, repeat:Infinity }}
              style={{ width:90, filter:"invert(1) brightness(1.1)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/cndd_aigle.png" alt="" style={{ width:90, height:"auto", display:"block" }} draggable={false} />
            </motion.div>
          </div>

          {/* En-tête du formulaire */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={13} style={{ color:"#CE1126" }}/>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color:"#CE1126" }}>
                Accès sécurisé
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight">Connexion</h1>
            <p className="text-sm mt-1.5" style={{ color:"rgba(255,255,255,0.38)" }}>
              CNDD-FDD Section Maroc
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color:"rgba(255,255,255,0.38)" }}>
                Nom d&apos;utilisateur
              </label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                required autoComplete="username" placeholder="Votre identifiant"
                className="w-full px-4 py-3 rounded-xl text-sm text-white transition-all focus:outline-none"
                style={{ background:"rgba(255,255,255,0.055)", border:"1.5px solid rgba(255,255,255,0.09)" }}
                onFocus={e => { e.target.style.borderColor="rgba(206,17,38,0.7)"; e.target.style.background="rgba(206,17,38,0.07)"; }}
                onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.09)"; e.target.style.background="rgba(255,255,255,0.055)"; }}/>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color:"rgba(255,255,255,0.38)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white transition-all focus:outline-none"
                  style={{ background:"rgba(255,255,255,0.055)", border:"1.5px solid rgba(255,255,255,0.09)" }}
                  onFocus={e => { e.target.style.borderColor="rgba(206,17,38,0.7)"; e.target.style.background="rgba(206,17,38,0.07)"; }}
                  onBlur={e  => { e.target.style.borderColor="rgba(255,255,255,0.09)"; e.target.style.background="rgba(255,255,255,0.055)"; }}/>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color:"rgba(255,255,255,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.7)")}
                  onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.3)")}>
                  {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }}
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background:"rgba(206,17,38,0.12)", border:"1px solid rgba(206,17,38,0.3)", color:"#ff7070" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              style={{ background:"linear-gradient(135deg, #CE1126, #991010)", boxShadow:"0 6px 24px rgba(206,17,38,0.35)" }}>
              {loading && <Loader2 size={16} className="animate-spin"/>}
              {loading ? "Connexion en cours…" : "Se connecter"}
            </motion.button>
          </form>

          {/* Mention sécurité */}
          <p className="text-xs text-center mt-6" style={{ color:"rgba(255,255,255,0.18)" }}>
            Accès réservé — Bureau CNDD-FDD Section Maroc
          </p>

          {/* ── Crédit développeur ── */}
          <div className="mt-10 pt-6 border-t flex flex-col items-center gap-1.5"
            style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1.5">
              <Code2 size={11} style={{ color:"rgba(255,255,255,0.22)" }}/>
              <span className="text-xs" style={{ color:"rgba(255,255,255,0.22)" }}>
                Développé par
              </span>
              <span className="text-xs font-semibold" style={{ color:"rgba(255,255,255,0.45)" }}>
                {DEVELOPER.name}
              </span>
            </div>
            <a href={`mailto:${DEVELOPER.email}`}
              className="flex items-center gap-1.5 text-xs transition-colors"
              style={{ color:"rgba(30,181,58,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.color="#1EB53A")}
              onMouseLeave={e => (e.currentTarget.style.color="rgba(30,181,58,0.5)")}>
              <Mail size={11}/> {DEVELOPER.email}
            </a>
            <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.12)" }}>
              CNDD-FDD Maroc © {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
