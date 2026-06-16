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
  floatH: number;
  floatDur: number;
  restDelay: number;
  driftX: number;
}

const LIGHT_ITEMS: BgItem[] = [
  { type:"logo",  width:115, top:"4%",    right:"2%",   opacity:0.20, rotate: 7,  delay:0.0, floatH:28, floatDur:2.2, restDelay:1.8, driftX: 6  },
  { type:"flag",  width:130, bottom:"6%", left:"3%",    opacity:0.18, rotate:-5,  delay:0.7, floatH:32, floatDur:2.5, restDelay:2.0, driftX:-8  },
  { type:"aigle", width:105, top:"42%",   right:"0.5%", opacity:0.17, rotate: 4,  delay:1.4, floatH:24, floatDur:2.0, restDelay:1.5, driftX:-5  },
  { type:"logo",  width:85,  top:"16%",   left:"6%",    opacity:0.15, rotate:-9,  delay:2.1, floatH:20, floatDur:1.9, restDelay:2.3, driftX: 7  },
  { type:"aigle", width:95,  bottom:"22%",right:"7%",   opacity:0.16, rotate: 3,  delay:2.9, floatH:22, floatDur:2.1, restDelay:1.6, driftX: 4  },
  { type:"flag",  width:75,  top:"63%",   left:"18%",   opacity:0.14, rotate:-4,  delay:3.6, floatH:18, floatDur:2.0, restDelay:2.5, driftX:-6  },
  { type:"aigle", width:68,  top:"30%",   left:"40%",   opacity:0.13, rotate: 6,  delay:4.3, floatH:16, floatDur:1.8, restDelay:2.8, driftX: 5  },
  { type:"logo",  width:100, bottom:"40%",right:"22%",  opacity:0.15, rotate:11,  delay:1.6, floatH:24, floatDur:2.0, restDelay:1.9, driftX:-7  },
  { type:"flag",  width:110, top:"75%",   right:"32%",  opacity:0.14, rotate:-6,  delay:5.1, floatH:20, floatDur:2.3, restDelay:2.2, driftX: 8  },
];

const DARK_ITEMS: BgItem[] = [
  { type:"logo",  width:165, top:"3%",    right:"1%",   opacity:0.40, rotate: 8,  delay:0.0, floatH:36, floatDur:2.4, restDelay:1.6, driftX: 8  },
  { type:"flag",  width:180, bottom:"4%", left:"2%",    opacity:0.36, rotate:-5,  delay:0.5, floatH:40, floatDur:2.6, restDelay:1.8, driftX:-10 },
  { type:"aigle", width:140, top:"33%",   right:"0%",   opacity:0.33, rotate: 3,  delay:1.1, floatH:30, floatDur:2.2, restDelay:1.4, driftX:-6  },
  { type:"logo",  width:118, top:"6%",    left:"3%",    opacity:0.29, rotate:-10, delay:1.6, floatH:28, floatDur:2.0, restDelay:2.0, driftX: 9  },
  { type:"aigle", width:148, bottom:"14%",right:"6%",   opacity:0.31, rotate:-4,  delay:2.1, floatH:32, floatDur:2.3, restDelay:1.5, driftX: 5  },
  { type:"flag",  width:105, top:"57%",   left:"16%",   opacity:0.27, rotate: 6,  delay:2.6, floatH:26, floatDur:2.0, restDelay:1.8, driftX:-7  },
];

export type BgTheme = "light" | "dark";

const SRC: Record<ImgType, string> = {
  aigle: "/images/cndd_aigle.png",
  logo:  "/images/cndd_logo.png",
  flag:  "/images/cndd_flag.png",
};

function itemFilter(type: ImgType, theme: BgTheme): string {
  if (theme === "dark" && type === "aigle") return "invert(1) brightness(1.1)";
  return "none";
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
          animate={{
            y: [0, -item.floatH, 0],
            x: [0, item.driftX, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: item.floatDur,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: item.restDelay,
            times: [0, 0.5, 1],
            ease: ["easeOut", "easeIn"],
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
