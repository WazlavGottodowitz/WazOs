window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  pipeline: [],
  onUpdate: null, // Der direkte Hook für WazgAnatomy

  init: function() {
    // Das Rack: Hier definierst du die Reihenfolge deiner Plugins
    const chain = ['isg_001_guard', 'isg_002_rig_processor', 'isg_005_zappel_fx'];

    this.pipeline = chain
      .map(name => window[name])
      .filter(p => p);

    this.pipeline.forEach(p => { if (p.init) p.init(this); });
    
    if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "VST-Bus Architektur aktiv.");
  },

  dispatch: function(actionType, payload) {
    let signal = payload;

    // VST-Pipeline durchlaufen
    for (let plugin of this.pipeline) {
      if (plugin.process) {
        const result = plugin.process(actionType, signal, this.state);
        if (result === false) return; // Mute
        if (result !== undefined) signal = result; // Modifikation
      }
    }

    // State Update
    this.applyState(actionType, signal);
    this.notify();
  },

  applyState: function(type, data) {
    switch(type) {
      case 'DRAG_MOVE':
        const node = this.state.nodes.find(n => n.id === this.state.draggingId);
        if (node) { node.x = data.x; node.y = data.y; }
        break;
      case 'DRAG_START': this.state.draggingId = data.id; break;
      case 'DRAG_END': this.state.draggingId = null; break;
      case 'ADD_NODE': this.state.nodes.push(data); break;
    }
  },

  notify: function() {
    if (this.onUpdate) this.onUpdate(this.state);
  }
};
