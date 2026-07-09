/**
 * Vibration feedback via the Vibration API. Supported on Android browsers;
 * iOS Safari silently ignores it, so every call is a safe no-op there.
 */

function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if called outside a user gesture — never fatal.
  }
}

export const haptics = {
  /** A match clearing; deeper cascades tap harder. */
  pop(cascade: number) {
    vibrate(Math.min(8 + cascade * 6, 30));
  },

  /** Invalid move — short double buzz reads as "no". */
  invalid() {
    vibrate([12, 40, 12]);
  },

  /** Level won — a little celebratory riff. */
  win() {
    vibrate([15, 60, 15, 60, 35]);
  },

  /** Level lost — one dull thud. */
  lose() {
    vibrate(45);
  },
};
