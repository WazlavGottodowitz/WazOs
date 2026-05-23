window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  pipeline: [],
  onUpdate: null,

  init: function() {
    // Definierte FX-Kette
    const chain = ['isg_001_guard', 'isg_002_rig_processor', 'isg_005_zappel_fx'];
    this.pipeline = chain.map(name => window[name]).filter(p => p);
    this.pipeline.forEach(p => { if (p.init) p.init(this); });
    console.log("SYSTEM: VST-Bus aktiv.");
  },

  dispatch: function(actionType, payload) {
    let signal = payload;

    // 1. VST-Pipeline abarbeiten
    for (let plugin of this.pipeline) {
      if (plugin.process) {
        const result = plugin.process(actionType, signal, this.state);
        if (result === false) return; // Mute
        if (result !== undefined) signal = result;
      }
    }

    // 2. State-Mutationen
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

    // 3. Renderer benachrichtigen
    this.notify();
  },

  notify: function() {
    if (typeof this.onUpdate === 'function') {
      this.onUpdate(this.state);
    }
  }
};
