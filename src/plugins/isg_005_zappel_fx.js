window.isg_005_zappel_fx = {
  intensity: 30,
  init: function(manager) { this.manager = manager; },
  process: function(actionType, signal, state) {
    if (!signal || typeof signal.x !== 'number') return signal;
    if (actionType === 'DRAG_MOVE' && state.draggingId) {
      return {
        x: signal.x + (Math.random() - 0.5) * this.intensity,
        y: signal.y + (Math.random() - 0.5) * this.intensity
      };
    }
    return signal;
  }
};
