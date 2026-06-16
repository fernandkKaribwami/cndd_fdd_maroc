"use client";

import { motion } from "framer-motion";

type ImgType = "aigle" | "logo" | "flag";

interface BgItem {
  type: ImgType;
  width: number;
  top?: string; bottom?: string;
  left?: string; right?: string;
  opacity: number;
  rotate: number;
  delay: number;
  bounceH: number;
  bounceDur: number;
  restDelay: number;
}

/* ── Thème clair (pages contenu) ── bien visibles mais discrets */
const LIGHT_ITEMS: BgItem[] = [
  { type:"logo",  width:115, top:"4%",    right:"2%",   opacity:0.18, rotate: 7,  delay:0.0, bounceH:22, bounceDur:0.75, restDelay:2.8 },
  { type:"flag",  width:130, bottom:"6%", left:"3%",    opacity:0.16, rotate:-5,  delay:0.7, bounceH:26, bounceDur:0.80, restDelay:3.2 },
  { type:"aigle", width:105, top:"42%",   right:"0.5%", opacity:0.15, rotate: 4,  delay:1.3, bounceH:20, bounceDur:0.70, restDelay:2.5 },
  { type:"logo",  width:85,  top:"16%",   left:"6%",    opacity:0.14, rotate:-9,  delay:2.0, bounceH:18, bounceDur:0.65, restDelay:3.5 },
  { type:"aigle", width:95,  bottom:"22%",right:"7%",   opacity:0.15, rotate: 3,  delay:2.6, bounceH:20, bounceDur:0.75, restDelay:2.7 },
  { type:"flag",  width:75,  top:"63%",   left:"18%",   opacity:0.13, rotate:-4,  delay:3.2, bounceH:16, bounceDur:0.65, restDelay:4.0 },
  { type:"aigle", width:68,  top:"30%",   left:"40%",   opacity:0.12, rotate: 6,  delay:3.8, bounceH:14, bounceDur:0.60, restDelay:3.8 },
  { type:"logo",  width:100, bottom:"40%",right:"22%",  opacity:0.14, rotate:11,  delay:1.6, bounceH:20, bounceDur:0.70, restDelay:3.0 },
  { type:"flag",  width:110, top:"75%",   right:"32%",  opacity:0.13, rotate:-6,  delay:4.4, bounceH:18, bounceDur:0.75, restDelay:3.3 },
];

/* ── Thème sombre (login, hero) ── bien visibles */
const DARK_ITEMS: BgItem[] = [
  { type:"logo",  width:165, top:"3%",    right:"1%",   opacity:0.38, rotate: 8,  delay:0.0, bounceH:28, bounceDur:0.85, restDelay:2.2 },
  { type:"flag",  width:180, bottom:"4%", left:"2%",    opacity:0.35, rotate:-5,  delay:0.5, bounceH:32, bounceDur:0.90, restDelay:2.6 },
  { type:"aigle", width:140, top:"33%",   right:"0%",   opacity:0.32, rotate: 3,  delay:1.0, bounceH:26, bounceDur:0.80, restDelay:2.0 },
  { type:"logo",  width:118, top:"6%",    left:"3%",    opacity:0.28, rotate:-10, delay:1.5, bounceH:24, bounceDur:0.75, restDelay:3.0 },
  { type:"aigle", width:148, bottom:"14%",right:"6%",   opacity:0.30, rotate:-4,  delay:1.9, bounceH:26, bounceDur:0.82, restDelay:2.4 },
  { type:"flag",  width:105, top:"57%",   left:"16%",   opacity:0.26, rotate: 6,  delay:2.4, bounceH:22, bounceDur:0.70, restDelay:2.8 },
];

export type BgTheme = "light" | "dark";

const SRC: Record<ImgType, string> = {
  aigle: "/images/cndd_aigle.png",
  logo:  "/images/cndd_logo.png",
  flag:  "/images/cndd_flag.png",
};

/* Sur fond sombre l'aigle (fond blanc) doit être inversé */
function itemFilter(type: ImgType, theme: BgTheme): string {
  if (theme === "dark" && type === "aigle") return "invert(1) brightness(1.1)";
  return "none";
}

/* Keyframes du rebond : montée rapide → retombée avec 2 micro-rebonds */
function bounceKeyframes(h: number) {
  return {
    y:     [0, -h * 0.55, -h, -h * 0.25, -h * 0.55, 0],
    scale: [1, 1.03, 1.06, 0.98, 1.02, 1],
  };
}

export default function CnddBackground({
  theme = "light",
  className = "",
}: {
  theme?: BgTheme;
  className?: string;
}) {
  const items = theme === "dark" ? DARK_ITEMS : LIGHT_ITEMS;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    >
      {items.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            top: item.top,
            bottom: item.bottom,
            left: item.left,
            right: item.right,
            width: item.width,
            opacity: item.opacity,
            rotate: item.rotate,
            transformOrigin: "center bottom",
          }}
          animate={bounceKeyframes(item.bounceH)}
          transition={{
            duration: item.bounceDur,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: item.restDelay,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.28, 0.5, 0.68, 0.84, 1],
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SRC[item.type]}
            alt=""
            draggable={false}
            style={{
              width: item.width,
              height: "auto",
              display: "block",
              filter: itemFilter(item.type, theme),
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
