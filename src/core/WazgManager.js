window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  plugins: [],
  listeners: [],

  init: function() {
    // 1. Plugins finden
    Object.keys(window).forEach(key => {
      if (key.startsWith("isg_")) {
        this.plugins.push(window[key]);
      }
    });

    // 2. Plugins nach Priorität sortieren (Guard = 1, Rig = 2, etc.)
    this.plugins.sort((a, b) => (a.priority || 99) - (b.priority || 99));

    // 3. Init aller Plugins
    this.plugins.forEach(p => { if (p.init) p.init(this); });
    
    if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "Kernel & Plugins synchronisiert.");
  },

  subscribe: function(callback) {
    this.listeners.push(callback);
  },

  dispatch: function(actionType, payload) {
    // Pipeline durchlaufen
    for (let plugin of this.plugins) {
      if (plugin.beforeDispatch) {
        // Plugin kann Bewegung blockieren, wenn es 'false' zurückgibt (z.B. Guard)
        const allowed = plugin.beforeDispatch(actionType, payload, this.state);
        if (allowed === false) return; 
      }
    }

    // State Update
    switch(actionType) {
      case 'ADD_NODE':
        this.state.nodes.push(payload);
        break;
      case 'DRAG_MOVE':
        const node = this.state.nodes.find(n => n.id === this.state.draggingId);
        if (node) { node.x = payload.x; node.y = payload.y; }
        break;
      case 'DRAG_START':
        this.state.draggingId = payload.id;
        break;
      case 'DRAG_END':
        this.state.draggingId = null;
        break;
      case 'CLEAR_WORKSPACE':
        this.state.nodes = [];
        this.state.connections = [];
        break;
    }
    this.notify();
  },

  notify: function() {
    this.listeners.forEach(l => l(this.state));
  }
};
