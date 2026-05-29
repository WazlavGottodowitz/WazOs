window.WazgManager = {
  state: { nodes: [], connections: [] },
  listeners: [],

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "WazgManager initialized");
  },

  subscribe: function(callback) {
    this.listeners.push(callback);
  },

  dispatch: function(action, payload) {
    if (window.WazgLogcat) window.WazgLogcat.log("MANAGER", action);
  }
};
