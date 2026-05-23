window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    
    if (!this.canvas) {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "SVG-Canvas nicht gefunden!");
      return;
    }

    if (window.WazgManager) {
      window.WazgManager.subscribe((state) => this.render(state));
      if (window.WazgLogcat) window.WazgLogcat.log("ANATOMY", "Biomechanik-Engine an Manager gekoppelt.");
    }
  },

  render: function(state) {
    if (!this.canvas) return;

    // 1. RADIKAL: Alles löschen (Firefox-sicher)
    while (this.canvas.firstChild) {
      this.canvas.removeChild(this.canvas.firstChild);
    }

    // 2. KNOCHEN ZEICHNEN (Zuerst, damit sie unter den Gelenken liegen)
    state.connections.forEach(conn => {
      // Finde die X/Y-Koordinaten der beiden verbundenen Knoten
      const sourceNode = state.nodes.find(n => n.id === conn.source);
      const targetNode = state.nodes.find(n => n.id === conn.target);
      
      if (sourceNode && targetNode) {
        this.drawBone(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
      }
    });

    // 3. GELENKE ZEICHNEN
    state.nodes.forEach(node => {
      this.drawJoint(node.x, node.y, node.id);
    });
  },

  // NEU: Die Funktion, um einen Knochen (Linie) zu zeichnen
  drawBone: function(x1, y1, x2, y2) {
    const svgNS = "http://www.w3.org/2000/svg";
    const line = document.createElementNS(svgNS, "line");
    
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#ffaa00"); // Schickes Biomechanik-Orange
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-linecap", "round");
    
    this.canvas.appendChild(line);
  },

  drawJoint: function(x, y, id) {
    const svgNS = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNS, "g");

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 15);
    circle.setAttribute("fill", "#111");
    circle.setAttribute("stroke", "#00ff00");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "pointer";

    circle.onclick = () => {
      if (window.WazgManager) {
        window.WazgManager.dispatch('SELECT_NODE', { id: id });
      }
    };

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 25);
    text.setAttribute("fill", "#00ff00");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-family", "monospace");
    text.setAttribute("text-anchor", "middle");
    text.textContent = id;

    group.appendChild(circle);
    group.appendChild(text);
    this.canvas.appendChild(group);
  }
};
