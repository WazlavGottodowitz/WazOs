window.isg_999_logger = {
  history: [],
  isRecording: false,

  init: function(manager) { this.manager = manager; },

  process: function(actionType, signal, state) {
    if (this.isRecording && actionType === 'DRAG_MOVE') {
      this.history.push({
        timestamp: Date.now(),
        payload: { ...signal }
      });
    }
    return signal; // Signal nicht beeinflussen, nur loggen
  },

  start: function() { this.history = []; this.isRecording = true; },
  stop: function() { this.isRecording = false; return this.history; }
};
