"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, GraduationCap, CreditCard, LayoutDashboard, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { logout } from "@/lib/auth";
import { useState } from "react";

const NAV = [
  { href: "/",            icon: LayoutDashboard, label: "Tableau de bord", accent: "#CE1126" },
  { href: "/membres",     icon: Users,            label: "Membres",         accent: "#1EB53A" },
  { href: "/etudiants",   icon: GraduationCap,    label: "Étudiants",       accent: "#3B82F6" },
  { href: "/cotisations", icon: CreditCard,        label: "Cotisations",     accent: "#F59E0B" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-screen flex-shrink-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #111827 0%, #0d1117 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <motion.div whileHover={{ scale: 1.1, rotate: 4 }} whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 280 }}
          className="flex-shrink-0 cursor-pointer"
          style={{ width: collapsed ? 30 : 42 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/cndd_aigle.png"
            alt="CNDD-FDD"
            style={{
              width: collapsed ? 30 : 42,
              height: "auto",
              display: "block",
              filter: "invert(1) brightness(1.1) drop-shadow(0 0 8px rgba(30,181,58,0.6))",
            }}
            draggable={false}
          />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
              <p className="font-extrabold text-sm text-white tracking-wide leading-tight">CNDD-FDD</p>
              <p className="text-xs font-semibold" style={{ color: "#1EB53A" }}>Section Maroc</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: active ? `${item.accent}18` : "transparent",
                  borderLeft: `3px solid ${active ? item.accent : "transparent"}`,
                }}
              >
                <item.icon size={19} className="flex-shrink-0" style={{ color: active ? item.accent : "rgba(255,255,255,0.4)" }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                      className="text-sm font-semibold whitespace-nowrap"
                      style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.5)" }}>
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── Carte infos ────────────────────────────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 pb-3">
            <div className="rounded-xl p-3" style={{ background: "rgba(206,17,38,0.08)", border: "1px solid rgba(206,17,38,0.15)" }}>
              <p className="text-xs font-bold text-white mb-0.5">CNDD-FDD Section Maroc</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>CNDD-FDD Maroc v1.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Déconnexion ────────────────────────────────────────── */}
      <div className="px-2 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={logout}
          title={collapsed ? "Déconnexion" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all"
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(206,17,38,0.10)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={17} className="flex-shrink-0" style={{ color: "#CE1126" }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Toggle ────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-10 text-white"
        style={{ background: "linear-gradient(135deg, #CE1126, #991010)", boxShadow: "0 2px 8px rgba(206,17,38,0.5)" }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </motion.button>
    </motion.aside>
  );
}
