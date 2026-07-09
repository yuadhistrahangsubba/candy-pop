/**
 * Ambient Bhutanese scenery — all pure CSS animations on composite-only
 * properties (transform/opacity), so the whole layer costs almost nothing
 * and can never interfere with gameplay animations.
 */

// Traditional prayer-flag order: blue, white, red, green, yellow.
const FLAG_COLORS = ["#3d7edb", "#f3f4f0", "#d84a48", "#3aa856", "#e8b830"];

export function PrayerFlags({ className = "" }: { className?: string }) {
  const flags = Array.from({ length: 10 }, (_, i) => i);
  return (
    <svg
      viewBox="0 0 400 46"
      preserveAspectRatio="none"
      aria-hidden
      className={`pointer-events-none w-full ${className}`}
    >
      {/* the sagging line */}
      <path d="M-4 6 Q200 26 404 6" stroke="rgba(90,60,40,0.5)" strokeWidth="1.6" fill="none" />
      {flags.map((i) => {
        // Position flags along the sag curve (quadratic bezier midpoint math)
        const t = (i + 0.5) / flags.length;
        const x = -4 + t * 408;
        const y = 6 + 2 * t * (1 - t) * (26 - 6) * 2;
        return (
          <g key={i} className="flag-wave" style={{ animationDelay: `${(i % 5) * 0.45}s` }}>
            <path
              d={`M${x - 9} ${y} L${x + 9} ${y} L${x + 9} ${y + 22} L${x} ${y + 17} L${x - 9} ${y + 22} Z`}
              fill={FLAG_COLORS[i % FLAG_COLORS.length]}
              opacity="0.85"
            />
          </g>
        );
      })}
    </svg>
  );
}

export function DriftingClouds() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="cloud-drift absolute top-[8%] h-16 w-40 rounded-full bg-white/50 blur-2xl dark:bg-white/10"
        style={{ animationDuration: "75s" }}
      />
      <div
        className="cloud-drift absolute top-[22%] h-12 w-56 rounded-full bg-white/40 blur-2xl dark:bg-white/8"
        style={{ animationDuration: "110s", animationDelay: "-40s" }}
      />
      <div
        className="cloud-drift absolute top-[60%] h-14 w-44 rounded-full bg-white/35 blur-2xl dark:bg-white/8"
        style={{ animationDuration: "95s", animationDelay: "-70s" }}
      />
    </div>
  );
}

const PETALS = [
  { left: "12%", delay: "0s", duration: "11s", size: "text-lg" },
  { left: "38%", delay: "3.5s", duration: "13s", size: "text-sm" },
  { left: "64%", delay: "7s", duration: "10s", size: "text-base" },
  { left: "85%", delay: "1.8s", duration: "14s", size: "text-sm" },
];

export function FallingPetals() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {PETALS.map((petal, i) => (
        <span
          key={i}
          className={`petal-fall absolute top-0 opacity-0 ${petal.size}`}
          style={{ left: petal.left, animationDelay: petal.delay, animationDuration: petal.duration }}
        >
          🌸
        </span>
      ))}
    </div>
  );
}

/**
 * Per-region atmosphere tint. Levels travel through Bhutan in stages:
 * dawn valleys → frosty highlands → festival gold → dusk over the dzongs.
 */
const ATMOSPHERES = [
  "transparent",
  "radial-gradient(120% 90% at 50% 0%, rgba(255,180,150,0.14), transparent 65%)", // 1-5 dawn
  "radial-gradient(120% 90% at 50% 0%, rgba(120,180,235,0.20), transparent 65%)", // 6-10 frost
  "radial-gradient(120% 90% at 50% 0%, rgba(245,175,55,0.18), transparent 65%)", // 11-15 festival
  "radial-gradient(120% 90% at 50% 0%, rgba(150,95,215,0.20), transparent 65%)", // 16-20 dusk
];

export function LevelAtmosphere({ levelNumber }: { levelNumber: number }) {
  const group = Math.min(Math.ceil(levelNumber / 5), ATMOSPHERES.length - 1);
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: ATMOSPHERES[group] }}
    />
  );
}
