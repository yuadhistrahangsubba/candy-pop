import type { ReactNode } from "react";
import type { CandyColor, SpecialType } from "@/game-engine/types";

/**
 * Festival Treasures — every colour is a Bhutanese motif, each a distinct
 * silhouette so pieces are tellable apart by shape as well as colour:
 *   red    → coral bead (mala)
 *   blue   → turquoise stone
 *   green  → prayer leaf
 *   yellow → butter lamp
 *   purple → lotus flower
 *   orange → golden temple bell
 *   color-bomb → Thunder Dragon Orb
 */

interface TreasureDef {
  light: string;
  dark: string;
  /** Outline used for striped/wrapped overlays and the drop silhouette. */
  outline: string;
  render: (gradId: string) => ReactNode;
}

const spec = (cx: number, cy: number, rx: number, ry: number, rotate = -28, opacity = 0.75) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx={rx}
    ry={ry}
    fill={`rgba(255,255,255,${opacity})`}
    transform={`rotate(${rotate} ${cx} ${cy})`}
  />
);

const TREASURES: Record<CandyColor, TreasureDef> = {
  red: {
    // Coral mala bead — round bead with a hint of the string hole
    light: "#ff8fa0",
    dark: "#d51b46",
    outline: "M50 8 A42 42 0 1 1 49.9 8 Z",
    render: (gradId) => (
      <>
        <circle cx="50" cy="50" r="42" fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="9" fill="rgba(120,10,40,0.35)" />
        <circle cx="50" cy="50" r="5" fill="rgba(80,5,25,0.45)" />
        {spec(34, 30, 12, 8)}
      </>
    ),
  },
  blue: {
    // Turquoise nugget with matrix veins
    light: "#7fded9",
    dark: "#1583a8",
    outline:
      "M50 7 C68 7 86 18 89 36 C92 54 84 74 68 85 C55 93 41 92 29 84 C14 74 8 56 12 38 C16 20 32 7 50 7 Z",
    render: (gradId) => (
      <>
        <path
          d="M50 7 C68 7 86 18 89 36 C92 54 84 74 68 85 C55 93 41 92 29 84 C14 74 8 56 12 38 C16 20 32 7 50 7 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(0,0,0,0.16)"
          strokeWidth="1.5"
        />
        <path d="M22 40 Q38 48 44 66 M60 16 Q58 34 72 44" stroke="rgba(10,60,75,0.3)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {spec(34, 27, 12, 8)}
      </>
    ),
  },
  green: {
    // Prayer leaf with centre vein
    light: "#9aec9d",
    dark: "#1fa843",
    outline: "M50 6 C80 22 92 52 78 74 C68 90 44 95 30 86 C12 74 8 48 20 30 C28 17 38 10 50 6 Z",
    render: (gradId) => (
      <>
        <path
          d="M50 6 C80 22 92 52 78 74 C68 90 44 95 30 86 C12 74 8 48 20 30 C28 17 38 10 50 6 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(0,0,0,0.16)"
          strokeWidth="1.5"
        />
        <path d="M50 12 C46 38 44 62 46 86" stroke="rgba(10,90,35,0.4)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M47 36 Q60 32 68 24 M45 58 Q60 56 70 48" stroke="rgba(10,90,35,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {spec(34, 30, 10, 7)}
      </>
    ),
  },
  yellow: {
    // Butter lamp — golden bowl with a flame
    light: "#ffe58a",
    dark: "#ee9812",
    outline:
      "M50 34 C62 34 74 40 74 50 C74 62 64 70 58 72 L62 80 C63 84 60 87 56 87 L44 87 C40 87 37 84 38 80 L42 72 C36 70 26 62 26 50 C26 40 38 34 50 34 Z",
    render: (gradId) => (
      <>
        {/* flame */}
        <path d="M50 6 C58 16 60 24 54 30 C51 33 45 32 43 27 C41 21 45 13 50 6 Z" fill="#ff9d2e" />
        <path d="M50 13 C54 19 54 24 51 27 C49 29 46 28 45 25 C44 21 47 17 50 13 Z" fill="#ffe08a" />
        <ellipse cx="50" cy="22" rx="13" ry="12" fill="rgba(255,190,60,0.25)" />
        {/* lamp bowl */}
        <path
          d="M50 34 C62 34 74 40 74 50 C74 62 64 70 58 72 L62 80 C63 84 60 87 56 87 L44 87 C40 87 37 84 38 80 L42 72 C36 70 26 62 26 50 C26 40 38 34 50 34 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(0,0,0,0.16)"
          strokeWidth="1.5"
        />
        <path d="M30 47 Q50 41 70 47" stroke="rgba(140,80,10,0.35)" strokeWidth="2" fill="none" />
        {spec(38, 44, 8, 5, -20)}
      </>
    ),
  },
  purple: {
    // Lotus flower
    light: "#d3a2ff",
    dark: "#7c22d6",
    outline:
      "M50 10 C58 22 60 34 56 44 L70 32 C78 42 78 56 70 66 L84 62 C82 76 70 86 50 88 C30 86 18 76 16 62 L30 66 C22 56 22 42 30 32 L44 44 C40 34 42 22 50 10 Z",
    render: (gradId) => (
      <>
        <path
          d="M50 10 C58 22 60 34 56 44 L70 32 C78 42 78 56 70 66 L84 62 C82 76 70 86 50 88 C30 86 18 76 16 62 L30 66 C22 56 22 42 30 32 L44 44 C40 34 42 22 50 10 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(0,0,0,0.16)"
          strokeWidth="1.5"
        />
        <path d="M50 46 C55 56 55 68 50 78 C45 68 45 56 50 46 Z" fill="rgba(255,255,255,0.35)" />
        <circle cx="50" cy="72" r="5" fill="#ffd76e" />
        {spec(36, 32, 9, 6)}
      </>
    ),
  },
  orange: {
    // Golden temple bell
    light: "#ffc689",
    dark: "#e6640d",
    outline:
      "M50 10 C54 10 56 13 56 16 C68 20 76 32 76 48 L76 62 C76 66 80 68 82 71 C84 75 81 78 77 78 L23 78 C19 78 16 75 18 71 C20 68 24 66 24 62 L24 48 C24 32 32 20 44 16 C44 13 46 10 50 10 Z",
    render: (gradId) => (
      <>
        <path
          d="M50 10 C54 10 56 13 56 16 C68 20 76 32 76 48 L76 62 C76 66 80 68 82 71 C84 75 81 78 77 78 L23 78 C19 78 16 75 18 71 C20 68 24 66 24 62 L24 48 C24 32 32 20 44 16 C44 13 46 10 50 10 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(0,0,0,0.16)"
          strokeWidth="1.5"
        />
        <path d="M26 58 L74 58" stroke="rgba(150,60,5,0.35)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="86" r="6" fill="#b4550c" />
        {spec(37, 32, 9, 7)}
      </>
    ),
  },
};

const ORB_DOTS: { cx: number; cy: number; fill: string }[] = [
  { cx: 32, cy: 56, fill: "#ff5c7a" },
  { cx: 52, cy: 30, fill: "#4ad9d9" },
  { cx: 68, cy: 58, fill: "#4ade80" },
  { cx: 44, cy: 72, fill: "#fbbf24" },
  { cx: 70, cy: 36, fill: "#c084fc" },
];

interface CandyIconProps {
  color: CandyColor | null;
  special: SpecialType | null;
}

export function CandyIcon({ color, special }: CandyIconProps) {
  if (special === "color-bomb") {
    // Thunder Dragon Orb — deep night sphere with swirling cloud trails
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <radialGradient id="dragon-orb" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#4a3f7a" />
            <stop offset="100%" stopColor="#171233" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#dragon-orb)" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        <path
          d="M20 46 Q36 34 52 44 T84 44 M20 60 Q38 52 54 60 T82 62"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {ORB_DOTS.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r="4.5" fill={dot.fill} />
        ))}
        <ellipse cx="35" cy="28" rx="12" ry="8" fill="rgba(255,255,255,0.5)" transform="rotate(-30 35 28)" />
      </svg>
    );
  }

  if (!color) return null;
  const treasure = TREASURES[color];
  const gradId = `treasure-grad-${color}`;
  const stripeId = `treasure-stripe-${color}-${special === "striped-v" ? "v" : "h"}`;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="20%" y1="10%" x2="75%" y2="95%">
          <stop offset="0%" stopColor={treasure.light} />
          <stop offset="100%" stopColor={treasure.dark} />
        </linearGradient>
        {(special === "striped-h" || special === "striped-v") && (
          <pattern
            id={stripeId}
            width={special === "striped-v" ? 16 : 100}
            height={special === "striped-v" ? 100 : 16}
            patternUnits="userSpaceOnUse"
          >
            {special === "striped-v" ? (
              <rect x="4" width="8" height="100" fill="rgba(255,255,255,0.85)" />
            ) : (
              <rect y="4" width="100" height="8" fill="rgba(255,255,255,0.85)" />
            )}
          </pattern>
        )}
      </defs>

      {treasure.render(gradId)}
      {(special === "striped-h" || special === "striped-v") && (
        <path d={treasure.outline} fill={`url(#${stripeId})`} />
      )}
      {special === "wrapped" && (
        <path
          d={treasure.outline}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="4.5"
          strokeDasharray="9 7"
          className="wrapped-dash"
          transform="translate(9 9) scale(0.82)"
        />
      )}
    </svg>
  );
}
