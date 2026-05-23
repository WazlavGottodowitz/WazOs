window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  pipeline: [],
  onUpdate: null,

  init: function() {
    const chain = ['isg_001_guard', 'isg_002_rig_processor', 'isg_005_zappel_fx'];
    this.pipeline = chain.map(name => window[name]).filter(p => p);
    this.pipeline.forEach(p => { if (p.init) p.init(this); });
  },

  dispatch: function(actionType, payload) {
    let signal = payload;

    // Pipeline-Schleife mit NaN-Check
    for (let plugin of this.pipeline) {
      if (plugin.process) {
        let result = plugin.process(actionType, signal, this.state);
        // Falls ein Plugin NaN erzeugt, ignorieren wir die Änderung
        if (result && typeof result.x === 'number' && typeof result.y === 'number') {
            signal = result;
        }
      }
    }

    switch(actionType) {
      case 'ADD_NODE':
        const x = (payload && typeof payload.x === 'number') ? payload.x : 100;
        const y = (payload && typeof payload.y === 'number') ? payload.y : 100;
        const newNode = { id: Date.now(), x, y };
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
        if (n && typeof signal.x === 'number') { n.x = signal.x; n.y = signal.y; }
        break;
    }
    this.notify();
  },

  notify: function() {
    if (this.onUpdate) this.onUpdate(this.state);
  }
};
