window.isg_003_mutation_fx = {
  init: function(manager) { this.manager = manager; },

  process: function(actionType, signal, state) {
    if (actionType === 'DRAG_MOVE') {
      // Mutation: Wir "zittern" die Maus-Koordinate leicht, 
      // bevor sie beim Rig ankommt (abgefahrener Scheiß!)
      return {
        x: signal.x + (Math.random() * 10 - 5),
        y: signal.y + (Math.random() * 10 - 5)
      };
    }
    return signal; // Signal unverändert durchlassen
  }
};
