// =============================================
// WazgGuard.js - Anatomy Shield & Validation
// =============================================

window.WazgGuard = {
  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("GUARD", "Anatomy Shield (WazgGuard) activated.");
    }
  },

  // Returns true if action is allowed, false if blocked
  validateAction: function(actionType, payload) {
    if (!payload) return true;

    switch (actionType) {
      case 'ADD_NODE':
        const x = payload.x || 0;
        const y = payload.y || 0;

        // Workspace boundaries (with padding)
        if (x < 40 || x > 960 || y < 40 || y > 560) {
          if (window.WazgLogcat) {
            window.WazgLogcat.log("GUARD", `BLOCKED: Node ${payload.id || '?'} out of bounds (${x},${y})`);
          }
          return false;
        }

        // Prevent nodes from spawning too close to each other
        if (window.WazgManager && window.WazgManager.state.nodes) {
          const tooClose = window.WazgManager.state.nodes.some(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 48; // Minimum safe distance
          });

          if (tooClose) {
            if (window.WazgLogcat) {
              window.WazgLogcat.log("GUARD", `BLOCKED: Node ${payload.id || '?'} too close to existing joint`);
            }
            return false;
          }
        }
        break;

      case 'CLEAR_WORKSPACE':
        // Always allow clear for now
        return true;

      default:
        return true;
    }

    return true;
  }
};
