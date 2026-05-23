window.isg_RigProcessor = {
  priority: 2,

  init: function(manager) {
    this.manager = manager;
    if (window.WazgLogcat) window.WazgLogcat.log("PLUGIN", "RigProcessor (FK/IK) geladen.");
  },

  // Hier greifen wir ein, BEVOR der State im Manager geändert wird
  beforeDispatch: function(actionType, payload, state) {
    if (actionType === 'DRAG_MOVE') {
      this.calculateHierarchy(payload, state);
    }
  },

  calculateHierarchy: function(payload, state) {
    // Hier kommt die Logik: Wenn wir Knoten A bewegen, 
    // müssen alle Kinder-Knoten (die via 'connections' dranhängen) 
    // die Differenz der Bewegung mitmachen.
    // (Diese Logik bauen wir hier stetig aus, ohne den Core anzufassen).
  }
};
