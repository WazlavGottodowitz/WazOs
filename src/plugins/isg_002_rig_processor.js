window.isg_002_rig_processor = {
  init: function(manager) { this.manager = manager; },

  process: function(actionType, signal, state) {
    // Hier könnte man später IK-Berechnungen einbauen
    // Aktuell: Signal durchreichen
    return signal;
  }
};
