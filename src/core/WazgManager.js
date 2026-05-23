window.WazgManager = {
  // DIE QUELLE DER WAHRHEIT
  state: {
    nodes: [],
    connections: [] // Hier speichern wir, wer mit wem verbunden ist
  },
  
  listeners: [],

  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("SYSTEM", "WazOS Kernel v66.0 (Data-Driven Mode) online.");
    }
  },

  subscribe: function(callback) {
    this.listeners.push(callback);
  },

  dispatch: function(actionType, payload) {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("ACTION", `Dispatching [${actionType}]`);
    }

    switch(actionType) {
      case 'ADD_NODE':
        const newNode = payload;
        
        // AUTO-CONNECT LOGIK: Wenn es schon Knoten gibt, verbinde den neuen mit dem letzten
        if (this.state.nodes.length > 0) {
          const lastNode = this.state.nodes[this.state.nodes.length - 1];
          this.state.connections.push({
            source: lastNode.id,
            target: newNode.id
          });
          if (window.WazgLogcat) window.WazgLogcat.log("KINEMATIK", `Bone generiert: ${lastNode.id} -> ${newNode.id}`);
        }

        this.state.nodes.push(newNode);
        break;

      case 'CLEAR_WORKSPACE':
        this.state.nodes = [];
        this.state.connections = []; // Auch alle Knochen löschen
        break;

      case 'SELECT_NODE':
        if (window.WazgLogcat) window.WazgLogcat.log("INPUT", `Knoten selektiert: ${payload.id}`);
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
