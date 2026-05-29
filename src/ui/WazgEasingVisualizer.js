// =============================================
// WazgEasingVisualizer.js - Live Easing Curve Display
// =============================================

window.WazgEasingVisualizer = {
  canvas: null,
  currentEasing: "ease-out",

  init: function() {
    this.createVisualizer();
    if (window.WazgLogcat) {
      window.WazgLogcat.log("VISUAL", "Easing Curve Visualizer initialized");
    }
  },

  createVisualizer: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    this.canvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.canvas.setAttribute("width", "180");
    this.canvas.setAttribute("height", "80");
    this.canvas.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 280;
      background: rgba(10,10,10,0.85);
      border: 1px solid #ffaa00;
      border-radius: 6px;
    `;

    workspace.appendChild(this.canvas);
    this.drawCurve("ease-out");
  },

  drawCurve: function(easingName) {
    this.currentEasing = easingName;
    const svg = this.canvas;
    svg.innerHTML = '';

    // Background grid
    for (let i = 0; i <= 4; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "10");
      line.setAttribute("y1", 10 + i * 15);
      line.setAttribute("x2", "170");
      line.setAttribute("y2", 10 + i * 15);
      line.setAttribute("stroke", "#222");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);
    }

    // Easing curve
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d = "M 20 70";

    for (let x = 0; x <= 140; x += 4) {
      const t = x / 140;
      let y = 0;

      switch(easingName) {
        case "linear":      y = t; break;
        case "ease-in":     y = t * t; break;
        case "ease-out":    y = 1 - Math.pow(1 - t, 3); break;
        case "ease-in-out": y = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; break;
        case "ease-out-back":
          const c1 = 1.70158;
          const c3 = c1 + 1;
          y = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
          break;
      }

      const px = 20 + x;
      const py = 70 - (y * 55);
      d += ` L ${px} ${py}`;
    }

    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#00ff88");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);

    // Label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "85");
    text.setAttribute("y", "20");
    text.setAttribute("fill", "#ffaa00");
    text.setAttribute("font-size", "10");
    text.setAttribute("text-anchor", "middle");
    text.textContent = easingName.toUpperCase();
    svg.appendChild(text);
  }
};
