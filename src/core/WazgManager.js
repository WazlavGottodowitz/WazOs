window.WazgManager = {
  state: { nodes: [], connections: [], draggingId: null },
  pipeline: [], // Deine VST-FX-Kette

  init: function() {
    // Finde alle isg_-Module im System
    const modules = Object.keys(window).filter(k => k.startsWith("isg_"));
    
    // EINSTELLBARE KETTE: Hier definierst du das Routing!
    // Du kannst die Reihenfolge hier jederzeit ändern.
    const chain = ['isg_001_guard', 'isg_002_rig_processor', 'isg_003_mutation_fx'];
    
    this.pipeline = chain.map(name => window[name]).filter(p => p);
    this.pipeline.forEach(p => { if (p.init) p.init(this); });
    
    if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "VST-Signal-Bus initialisiert.");
  },

  dispatch: function(actionType, payload) {
    let signal = payload;

    // SIGNALFLUSS: Das Signal wandert durch die gesamte Kette
    for (let plugin of this.pipeline) {
      if (plugin.process) {
        // Das Plugin erhält das aktuelle Signal und darf es verändern
        const result = plugin.process(actionType, signal, this.state);
        
        // Wenn ein Plugin 'false' zurückgibt -> Signal gemutet (Blockiert)
        if (result === false) return; 
        
        // Wenn ein Plugin neue Daten zurückgibt -> Signal wird transformiert
        if (result !== undefined) signal = result;
      }
    }

    // STATE UPDATE (nachdem alle FX drüber gelaufen sind)
    this.applyState(actionType, signal);
    this.notify();
  },

  applyState: function(type, data) {
    // Hier passiert die eigentliche Änderung im State...
    // (switch-case Logik wie gehabt)
  },

  notify: function() { /* ... */ }
};
