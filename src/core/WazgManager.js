window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  plugins: [],
  listeners: [],

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "Kernel Initialisierung...");
    // Hier könnten wir später dynamisch Dateien aus /src/plugins/ laden
    this.registerPlugin("RigProcessor"); 
  },

  registerPlugin: function(name) {
    if (window["isg_" + name]) {
      this.plugins.push(window["isg_" + name]);
      window["isg_" + name].init(this);
      if (window.WazgLogcat) window.WazgLogcat.log("PLUGIN", `Modul ${name} geladen.`);
    }
  },

  dispatch: function(actionType, payload) {
    // 1. Vor-Verarbeitung durch Plugins (z.B. Rig-Logik, Guard)
    for (let plugin of this.plugins) {
      if (plugin.beforeDispatch) plugin.beforeDispatch(actionType, payload, this.state);
    }

    // 2. State Änderung
    switch(actionType) {
      case 'ADD_NODE':
        this.state.nodes.push(payload);
        break;
      // ... restliche Fälle ...
    }

    this.notify();
  },
  
  // ... notify & co bleiben gleich ...
};
