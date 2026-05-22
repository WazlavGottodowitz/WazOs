window.WazgManager = {
  state: {
    isReady: false,
    history: [],
    maxHistory: 10
  },

  init: function() {
    this.state.isReady = true;
    if (window.WazgLogcat) {
      window.WazgLogcat.log("SYSTEM", "WazOS Manager v66.0 Kernel online.");
    }
  },

  // Globale Event-Brücke: Layout ruft dies auf, Manager steuert Anatomy
  triggerAction: function(actionType, payload) {
    if (!this.state.isReady) return;
    
    // History mitschreiben
    this.saveToHistory(actionType);

    if (window.WazgLogcat) {
      window.WazgLogcat.log("MANAGER", `Action empfangen: [${actionType}]`);
    }

    // Aktionen verteilen
    switch(actionType) {
      case 'SPAWN_NODE':
        if (window.WazgAnatomy) {
          window.WazgAnatomy.drawJoint(payload.x, payload.y, payload.label);
        } else {
          window.WazgLogcat.log("ERROR", "Anatomy-Modul offline.");
        }
        break;
      case 'UNDO':
        this.undoLastAction();
        break;
      default:
        window.WazgLogcat.log("WARNING", `Unbekannte Aktion: ${actionType}`);
    }
  },

  saveToHistory: function(action) {
    this.state.history.push(action);
    if (this.state.history.length > this.state.maxHistory) {
      this.state.history.shift(); // Älteste Aktion vergessen (10-Step-Limit)
    }
  },

  undoLastAction: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("MANAGER", "Self-Healing: UNDO ausgelöst (noch nicht implementiert).");
    }
  }
};
