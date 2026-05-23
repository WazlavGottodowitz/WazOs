window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    
    if (!this.canvas) return;

    if (window.WazgManager) {
      window.WazgManager.subscribe((state) => this.render(state));
    }

    // NEU: Globale Listener für das Bewegen und Loslassen auf dem Workspace
    this.setupDragListeners();
  },

  // Wandelt Pixel in echte SVG-Koordinaten um (wichtig für responsive Layouts)
  getMouseCoords: function(evt) {
    let CTM = this.canvas.getScreenCTM();
    let clientX = evt.clientX !== undefined ? evt.clientX : evt.touches[0].clientX;
    let clientY = evt.clientY !== undefined ? evt.clientY : evt.touches[0].clientY;
    return {
      x: (clientX - CTM.e) / CTM.a,
      y: (clientY - CTM.f) / CTM.d
    };
  },

  setupDragListeners: function() {
    // Maus
    this.canvas.addEventListener('mousemove', (e) => {
      e.preventDefault(); // Verhindert Markieren von Text beim Ziehen
      const coords = this.getMouseCoords(e);
      window.WazgManager.dispatch('DRAG_MOVE', coords);
    });
    this.canvas.addEventListener('mouseup', () => window.WazgManager.dispatch('DRAG_END'));
    this.canvas.addEventListener('mouseleave', () => window.WazgManager.dispatch('DRAG_END'));

    // Touch (Mobile)
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const coords = this.getMouseCoords(e);
      window.WazgManager.dispatch('DRAG_MOVE', coords);
    }, { passive: false });
    this.canvas.addEventListener('touchend', () => window.WazgManager.dispatch('DRAG_END'));
    this.canvas.addEventListener('touchcancel', () => window.WazgManager.dispatch('DRAG_END'));
  },

  render: function(state) {
    if (!this.canvas) return;

    while (this.canvas.firstChild) {
      this.canvas.removeChild(this.canvas.firstChild);
    }

    state.connections.forEach(conn => {
      const sourceNode = state.nodes.find(n => n.id === conn.source);
      const targetNode = state.nodes.find(n => n.id === conn.target);
      if (sourceNode && targetNode) {
        this.drawBone(sourceNode.x, sourceNode.y, targetNode.x, targetNode.y);
      }
    });

    state.nodes.forEach(node => {
      this.drawJoint(node.x, node.y, node.id);
    });
  },

  drawBone: function(x1, y1, x2, y2) {
    const svgNS = "http://www.w3.org/2000/svg";
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#ffaa00");
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
    circle.setAttribute("r", 15); // Größerer Touch-Bereich
    circle.setAttribute("fill", "#111");
    circle.setAttribute("stroke", "#00ff00");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "grab";

    // NEU: Drag Start (Greifen)
    const startDrag = (e) => {
      e.stopPropagation(); // Verhindert, dass der Canvas den Klick stiehlt
      window.WazgManager.dispatch('DRAG_START', { id: id });
    };

    circle.addEventListener('mousedown', startDrag);
    circle.addEventListener('touchstart', startDrag, { passive: false });

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 25);
    text.setAttribute("fill", "#00ff00");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-family", "monospace");
    text.setAttribute("text-anchor", "middle");
    text.style.pointerEvents = "none"; // Text darf den Maus-Klick nicht blockieren
    text.textContent = id;

    group.appendChild(circle);
    group.appendChild(text);
    this.canvas.appendChild(group);
  }
};
