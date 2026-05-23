window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  pipeline: [],
  onUpdate: null,

  init: function() {
    // Logger muss hier in der Kette stehen
    const chain = ['isg_001_guard', 'isg_002_rig_processor', 'isg_005_zappel_fx', 'isg_997_WazLogger'];
    
    this.pipeline = chain.map(name => window[name]).filter(p => p);
    
    // Initialisierung der Plugins
    this.pipeline.forEach(p => { 
        if (p.init) p.init(this); 
    });
    
    console.log("SYSTEM: VST-Bus aktiv.");
  },

  dispatch: function(actionType, payload) {
    let signal = payload || { x: 100, y: 100 };

    // Plugin-Pipeline durchlaufen
    for (let plugin of this.pipeline) {
      if (plugin.process) {
        try {
          const result = plugin.process(actionType, signal, this.state);
          if (result === false) return;
          if (result && typeof result.x === 'number') signal = result;
        } catch (e) { 
          // Hier greift jetzt dein Logger, falls er geladen wurde!
          if (window.isg_997_WazLogger) {
              window.isg_997_WazLogger.log("Plugin Error: " + e.message);
          }
          console.error("Plugin Error:", e); 
        }
      }
    }

    // State Updates
    switch(actionType) {
      case 'ADD_NODE':
        const newNode = { id: Date.now(), x: signal.x, y: signal.y };
        this.state.nodes.push(newNode);
        if (this.state.nodes.length > 1) {
          const prev = this.state.nodes[this.state.nodes.length - 2];
          this.state.connections.push({ from: prev.id, to: newNode.id });
        }
        break;
      case 'CLEAR_WORKSPACE':
        this.state.nodes = [];
        this.state.connections = [];
        break;
      case 'DRAG_MOVE':
        const n = this.state.nodes.find(n => n.id === this.state.draggingId);
        if (n) { n.x = signal.x; n.y = signal.y; }
        break;
      case 'DRAG_START': this.state.draggingId = signal.id; break;
      case 'DRAG_END': this.state.draggingId = null; break;
    }
    
    if (this.onUpdate) this.onUpdate(this.state);
  }
};
