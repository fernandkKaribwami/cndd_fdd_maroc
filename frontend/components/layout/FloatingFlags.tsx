"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// ─── Drapeau CNDD-FDD fidèle en SVG haute qualité ────────────────────────────
// Rouge | Vert (aigle) | Blanc  —  proportions réelles
export function DrapeauCNDD({ width = 90, style }: { width?: number; style?: React.CSSProperties }) {
  const h = Math.round(width * 0.62);
  const b = width / 3;
  const ex = b + b / 2;
  const ey = h / 2;
  const s  = h * 0.42;

  const leafColor = "#1A7A0A";

  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`}
      style={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.45)", ...style }}>
      <defs>
        <clipPath id={`fc-${width}`}><rect width={width} height={h} rx={4}/></clipPath>
      </defs>
      <g clipPath={`url(#fc-${width})`}>
        {/* Bandes */}
        <rect x={0}   y={0} width={b}   height={h} fill="#CE1126"/>
        <rect x={b}   y={0} width={b}   height={h} fill="#2D8A1A"/>
        <rect x={b*2} y={0} width={b+1} height={h} fill="#FFFFFF"/>

        {/* ── AIGLE ── */}
        {/* Corps */}
        <ellipse cx={ex} cy={ey+s*0.06} rx={s*0.19} ry={s*0.26} fill="#0A0A0A"/>
        {/* Tête face gauche */}
        <ellipse cx={ex-s*0.17} cy={ey-s*0.28} rx={s*0.12} ry={s*0.11} fill="#0A0A0A"/>
        {/* Œil */}
        <circle  cx={ex-s*0.23} cy={ey-s*0.30} r={s*0.025} fill="white"/>
        {/* Bec */}
        <path d={`M${ex-s*0.28},${ey-s*0.26} L${ex-s*0.38},${ey-s*0.22} L${ex-s*0.27},${ey-s*0.18}Z`} fill="#D4A017"/>

        {/* Aile gauche déployée */}
        <path d={`
          M${ex-s*0.08},${ey-s*0.05}
          C${ex-s*0.35},${ey-s*0.40} ${ex-s*0.60},${ey-s*0.35} ${ex-s*0.72},${ey-s*0.05}
          C${ex-s*0.55},${ey+s*0.05} ${ex-s*0.30},${ey+s*0.08} ${ex-s*0.08},${ey-s*0.05}Z
        `} fill="#0A0A0A"/>
        {/* Détail plumes aile gauche */}
        {[0.2, 0.4, 0.6].map((t,i)=>(
          <line key={i}
            x1={ex-s*(0.08+t*0.5)} y1={ey-s*(0.05+t*0.22)}
            x2={ex-s*(0.10+t*0.52)} y2={ey+s*0.04}
            stroke="#1a1a1a" strokeWidth={s*0.018}/>
        ))}

        {/* Aile droite déployée */}
        <path d={`
          M${ex+s*0.08},${ey-s*0.05}
          C${ex+s*0.35},${ey-s*0.40} ${ex+s*0.60},${ey-s*0.35} ${ex+s*0.72},${ey-s*0.05}
          C${ex+s*0.55},${ey+s*0.05} ${ex+s*0.30},${ey+s*0.08} ${ex+s*0.08},${ey-s*0.05}Z
        `} fill="#0A0A0A"/>
        {[0.2,0.4,0.6].map((t,i)=>(
          <line key={i}
            x1={ex+s*(0.08+t*0.5)} y1={ey-s*(0.05+t*0.22)}
            x2={ex+s*(0.10+t*0.52)} y2={ey+s*0.04}
            stroke="#1a1a1a" strokeWidth={s*0.018}/>
        ))}

        {/* Queue */}
        <path d={`
          M${ex-s*0.14},${ey+s*0.22}
          L${ex-s*0.20},${ey+s*0.46}
          L${ex},${ey+s*0.38}
          L${ex+s*0.20},${ey+s*0.46}
          L${ex+s*0.14},${ey+s*0.22}Z
        `} fill="#0A0A0A"/>

        {/* Pattes */}
        <line x1={ex-s*0.09} y1={ey+s*0.33} x2={ex-s*0.14} y2={ey+s*0.50} stroke="#0A0A0A" strokeWidth={s*0.04}/>
        <line x1={ex+s*0.09} y1={ey+s*0.33} x2={ex+s*0.14} y2={ey+s*0.50} stroke="#0A0A0A" strokeWidth={s*0.04}/>

        {/* ── ÉPÉE (de bas-gauche à haut-droite) ── */}
        <line x1={ex-s*0.48} y1={ey+s*0.45} x2={ex+s*0.38} y2={ey-s*0.32}
          stroke="#D0D0D0" strokeWidth={s*0.075} strokeLinecap="round"/>
        {/* Garde de l'épée */}
        <line x1={ex-s*0.06} y1={ey+s*0.06} x2={ex+s*0.06} y2={ey-s*0.06}
          stroke="#B8960C" strokeWidth={s*0.06} strokeLinecap="round"/>
        {/* Pointe */}
        <polygon points={`
          ${ex+s*0.38},${ey-s*0.32}
          ${ex+s*0.44},${ey-s*0.44}
          ${ex+s*0.30},${ey-s*0.24}
        `} fill="#C0C0C0"/>

        {/* ── BRANCHE / FEUILLES (de bas-droite à haut-gauche) ── */}
        <line x1={ex+s*0.42} y1={ey+s*0.42} x2={ex-s*0.30} y2={ey-s*0.30}
          stroke={leafColor} strokeWidth={s*0.055} strokeLinecap="round"/>
        {/* Feuilles sur la branche */}
        {[0,1,2,3,4,5].map((i)=>{
          const t = i/5;
          const bx = ex+s*0.42 - t*(s*0.72);
          const by = ey+s*0.42 - t*(s*0.72);
          const angle = -45 + (i%2===0 ? 30 : -30);
          return (
            <ellipse key={i}
              cx={bx} cy={by}
              rx={s*0.09} ry={s*0.04}
              fill={leafColor}
              transform={`rotate(${angle},${bx},${by})`}
            />
          );
        })}
      </g>
    </svg>
  );
}

// ─── Config éléments flottants ────────────────────────────────────────────────
interface FlagEl {
  id: number; startX: number; startY: number;
  size: number; opacity: number;
  duration: number; delay: number;
  driftX: number; driftY: number;
  rotate: number; rotDelta: number;
}

function sr(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function gen(count: number): FlagEl[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: sr(i * 7)  * 88,
    startY: sr(i * 13) * 88,
    size:    60 + sr(i * 3) * 60,         // 60 à 120px — bien visible
    opacity: 0.28 + sr(i * 5) * 0.40,     // 0.28 à 0.68 — vraiment visible
    duration: 18 + sr(i * 11) * 20,
    delay:   sr(i * 17) * -30,
    driftX:  (sr(i * 23) - 0.5) * 180,
    driftY:  -70 - sr(i * 29) * 160,
    rotate:  (sr(i * 41) - 0.5) * 18,
    rotDelta:(sr(i * 37) - 0.5) * 22,
  }));
}

// ─── FloatingFlags ────────────────────────────────────────────────────────────
export default function FloatingFlags({ count = 18 }: { count?: number }) {
  const [flags] = useState<FlagEl[]>(() => gen(count));
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  if (!ok) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
      {flags.map((f) => (
        <motion.div key={f.id}
          style={{ position: "absolute", left: `${f.startX}%`, top: `${f.startY}%` }}
          animate={{
            y: [0, f.driftY * 0.4, f.driftY, f.driftY * 0.5, 0],
            x: [0, f.driftX * 0.3, f.driftX * 0.7, f.driftX * 0.2, 0],
            rotate: [f.rotate, f.rotate+f.rotDelta, f.rotate-f.rotDelta*0.4, f.rotate+f.rotDelta*0.1, f.rotate],
            opacity: [f.opacity, f.opacity*1.3, f.opacity*0.75, f.opacity*1.1, f.opacity],
            scale: [1, 1.05, 0.97, 1.03, 1],
          }}
          transition={{ duration: f.duration, delay: f.delay, repeat: Infinity, ease: "easeInOut", times:[0,.25,.5,.75,1] }}
        >
          <DrapeauCNDD width={f.size} style={{ opacity: f.opacity }} />
        </motion.div>
      ))}
    </div>
  );
}
