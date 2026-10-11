/* Board sounds, synthesized with Web Audio (no audio files to download). */
const Sound = (() => {
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One short tone: frequency (Hz), length (s), loudness, start delay (s), wave.
  function tone(freq, len, vol, delay, type) {
    const a = ac();
    if (!a) return;
    const t0 = a.currentTime + (delay || 0);
    const osc = a.createOscillator(), gain = a.createGain();
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t0 + len);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + len + 0.02);
  }

  const sounds = {
    move: () => tone(330, 0.07, 0.25, 0, 'triangle'),
    capture: () => { tone(260, 0.06, 0.28); tone(180, 0.09, 0.22, 0.045); },
    check: () => { tone(660, 0.09, 0.18, 0, 'square'); tone(880, 0.12, 0.14, 0.08, 'square'); },
    end: () => { tone(523, 0.18, 0.18); tone(659, 0.18, 0.16, 0.12); tone(784, 0.3, 0.16, 0.24); },
    notify: () => tone(740, 0.08, 0.12, 0, 'sine'),
    error: () => tone(150, 0.12, 0.2, 0, 'sawtooth')
  };

  return {
    setEnabled(on) { enabled = !!on; },
    // Browsers only allow audio after a user gesture: unlock on first tap.
    unlock() { if (enabled) ac(); },
    play(name) {
      if (!enabled || !sounds[name]) return;
      try { sounds[name](); } catch (e) { /* audio unavailable */ }
    }
  };
})();
