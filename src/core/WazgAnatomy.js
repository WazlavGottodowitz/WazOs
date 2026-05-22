window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    
    if (window.WazgManager) {
      // Beim Manager anmelden! Sobald sich was ändert, render() aufrufen.
      window.WazgManager.subscribe((state) => this.render(state));
      if (window.WazgLogcat) window.WazgLogcat.log("ANATOMY", "Biomechanik-Engine an Manager gekoppelt.");
    }
  },

  render: function(state) {
    if (!this.canvas) return;

    // 1. RADIKAL: Alles löschen. Kein Patchworking auf dem Canvas.
    this.canvas.innerHTML = '';

    // 2. Alle Knotenpunkte aus dem State zeichnen
    state.nodes.forEach(node => {
      this.drawJoint(node.x, node.y, node.id);
    });
  },

  drawJoint: function(x, y, id) {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 15);
    circle.setAttribute("fill", "#111");
    circle.setAttribute("stroke", "#00ff00");
    circle.setAttribute("stroke-width", "2");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 25);
    text.setAttribute("fill", "#00ff00");
    text.setAttribute("font-size", "10px");
    text.setAttribute("text-anchor", "middle");
    text.textContent = id;

    group.appendChild(circle);
    group.appendChild(text);
    this.canvas.appendChild(group);
  }
};
