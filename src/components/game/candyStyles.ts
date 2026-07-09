import type { CandyColor } from "@/game-engine/types";

interface CandyStyle {
  /** Glossy sphere: white specular highlight over a light→dark body. */
  gradient: string;
  /** Colored drop shadow so each candy glows in its own hue. */
  shadow: string;
  /** Solid accent for stars/labels tied to this candy. */
  solid: string;
}

const gloss = (light: string, dark: string) =>
  `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.95), rgba(255,255,255,0) 40%), linear-gradient(155deg, ${light}, ${dark})`;

export const CANDY_STYLE: Record<CandyColor, CandyStyle> = {
  red: {
    gradient: gloss("#ff8a9b", "#e0234e"),
    shadow: "0 5px 12px -3px rgba(224,35,78,0.55), inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
    solid: "#e0234e",
  },
  blue: {
    gradient: gloss("#7dd2fb", "#1f7fe8"),
    shadow: "0 5px 12px -3px rgba(31,127,232,0.55), inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
    solid: "#1f7fe8",
  },
  green: {
    gradient: gloss("#93e996", "#28b44b"),
    shadow: "0 5px 12px -3px rgba(40,180,75,0.55), inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
    solid: "#28b44b",
  },
  yellow: {
    gradient: gloss("#ffe27d", "#f2a01c"),
    shadow: "0 5px 12px -3px rgba(242,160,28,0.55), inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
    solid: "#f2a01c",
  },
  purple: {
    gradient: gloss("#cf9bff", "#8a2ee0"),
    shadow: "0 5px 12px -3px rgba(138,46,224,0.55), inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
    solid: "#8a2ee0",
  },
  orange: {
    gradient: gloss("#ffbe80", "#ef7113"),
    shadow: "0 5px 12px -3px rgba(239,113,19,0.55), inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 2px 3px rgba(255,255,255,0.4)",
    solid: "#ef7113",
  },
};

/** Chocolate sphere sprinkled with every candy color. */
export const COLOR_BOMB_GRADIENT = [
  "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.7), rgba(255,255,255,0) 32%)",
  "radial-gradient(circle at 24% 60%, #e0234e 5%, transparent 6.5%)",
  "radial-gradient(circle at 55% 30%, #1f7fe8 5%, transparent 6.5%)",
  "radial-gradient(circle at 72% 62%, #28b44b 5%, transparent 6.5%)",
  "radial-gradient(circle at 42% 78%, #f2a01c 5%, transparent 6.5%)",
  "radial-gradient(circle at 78% 34%, #cf9bff 5%, transparent 6.5%)",
  "linear-gradient(155deg, #5b3138, #2c1418)",
].join(", ");
