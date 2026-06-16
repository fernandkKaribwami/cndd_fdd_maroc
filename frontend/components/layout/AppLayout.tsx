"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Header from "./Header";
import CnddBackground from "./CnddBackground";
import { motion } from "framer-motion";
import { Mail, Code2 } from "lucide-react";

const DEV = { name:"Fernand Karibwami", email:"fernand.karibwami@usmba.ac.ma" };

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#EEF2F7" }}>

      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} subtitle={subtitle} />

        {/* Zone de contenu avec background animé */}
        <div className="flex-1 overflow-hidden relative">

          {/* Background avec vraies images CNDD-FDD */}
          <CnddBackground theme="light" />

          {/* Grain subtil pour texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(206,17,38,0.03) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(30,181,58,0.03) 0%, transparent 50%)`,
              zIndex: 1,
            }}
          />

          <motion.main
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative h-full overflow-y-auto p-6 pb-10"
            style={{ zIndex: 2 }}
          >
            {children}

            {/* ── Footer développeur ── */}
            <div className="mt-10 pt-4 border-t border-gray-200/60 flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Code2 size={11} className="text-gray-300"/>
                <span className="text-xs text-gray-400">Développé par</span>
                <span className="text-xs font-semibold text-gray-500">{DEV.name}</span>
              </div>
              <span className="text-gray-300 text-xs">·</span>
              <a href={`mailto:${DEV.email}`}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors font-medium">
                <Mail size={10}/> {DEV.email}
              </a>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-xs text-gray-400">CNDD-FDD Maroc © {new Date().getFullYear()}</span>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}
