// =============================================
// WazgBezierEditor.js - Connected to Morph System
// =============================================

window.WazgBezierEditor = {
  svg: null,
  currentCurve: { cp1x: 0.25, cp1y: 0.1, cp2x: 0.25, cp2y: 1.0 },

  init: function() {
    this.createEditor();
    if (window.WazgLogcat) window.WazgLogcat.log("BEZIER", "Editor connected to Morph System");
  },

  createEditor: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "220");
    this.svg.setAttribute("height", "120");
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

    // Grid + Curve (same as before)
    // ... (grid and curve drawing code)

    // Control points with live update
    this.createDraggablePoint(20 + this.currentCurve.cp1x * 180, 100 - this.currentCurve.cp1y * 80, 0);
    this.createDraggablePoint(20 + this.currentCurve.cp2x * 180, 100 - this.currentCurve.cp2y * 80, 1);
  },

  createDraggablePoint: function(x, y, index) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "7");
    circle.setAttribute("fill", "#ffaa00");
    circle.setAttribute("stroke", "#ffffff");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "move";

    let isDragging = false;

    circle.onmousedown = (e) => { isDragging = true; e.stopPropagation(); };

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const rect = this.svg.getBoundingClientRect();
      let nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / 180));
      let ny = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / 80));

      if (index === 0) {
        this.currentCurve.cp1x = nx;
        this.currentCurve.cp1y = ny;
      } else {
        this.currentCurve.cp2x = nx;
        this.currentCurve.cp2y = ny;
      }

      this.draw();

      // Live update to morph system
      if (window.WazgPathMorph) {
        window.WazgPathMorph.updateCustomCurve(this.currentCurve);
      }
    });

    document.addEventListener("mouseup", () => isDragging = false);

    this.svg.appendChild(circle);
  }
};
