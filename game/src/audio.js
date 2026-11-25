// Ember Kitchen — tiny WebAudio bleeps: chop thunks, wok sizzle, serve chime.
// Everything is synthesized; no audio files ship. Silent until the first
// interaction (browsers block audio before a gesture) and skipped in shot mode.

export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx || muted) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, seconds, type = 'sine', gain = 0.12, when = 0) {
    const ac = ensure();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const amp = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(gain, ac.currentTime + when);
      amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + when + seconds);
      osc.connect(amp).connect(ac.destination);
      osc.start(ac.currentTime + when);
      osc.stop(ac.currentTime + when + seconds + 0.02);
    } catch {
      // Audio is decoration; never break the game.
    }
  }

  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    chop() { tone(140, 0.08, 'square', 0.08); },
    pickup() { tone(520, 0.07, 'sine', 0.08); },
    wokIn() { tone(220, 0.15, 'sawtooth', 0.05); tone(880, 0.2, 'sine', 0.05, 0.05); },
    done() { tone(660, 0.09, 'sine', 0.1); tone(990, 0.12, 'sine', 0.1, 0.09); },
    serve() { tone(523, 0.1, 'sine', 0.1); tone(659, 0.1, 'sine', 0.1, 0.09); tone(784, 0.16, 'sine', 0.1, 0.18); },
    fail() { tone(180, 0.18, 'sawtooth', 0.07); },
    tick() { tone(980, 0.05, 'sine', 0.05); },
  };
}
