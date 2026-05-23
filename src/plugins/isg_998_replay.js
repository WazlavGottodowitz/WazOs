window.isg_998_replay = {
  replayData: [],
  isPlaying: false,

  process: function(actionType, signal, state) {
    if (this.isPlaying) {
      // Replay überschreibt das Live-Signal durch die historischen Daten
      return this.getNextFrame();
    }
    return signal;
  },

  play: function(data) {
    this.replayData = data;
    this.isPlaying = true;
  }
};
