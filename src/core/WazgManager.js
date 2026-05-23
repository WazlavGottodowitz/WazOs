window.WazgManager = {
  state: {
    nodes: [],
    connections: [],
    draggingId: null // NEU: Merkt sich, was gerade gezogen wird
  },
  
  listeners: [],

  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("SYSTEM", "WazOS Kernel v66.0 (Physics Mode) online.");
    }
  },

  subscribe: function(callback) {
    this.listeners.push(callback);
  },

  dispatch: function(actionType, payload) {
    switch(actionType) {
      case 'ADD_NODE':
        const newNode = payload;
        if (this.state.nodes.length > 0) {
          const lastNode = this.state.nodes[this.state.nodes.length - 1];
          this.state.connections.push({ source: lastNode.id, target: newNode.id });
          if (window.WazgLogcat) window.WazgLogcat.log("KINEMATIK", `Bone generiert: ${lastNode.id} -> ${newNode.id}`);
        }
        this.state.nodes.push(newNode);
        break;

      case 'CLEAR_WORKSPACE':
        this.state.nodes = [];
        this.state.connections = [];
        this.state.draggingId = null;
        if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "Workspace gereinigt.");
        break;

      // NEU: Drag & Drop Events
      case 'DRAG_START':
        this.state.draggingId = payload.id;
        break;

      case 'DRAG_MOVE':
        if (this.state.draggingId) {
          // Guard-Abfrage, bevor wir den State ändern!
          if (window.WazgGuard && !window.WazgGuard.isMoveLegal(this.state.draggingId, payload.x, payload.y, this.state)) {
            return; // Guard sagt Nein -> State nicht ändern, Abbruch!
          }

          // Guard sagt Ja -> Koordinaten updaten
          const node = this.state.nodes.find(n => n.id === this.state.draggingId);
          if (node) {
            node.x = payload.x;
            node.y = payload.y;
          }
        } else {
          return; // Wenn nichts gezogen wird, auch kein Notify auslösen (spart Leistung)
        }
        break;

      case 'DRAG_END':
        this.state.draggingId = null;
        break;

      default:
        if (window.WazgLogcat) window.WazgLogcat.log("WARNING", `Unbekannte Aktion: ${actionType}`);
        return; 
    }

    this.notify();
  },

  notify: function() {
    this.listeners.forEach(listener => listener(this.state));
  }
};
