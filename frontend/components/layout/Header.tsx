"use client";

import { Bell, Search, X, ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <header className="bg-white dark:border-slate-700 border-b border-gray-200/80 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
      {/* Titre */}
      <motion.div key={title} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
      </motion.div>

      {/* Actions droite */}
      <div className="flex items-center gap-2">

        {/* Recherche */}
        <AnimatePresence mode="wait">
          {searchOpen ? (
            <motion.div key="open" initial={{ width: 40, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 40, opacity: 0 }} transition={{ duration: 0.22 }} className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input autoFocus onBlur={() => setSearchOpen(false)} placeholder="Rechercher…"
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 bg-white" />
              <button onMouseDown={() => setSearchOpen(false)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.button key="icon" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 bg-white transition-colors">
              <Search size={15} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Notifications */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 bg-white transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
        </motion.button>

        {/* Toggle thème */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          title={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
          className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 bg-white transition-colors"
        >
          <AnimatePresence mode="wait">
            {theme === "dark" ? (
              <motion.div key="sun" initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sun size={15} />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -30, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Moon size={15} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Séparateur */}
        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Avatar + menu */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.01 }}
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #CE1126, #991010)" }}>
              CF
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight">Bureau</p>
              <p className="text-xs text-green-600 font-medium leading-tight">CNDD-FDD Maroc</p>
            </div>
            <ChevronDown size={13} className="text-gray-400" style={{ transform: userMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </motion.button>

          <AnimatePresence>
            {userMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2"
              >
                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                  <p className="text-sm font-semibold text-gray-800">Bureau représentatif</p>
                  <p className="text-xs text-gray-400">CNDD-FDD Section Maroc</p>
                </div>
                <button
                  onClick={() => { setUserMenu(false); logout(); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
