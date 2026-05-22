// =============================================
// WazgAnatomy.js - Biomechanical Renderer
// Data-Driven SVG Engine for wazOS v66.0
// =============================================

window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    
    if (!this.canvas) {
      if (window.WazgLogcat) {
        window.WazgLogcat.log("ERROR", "SVG Canvas not found!");
      }
      return;
    }

    // Subscribe to state changes from WazgManager
    if (window.WazgManager) {
      window.WazgManager.subscribe((state) => this.render(state));
      if (window.WazgLogcat) {
        window.WazgLogcat.log("ANATOMY", "Biomechanical Renderer connected to Manager.");
      }
    } else {
      if (window.WazgLogcat) {
        window.WazgLogcat.log("ERROR", "WazgManager not available for Anatomy.");
      }
    }
  },

  // Full re-render on every state change (clean, no patchworking)
  render: function(state) {
    if (!this.canvas) return;

    // Clear everything first
    this.canvas.innerHTML = '';

    // Draw connections first (bones)
    if (state.connections && state.connections.length > 0) {
      state.connections.forEach(conn => this.drawConnection(conn));
    }

    // Draw nodes (joints)
    if (state.nodes && state.nodes.length > 0) {
      state.nodes.forEach(node => this.drawJoint(node));
    }

    if (window.WazgLogcat) {
      window.WazgLogcat.log("ANATOMY", `Rendered ${state.nodes.length} joints`);
    }
  },

  drawJoint: function(node) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Joint circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", 16);
    circle.setAttribute("fill", "#111111");
    circle.setAttribute("stroke", "#00ff88");
    circle.setAttribute("stroke-width", "3");
    circle.style.cursor = "pointer";

    // Click handler on joint
    circle.onclick = () => {
      if (window.WazgLogcat) {
        window.WazgLogcat.log("ANATOMY", `Joint selected: ${node.id}`);
      }
      // Future: Select logic / drag support
    };

    // Label text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", node.x);
    text.setAttribute("y", node.y - 28);
    text.setAttribute("fill", "#00ff88");
    text.setAttribute("font-size", "11px");
    text.setAttribute("font-family", "Courier New, monospace");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("pointer-events", "none");
    text.textContent = node.id;

    group.appendChild(circle);
    group.appendChild(text);
    this.canvas.appendChild(group);
  },

  // Placeholder for future bone connections
  drawConnection: function(connection) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", connection.fromX);
    line.setAttribute("y1", connection.fromY);
    line.setAttribute("x2", connection.toX);
    line.setAttribute("y2", connection.toY);
    line.setAttribute("stroke", "#00aa66");
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-opacity", "0.8");
    
    this.canvas.appendChild(line);
  }
};
