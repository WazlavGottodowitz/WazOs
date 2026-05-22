// =============================================
// WazgManager.js - Core Kernel (Data-Driven)
// Single Source of Truth for wazOS v66.0
// =============================================

window.WazgManager = {
  // ==================== STATE ====================
  state: {
    nodes: [],       // Array of { id, x, y, label? }
    connections: [], // Future: bones between nodes
    history: [],     // 10-Step History Buffer
    maxHistory: 10
  },

  // ==================== LISTENERS ====================
  listeners: [],   // Modules that want to react to state changes (e.g. Anatomy)

  // ==================== INIT ====================
  init: function() {
    this.state.nodes = [];
    this.state.connections = [];
    this.state.history = [];

    if (window.WazgLogcat) {
      window.WazgLogcat.log("SYSTEM", "WazgManager v66.0 (Data-Driven Kernel) initialized.");
    }
  },

  // ==================== SUBSCRIBE ====================
  subscribe: function(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
      // Optional: Send current state immediately
      callback(this.state);
    }
  },

  // ==================== DISPATCH (Main Entry Point) ====================
  dispatch: function(actionType, payload = null) {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("MANAGER", `Dispatch → ${actionType}`);
    }

    // 1. Guard Protection
    if (window.WazgGuard) {
      if (!window.WazgGuard.validateAction(actionType, payload)) {
        if (window.WazgLogcat) {
          window.WazgLogcat.log("GUARD", `Action ${actionType} blocked by Anatomy Shield.`);
        }
        return; // Abort - Guard rejected the action
      }
    }

    // 2. Apply State Changes
    let stateChanged = false;

    switch(actionType) {
      case 'ADD_NODE':
        if (payload && payload.x !== undefined && payload.y !== undefined) {
          const newNode = {
            id: payload.id || "NODE_" + Date.now(),
            x: Math.round(payload.x),
            y: Math.round(payload.y)
          };
          this.state.nodes.push(newNode);
          this.saveToHistory({ action: 'ADD_NODE', payload: newNode });
          stateChanged = true;
        }
        break;

      case 'CLEAR_WORKSPACE':
        this.state.nodes = [];
        this.state.connections = [];
        this.saveToHistory({ action: 'CLEAR_WORKSPACE' });
        stateChanged = true;
        break;

      case 'UNDO':
        this.undoLastAction();
        stateChanged = true;
        break;

      default:
        if (window.WazgLogcat) {
          window.WazgLogcat.log("WARNING", `Unknown action type: ${actionType}`);
        }
        return;
    }

    // 3. Notify all listeners if state changed
    if (stateChanged) {
      this.notify();
    }
  },

  // ==================== HISTORY ====================
  saveToHistory: function(entry) {
    this.state.history.push(entry);
    if (this.state.history.length > this.state.maxHistory) {
      this.state.history.shift(); // Keep only last 10 actions
    }
  },

  undoLastAction: function() {
    if (this.state.history.length === 0) {
      if (window.WazgLogcat) window.WazgLogcat.log("MANAGER", "UNDO: History is empty.");
      return;
    }

    const lastAction = this.state.history.pop();

    // Simple undo logic (expandable)
    if (lastAction.action === 'ADD_NODE') {
      // Remove the last added node
      this.state.nodes.pop();
    } else if (lastAction.action === 'CLEAR_WORKSPACE') {
      // For now we just log (complex restore would need snapshots)
      if (window.WazgLogcat) window.WazgLogcat.log("MANAGER", "UNDO CLEAR not fully reversible yet.");
    }

    if (window.WazgLogcat) {
      window.WazgLogcat.log("MANAGER", `UNDO executed: ${lastAction.action}`);
    }
  },

  // ==================== NOTIFY LISTENERS ====================
  notify: function() {
    this.listeners.forEach(callback => {
      if (typeof callback === "function") {
        try {
          callback(this.state);
        } catch (e) {
          console.error("Listener error:", e);
        }
      }
    });
  },

  // ==================== HELPER ====================
  getState: function() {
    return this.state;
  }
};
