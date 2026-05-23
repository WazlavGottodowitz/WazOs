window.isg_005_zappel_fx = {
  intensity: 20, // Die "Zappel-Stärke"

  init: function(manager) { this.manager = manager; },

  process: function(actionType, signal, state) {
    if (actionType === 'DRAG_MOVE') {
      // Der Zappel-Algorithmus: 
      // Erzeugt ein unkontrolliertes Zittern, das mit der Zeit oder 
      // basierend auf der Mausgeschwindigkeit zunimmt.
      const jitterX = (Math.random() - 0.5) * this.intensity;
      const jitterY = (Math.random() - 0.5) * this.intensity;

      return {
        x: signal.x + jitterX,
        y: signal.y + jitterY
      };
    }
    return signal;
  }
};
