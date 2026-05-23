window.WazgAnatomy = {
  canvas: document.getElementById("waz-svg-canvas"),
  init: function() {
    window.WazgManager.onUpdate = (state) => this.render(state);
  },
  render: function(state) {
    if (!this.canvas) this.canvas = document.getElementById("waz-svg-canvas");
    this.canvas.innerHTML = '';
    
    state.connections.forEach(conn => {
      const n1 = state.nodes.find(n => n.id === conn.from);
      const n2 = state.nodes.find(n => n.id === conn.to);
      if (n1 && n2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", n1.x); line.setAttribute("y1", n1.y);
        line.setAttribute("x2", n2.x); line.setAttribute("y2", n2.y);
        line.setAttribute("stroke", "#00ff00");
        this.canvas.appendChild(line);
      }
    });

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
