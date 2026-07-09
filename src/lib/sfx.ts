/**
 * Synthesized sound effects via Web Audio — no audio assets to load.
 * The AudioContext is created lazily on the first play call, which always
 * happens inside a user gesture (tap/swipe), satisfying autoplay policies.
 */

const MUTE_KEY = "candy-pop-muted";

let ctx: AudioContext | null = null;
let muted: boolean | null = null;

function isMutedInternal(): boolean {
  if (muted === null) {
    muted = typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
  }
  return muted;
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOptions {
  freq: number;
  /** Sweep target frequency by the end of the tone. */
  to?: number;
  duration?: number;
  volume?: number;
  type?: OscillatorType;
  delay?: number;
}

function tone({ freq, to, duration = 0.15, volume = 0.18, type = "sine", delay = 0 }: ToneOptions) {
  if (isMutedInternal()) return;
  const ac = audio();
  if (!ac) return;

  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration);

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  isMuted(): boolean {
    return isMutedInternal();
  },

  toggleMute(): boolean {
    muted = !isMutedInternal();
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    return muted;
  },

  /** Soft tick when a candy is selected. */
  select() {
    tone({ freq: 620, to: 780, duration: 0.07, volume: 0.08, type: "triangle" });
  },

  /** Whoosh for a swap. */
  swap() {
    tone({ freq: 280, to: 560, duration: 0.12, volume: 0.12, type: "triangle" });
  },

  /** Bubbly pop for a clear; pitch climbs with cascade depth. */
  pop(cascade: number) {
    const base = 330 * (1 + cascade * 0.22);
    tone({ freq: base * 1.6, to: base * 0.7, duration: 0.16, volume: 0.2, type: "sine" });
    tone({ freq: base * 2.4, to: base, duration: 0.1, volume: 0.07, type: "triangle" });
  },

  /** Dull thud for an invalid move. */
  invalid() {
    tone({ freq: 140, to: 90, duration: 0.18, volume: 0.14, type: "square" });
  },

  /** Rising charge-up before a special detonates. */
  charge() {
    tone({ freq: 220, to: 880, duration: 0.16, volume: 0.1, type: "sawtooth" });
  },

  /** Laser sweep for a striped candy beam. */
  beam() {
    tone({ freq: 1200, to: 260, duration: 0.22, volume: 0.16, type: "sawtooth" });
    tone({ freq: 2000, to: 500, duration: 0.14, volume: 0.06, type: "sine" });
  },

  /** Deep double boom for a wrapped candy. */
  wrapped() {
    tone({ freq: 120, to: 45, duration: 0.3, volume: 0.22, type: "sine" });
    tone({ freq: 90, to: 40, duration: 0.28, volume: 0.16, type: "sine", delay: 0.12 });
  },

  /** Crackling zap + rumble for the Thunder Dragon Orb. */
  bomb() {
    tone({ freq: 60, to: 28, duration: 0.5, volume: 0.24, type: "sine" });
    tone({ freq: 1600, to: 200, duration: 0.3, volume: 0.1, type: "square" });
    tone({ freq: 900, to: 2400, duration: 0.12, volume: 0.06, type: "sawtooth", delay: 0.05 });
  },

  /** Rising arpeggio on a win. */
  win() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      tone({ freq, duration: 0.22, volume: 0.16, type: "triangle", delay: i * 0.1 });
      tone({ freq: freq * 2, duration: 0.18, volume: 0.05, type: "sine", delay: i * 0.1 });
    });
  },

  /** Sad descending tones on a loss. */
  lose() {
    const notes = [392, 329.63, 261.63]; // G4 E4 C4
    notes.forEach((freq, i) => {
      tone({ freq, to: freq * 0.94, duration: 0.3, volume: 0.14, type: "triangle", delay: i * 0.16 });
    });
  },
};
