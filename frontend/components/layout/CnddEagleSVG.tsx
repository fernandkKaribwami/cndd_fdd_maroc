"use client";

// ─── Réplique SVG fidèle du logo et de l'aigle CNDD-FDD ─────────────────────

interface SVGProps {
  width?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** Aigle CNDD-FDD — épées croisées + feuilles de ricin vertes */
export function CnddAigleSVG({ width = 200, className, style }: SVGProps) {
  const h = Math.round(width * 0.82);
  return (
    <svg width={width} height={h} viewBox="0 0 300 245"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>

      {/* ── Aile gauche ── */}
      <path d="M148,98 Q108,55 38,62 Q58,86 82,100 Q105,110 130,108 Z"
        fill="#111" stroke="#0a0a0a" strokeWidth="0.5"/>
      {/* Plumes aile gauche */}
      <path d="M38,62 Q28,78 42,90 Q56,82 60,96 Q75,88 80,102 Q95,94 100,108"
        fill="none" stroke="#0a0a0a" strokeWidth="1.2"/>
      <path d="M38,62 Q22,80 36,95 Q50,87 56,100" fill="none" stroke="#1a1a1a" strokeWidth="0.8"/>

      {/* ── Aile droite ── */}
      <path d="M152,98 Q192,55 262,62 Q242,86 218,100 Q195,110 170,108 Z"
        fill="#111" stroke="#0a0a0a" strokeWidth="0.5"/>
      {/* Plumes aile droite */}
      <path d="M262,62 Q272,78 258,90 Q244,82 240,96 Q225,88 220,102 Q205,94 200,108"
        fill="none" stroke="#0a0a0a" strokeWidth="1.2"/>
      <path d="M262,62 Q278,80 264,95 Q250,87 244,100" fill="none" stroke="#1a1a1a" strokeWidth="0.8"/>

      {/* ── Corps ── */}
      <ellipse cx="150" cy="130" rx="32" ry="44" fill="#111"/>

      {/* ── Tête ── */}
      <ellipse cx="150" cy="72" rx="26" ry="25" fill="#111"/>
      {/* Bec crochu */}
      <path d="M165,66 Q185,70 175,80 Q165,76 163,68 Z" fill="#222"/>
      {/* Narine */}
      <ellipse cx="170" cy="70" rx="3" ry="1.5" fill="#1a1a1a"/>
      {/* Œil */}
      <circle cx="160" cy="64" r="7" fill="white"/>
      <circle cx="161" cy="64" r="4" fill="#111"/>
      <circle cx="162.5" cy="63" r="1.5" fill="white"/>

      {/* ── Queue ── */}
      <path d="M128,166 Q135,196 142,166 Z" fill="#111"/>
      <path d="M136,168 Q150,200 164,168 Z" fill="#111"/>
      <path d="M157,166 Q162,196 170,166 Z" fill="#111"/>
      <path d="M122,162 Q128,188 134,162 Z" fill="#0d0d0d"/>
      <path d="M165,162 Q171,188 178,162 Z" fill="#0d0d0d"/>

      {/* ── ÉPÉE GAUCHE (inclinée / vers bas-droite) ── */}
      <g transform="rotate(-38 105 140)">
        {/* Lame */}
        <rect x="100" y="72" width="9" height="85" rx="2"
          fill="url(#blade1)" stroke="#bbb" strokeWidth="0.5"/>
        {/* Garde transversale */}
        <rect x="91" y="80" width="26" height="8" rx="2" fill="#ccc"/>
        <rect x="92" y="81" width="24" height="6" rx="1" fill="#ddd"/>
        {/* Poignée */}
        <rect x="102" y="58" width="7" height="22" rx="2" fill="#888"/>
        <rect x="103" y="59" width="5" height="20" rx="1" fill="#aaa"/>
        {/* Pommeau */}
        <ellipse cx="105.5" cy="58" rx="7" ry="5" fill="#bbb"/>
      </g>

      {/* ── ÉPÉE DROITE (inclinée / vers bas-gauche) ── */}
      <g transform="rotate(38 195 140)">
        <rect x="191" y="72" width="9" height="85" rx="2"
          fill="url(#blade2)" stroke="#bbb" strokeWidth="0.5"/>
        <rect x="182" y="80" width="26" height="8" rx="2" fill="#ccc"/>
        <rect x="183" y="81" width="24" height="6" rx="1" fill="#ddd"/>
        <rect x="193" y="58" width="7" height="22" rx="2" fill="#888"/>
        <rect x="194" y="59" width="5" height="20" rx="1" fill="#aaa"/>
        <ellipse cx="196.5" cy="58" rx="7" ry="5" fill="#bbb"/>
      </g>

      {/* ── BRANCHE GAUCHE — feuilles de ricin ── */}
      <g>
        {/* Tige principale */}
        <path d="M92,175 Q72,162 50,170" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M72,162 Q55,148 42,155" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M85,168 Q75,152 65,155" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Feuilles grandes palmées */}
        <path d="M50,170 Q32,148 18,155 Q38,165 50,170 Z" fill="#1EB53A"/>
        <path d="M50,170 Q28,160 20,145 Q40,155 50,170 Z" fill="#22C55E"/>
        <path d="M50,170 Q35,152 25,140 Q45,152 50,170 Z" fill="#16A34A"/>
        <path d="M42,155 Q22,140 12,148 Q30,158 42,155 Z" fill="#1EB53A"/>
        <path d="M42,155 Q25,142 20,130 Q38,145 42,155 Z" fill="#22C55E"/>
        <path d="M65,155 Q50,135 40,140 Q55,152 65,155 Z" fill="#1EB53A"/>
        <path d="M65,155 Q55,133 48,125 Q62,142 65,155 Z" fill="#22C55E"/>
        {/* Nervures */}
        <path d="M50,170 L18,155 M50,170 L12,148 M42,155 L12,130"
          stroke="#166534" strokeWidth="0.8" fill="none"/>
      </g>

      {/* ── BRANCHE DROITE — feuilles de ricin ── */}
      <g>
        <path d="M208,175 Q228,162 250,170" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M228,162 Q245,148 258,155" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M215,168 Q225,152 235,155" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M250,170 Q268,148 282,155 Q262,165 250,170 Z" fill="#1EB53A"/>
        <path d="M250,170 Q272,160 280,145 Q260,155 250,170 Z" fill="#22C55E"/>
        <path d="M250,170 Q265,152 275,140 Q255,152 250,170 Z" fill="#16A34A"/>
        <path d="M258,155 Q278,140 288,148 Q270,158 258,155 Z" fill="#1EB53A"/>
        <path d="M258,155 Q275,142 280,130 Q262,145 258,155 Z" fill="#22C55E"/>
        <path d="M235,155 Q250,135 260,140 Q245,152 235,155 Z" fill="#1EB53A"/>
        <path d="M235,155 Q245,133 252,125 Q238,142 235,155 Z" fill="#22C55E"/>
        <path d="M250,170 L282,155 M250,170 L288,148 M258,155 L288,130"
          stroke="#166534" strokeWidth="0.8" fill="none"/>
      </g>

      {/* Dégradés pour les lames */}
      <defs>
        <linearGradient id="blade1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d0d0d0"/>
          <stop offset="50%" stopColor="#f0f0f0"/>
          <stop offset="100%" stopColor="#b0b0b0"/>
        </linearGradient>
        <linearGradient id="blade2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b0b0b0"/>
          <stop offset="50%" stopColor="#f0f0f0"/>
          <stop offset="100%" stopColor="#d0d0d0"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Logo complet CNDD-FDD avec fond rouge, texte et aigle */
export function CnddLogoSVG({ width = 280, className, style }: SVGProps) {
  const h = Math.round(width * 0.72);
  return (
    <svg width={width} height={h} viewBox="0 0 280 200"
      xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      {/* Fond rouge */}
      <rect width="280" height="200" rx="6" fill="#CE1126"/>
      {/* Bordure verte */}
      <rect x="3" y="3" width="274" height="194" rx="5" fill="none" stroke="#1EB53A" strokeWidth="5"/>
      {/* Bordure blanche intérieure */}
      <rect x="6" y="6" width="268" height="188" rx="4" fill="none" stroke="white" strokeWidth="1.5"/>

      {/* Texte ABAGUMYABANGA en haut */}
      <text x="140" y="22" textAnchor="middle" fill="white"
        fontSize="10" fontWeight="700" letterSpacing="2" fontFamily="Arial, sans-serif">
        ABAGUMYABANGA
      </text>

      {/* ── Aigle miniature centré ── */}
      <g transform="translate(56, 28) scale(0.56)">
        {/* Ailes */}
        <path d="M148,98 Q108,55 38,62 Q58,86 82,100 Q105,110 130,108 Z" fill="#111"/>
        <path d="M152,98 Q192,55 262,62 Q242,86 218,100 Q195,110 170,108 Z" fill="#111"/>
        {/* Corps */}
        <ellipse cx="150" cy="130" rx="32" ry="44" fill="#111"/>
        {/* Tête */}
        <ellipse cx="150" cy="72" rx="26" ry="25" fill="#111"/>
        <path d="M165,66 Q185,70 175,80 Q165,76 163,68 Z" fill="#222"/>
        <circle cx="160" cy="64" r="7" fill="white"/>
        <circle cx="161" cy="64" r="4" fill="#111"/>
        <circle cx="162.5" cy="63" r="1.5" fill="white"/>
        {/* Queue */}
        <path d="M132,164 Q150,198 168,164 Z" fill="#111"/>
        {/* Épée gauche */}
        <g transform="rotate(-38 105 140)">
          <rect x="100" y="72" width="9" height="85" rx="2" fill="#e8e8e8"/>
          <rect x="91" y="80" width="26" height="8" rx="2" fill="#ccc"/>
          <rect x="102" y="58" width="7" height="22" rx="2" fill="#999"/>
          <ellipse cx="105.5" cy="58" rx="7" ry="5" fill="#bbb"/>
        </g>
        {/* Épée droite */}
        <g transform="rotate(38 195 140)">
          <rect x="191" y="72" width="9" height="85" rx="2" fill="#e8e8e8"/>
          <rect x="182" y="80" width="26" height="8" rx="2" fill="#ccc"/>
          <rect x="193" y="58" width="7" height="22" rx="2" fill="#999"/>
          <ellipse cx="196.5" cy="58" rx="7" ry="5" fill="#bbb"/>
        </g>
        {/* Branches gauche */}
        <path d="M50,170 Q32,148 18,155 Q38,165 50,170 Z" fill="#1EB53A"/>
        <path d="M42,155 Q22,140 12,148 Q30,158 42,155 Z" fill="#1EB53A"/>
        <path d="M65,155 Q50,135 40,140 Q55,152 65,155 Z" fill="#1EB53A"/>
        {/* Branches droite */}
        <path d="M250,170 Q268,148 282,155 Q262,165 250,170 Z" fill="#1EB53A"/>
        <path d="M258,155 Q278,140 288,148 Q270,158 258,155 Z" fill="#1EB53A"/>
        <path d="M235,155 Q250,135 260,140 Q245,152 235,155 Z" fill="#1EB53A"/>
      </g>

      {/* Ligne séparatrice */}
      <line x1="14" y1="162" x2="266" y2="162" stroke="#1EB53A" strokeWidth="2"/>

      {/* Texte CNDD-FDD en bas */}
      <text x="140" y="186" textAnchor="middle" fill="white"
        fontSize="26" fontWeight="900" letterSpacing="1" fontFamily="Arial Black, sans-serif">
        CNDD-FDD
      </text>
    </svg>
  );
}
