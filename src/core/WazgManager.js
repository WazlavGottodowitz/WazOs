window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  pipeline: [],
  
  init: function() {
    const chain = ['isg_001_guard', 'isg_002_rig_processor', 'isg_005_zappel_fx', 'isg_997_WazLogger'];
    this.pipeline = chain.map(name => window[name]).filter(p => p);
    this.pipeline.forEach(p => { if(p.init) p.init(this); });
  },

  dispatch: function(actionType, payload, event) {
    if (event) { event.stopPropagation(); }
    let signal = payload || { x: 100, y: 100 };

    for (let plugin of this.pipeline) {
      if (plugin.process) {
        try {
          const result = plugin.process(actionType, signal, this.state);
          if (result === false) return;
          if (result && typeof result.x !== 'undefined') signal = result;
        } catch (e) {
          if (window.isg_997_WazLogger) window.isg_997_WazLogger.log("Err: " + e.message);
        }
      }
    }

    // State Logic
    if (actionType === 'ADD_NODE') {
      const newNode = { id: Date.now(), x: signal.x, y: signal.y };
      this.state.nodes.push(newNode);
      if (this.state.nodes.length > 1) {
        this.state.connections.push({ from: this.state.nodes[this.state.nodes.length-2].id, to: newNode.id });
      }
    } else if (actionType === 'CLEAR_WORKSPACE') {
      this.state.nodes = []; this.state.connections = [];
    }
    
    if (this.onUpdate) this.onUpdate(this.state);
  }
};
