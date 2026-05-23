window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    if (!this.canvas) return;

    // Der direkte Draht zum VST-Manager
    window.WazgManager.onUpdate = (state) => this.render(state);

    this.setupDragListeners();
  },

  setupDragListeners: function() {
    this.canvas.addEventListener('mousemove', (e) => {
      const coords = this.getMouseCoords(e);
      window.WazgManager.dispatch('DRAG_MOVE', coords);
    });
    // ... restliche Event-Listener (mousedown, mouseup, etc.) ...
  },

  render: function(state) {
    // Bestehende Render-Logik (SVG-Knoten zeichnen)
    while (this.canvas.firstChild) this.canvas.removeChild(this.canvas.firstChild);
    
    state.nodes.forEach(node => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", 15);
      circle.setAttribute("fill", "#00ff00");
      this.canvas.appendChild(circle);
    });
  },

  getMouseCoords: function(evt) {
    let CTM = this.canvas.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }
};
