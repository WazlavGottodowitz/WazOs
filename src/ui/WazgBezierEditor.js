// =============================================
// WazgBezierEditor.js - Connected to Morph + De Casteljau
// =============================================

window.WazgBezierEditor = {
  svg: null,
  currentCurve: { cp1x: 0.25, cp1y: 0.1, cp2x: 0.25, cp2y: 1.0 },

  init: function() {
    this.createEditor();
    if (window.WazgLogcat) window.WazgLogcat.log("BEZIER", "Editor connected to Morph + De Casteljau");
  },

  createEditor: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "240");
    this.svg.setAttribute("height", "140");
    this.svg.style.cssText = `
      position: absolute;
      top: 70px;
      right: 15px;
      z-index: 290;
      background: rgba(10,10,10,0.95);
      border: 1px solid #ffaa00;
      border-radius: 8px;
    `;

    workspace.appendChild(this.svg);
    this.draw();
  },

  draw: function() {
    this.svg.innerHTML = '';

    // Grid
    for (let i = 0; i <= 4; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "20"); line.setAttribute("y1", 20 + i*25);
      line.setAttribute("x2", "220"); line.setAttribute("y2", 20 + i*25);
      line.setAttribute("stroke", "#222");
      this.svg.appendChild(line);
    }

    const x1 = 20 + this.currentCurve.cp1x * 200;
    const y1 = 120 - this.currentCurve.cp1y * 90;
    const x2 = 20 + this.currentCurve.cp2x * 200;
    const y2 = 120 - this.currentCurve.cp2y * 90;

    // Curve
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M 20 120 C ${x1} ${y1} ${x2} ${y2} 220 30`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#00ff88");
    path.setAttribute("stroke-width", "3");
    this.svg.appendChild(path);

    // Draggable points
    this.createDraggablePoint(x1, y1, 0);
    this.createDraggablePoint(x2, y2, 1);

    // Update connected systems
    if (window.WazgPathMorph) window.WazgPathMorph.updateCustomCurve(this.currentCurve);
    if (window.WazgDeCasteljauVisualizer) window.WazgDeCasteljauVisualizer.updateCurve(this.currentCurve);
  },

  createDraggablePoint: function(x, y, index) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "7");
    circle.setAttribute("fill", "#ffaa00");
    circle.setAttribute("stroke", "#fff");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "move";

    let isDragging = false;

    circle.onmousedown = (e) => { isDragging = true; e.stopPropagation(); };

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = this.svg.getBoundingClientRect();
      let nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / 200));
      let ny = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / 90));

      if (index === 0) {
        this.currentCurve.cp1x = nx;
        this.currentCurve.cp1y = ny;
      } else {
        this.currentCurve.cp2x = nx;
        this.currentCurve.cp2y = ny;
      }

      this.draw();
    });

    document.addEventListener("mouseup", () => isDragging = false);

    this.svg.appendChild(circle);
  }
};
