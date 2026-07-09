import type { CandyColor, SpecialType } from "@/game-engine/types";

/**
 * Each color is a distinct silhouette (heart, sphere, bean, drop, gem, corn)
 * so candies are tellable apart by shape as well as color.
 */

interface ShapeDef {
  light: string;
  dark: string;
  /** Shape path in a 0 0 100 100 viewBox. */
  path: string;
  /** Specular highlight ellipse. */
  spec: { cx: number; cy: number; rx: number; ry: number; rotate?: number };
}

const SHAPES: Record<CandyColor, ShapeDef> = {
  red: {
    // Heart
    light: "#ff8fa0",
    dark: "#d51b46",
    path: "M50 88 C24 66 9 48 9 32 C9 18 20 9 31 9 C39 9 46 13 50 20 C54 13 61 9 69 9 C80 9 91 18 91 32 C91 48 76 66 50 88 Z",
    spec: { cx: 32, cy: 27, rx: 10, ry: 7, rotate: -24 },
  },
  blue: {
    // Sphere
    light: "#84d6fc",
    dark: "#1a74dd",
    path: "M50 8 A42 42 0 1 1 49.9 8 Z",
    spec: { cx: 35, cy: 30, rx: 12, ry: 8, rotate: -30 },
  },
  green: {
    // Jelly bean
    light: "#9aec9d",
    dark: "#1fa843",
    path: "M22 74 C6 58 10 32 28 20 C42 11 58 14 64 24 C68 31 64 38 58 42 C70 42 82 48 84 60 C86 74 72 88 54 88 C40 88 30 82 22 74 Z",
    spec: { cx: 33, cy: 32, rx: 11, ry: 7, rotate: -32 },
  },
  yellow: {
    // Lemon drop (rounded diamond)
    light: "#ffe58a",
    dark: "#ee9812",
    path: "M50 6 C56 6 60 10 66 18 L86 42 C90 47 90 53 86 58 L66 82 C60 90 56 94 50 94 C44 94 40 90 34 82 L14 58 C10 53 10 47 14 42 L34 18 C40 10 44 6 50 6 Z",
    spec: { cx: 36, cy: 30, rx: 9, ry: 7, rotate: -35 },
  },
  purple: {
    // Faceted gem (hexagon)
    light: "#d3a2ff",
    dark: "#7c22d6",
    path: "M50 5 L86 26 Q90 28 90 33 L90 67 Q90 72 86 74 L50 95 L14 74 Q10 72 10 67 L10 33 Q10 28 14 26 Z",
    spec: { cx: 34, cy: 28, rx: 10, ry: 7, rotate: -28 },
  },
  orange: {
    // Candy corn (rounded triangle)
    light: "#ffc689",
    dark: "#e6640d",
    path: "M50 8 C56 8 60 12 63 18 L88 70 C92 79 88 90 76 90 L24 90 C12 90 8 79 12 70 L37 18 C40 12 44 8 50 8 Z",
    spec: { cx: 40, cy: 30, rx: 8, ry: 7, rotate: -20 },
  },
};

const BOMB_DOTS: { cx: number; cy: number; fill: string }[] = [
  { cx: 30, cy: 58, fill: "#ff5c7a" },
  { cx: 54, cy: 32, fill: "#4aa8ff" },
  { cx: 70, cy: 60, fill: "#4ade80" },
  { cx: 44, cy: 74, fill: "#fbbf24" },
  { cx: 72, cy: 38, fill: "#c084fc" },
  { cx: 34, cy: 40, fill: "#fb923c" },
];

interface CandyIconProps {
  color: CandyColor | null;
  special: SpecialType | null;
}

export function CandyIcon({ color, special }: CandyIconProps) {
  if (special === "color-bomb") {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <radialGradient id="bomb-body" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#6d4048" />
            <stop offset="100%" stopColor="#241014" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#bomb-body)" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
        {BOMB_DOTS.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r="5" fill={dot.fill} />
        ))}
        <ellipse cx="35" cy="28" rx="12" ry="8" fill="rgba(255,255,255,0.55)" transform="rotate(-30 35 28)" />
      </svg>
    );
  }

  if (!color) return null;
  const shape = SHAPES[color];
  const gradId = `candy-grad-${color}`;
  const stripeId = `candy-stripe-${color}-${special === "striped-v" ? "v" : "h"}`;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="20%" y1="10%" x2="75%" y2="95%">
          <stop offset="0%" stopColor={shape.light} />
          <stop offset="100%" stopColor={shape.dark} />
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

      <path d={shape.path} fill={`url(#${gradId})`} stroke="rgba(0,0,0,0.16)" strokeWidth="1.5" />
      {(special === "striped-h" || special === "striped-v") && (
        <path d={shape.path} fill={`url(#${stripeId})`} />
      )}
      {special === "wrapped" && (
        <path
          d={shape.path}
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="4.5"
          strokeDasharray="9 7"
          className="wrapped-dash"
          transform="translate(9 9) scale(0.82)"
        />
      )}
      <ellipse
        cx={shape.spec.cx}
        cy={shape.spec.cy}
        rx={shape.spec.rx}
        ry={shape.spec.ry}
        fill="rgba(255,255,255,0.8)"
        transform={shape.spec.rotate ? `rotate(${shape.spec.rotate} ${shape.spec.cx} ${shape.spec.cy})` : undefined}
      />
    </svg>
  );
}
