window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    
    // ZWINGENDER RENDER-LINK:
    // Wir setzen die Funktion direkt in den Manager. 
    // Wenn der Manager "notify" ruft, wird diese Funktion ausgeführt.
    window.WazgManager.onUpdate = (state) => this.render(state);
    
    console.log("Anatomy: Hook gesetzt.");
  },

  render: function(state) {
    if (!this.canvas) return;
    
    // SVG aufräumen
    this.canvas.innerHTML = '';
    
    // 1. Bones zeichnen
    state.connections.forEach(conn => {
      const n1 = state.nodes.find(n => n.id === conn.from);
      const n2 = state.nodes.find(n => n.id === conn.to);
      if (n1 && n2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", n1.x); line.setAttribute("y1", n1.y);
        line.setAttribute("x2", n2.x); line.setAttribute("y2", n2.y);
        line.setAttribute("stroke", "#00ff00");
        line.setAttribute("stroke-width", "2");
        this.canvas.appendChild(line);
      }
    });

    // 2. Joints zeichnen
    state.nodes.forEach(node => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", 8);
      circle.setAttribute("fill", "#00ff00");
      this.canvas.appendChild(circle);
    });
  }
};
