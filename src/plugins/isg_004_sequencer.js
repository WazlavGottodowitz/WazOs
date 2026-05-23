window.isg_004_sequencer = {
  activeClips: [], // Deine geladenen Bausteine

  process: function(actionType, signal, state) {
    if (this.activeClips.length > 0) {
      // Sequencer-Logik: Berechne den aktuellen Wert aus allen aktiven Clips
      // und überschreibe das Signal (additiv oder absolut)
      return this.applyClips(signal);
    }
    return signal;
  },

  reverseClip: function(clip) {
    // Reverse-Script: Spiegelt die Zeitachse und berechnet die Kurve neu
    return { ...clip, data: [...clip.data].reverse() };
  }
};
