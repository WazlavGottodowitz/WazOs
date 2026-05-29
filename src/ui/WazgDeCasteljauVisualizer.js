// =============================================
// WazgDeCasteljauVisualizer.js - Live Construction
// =============================================

window.WazgDeCasteljauVisualizer = {
  svg: null,
  points: null,
  t: 0.5,

  init: function() {
    this.createVisualizer();
    if (window.WazgLogcat) window.WazgLogcat.log("VISUAL", "De Casteljau Visualizer loaded");
  },

  createVisualizer: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "260");
    this.svg.setAttribute("height", "160");
    this.svg.style.cssText = `
      position: absolute;
      top: 70px;
      right: 15px;
      z-index: 300;
      background: rgba(10,10,10,0.95);
      border: 1px solid #00ffaa;
      border-radius: 8px;
    `;

    workspace.appendChild(this.svg);
    this.setupDefaultPoints();
    this.draw();
  },

  setupDefaultPoints: function() {
    this.points = [
      { x: 40,  y: 120 },   // P0
      { x: 90,  y: 40 },    // P1 (control)
      { x: 170, y: 40 },    // P2 (control)
      { x: 220, y: 120 }    // P3
    ];
  },

  draw: function() {
    this.svg.innerHTML = '';

    const t = this.t;

    // Layer 1
    const q0 = this.lerp(this.points[0], this.points[1], t);
    const q1 = this.lerp(this.points[1], this.points[2], t);
    const q2 = this.lerp(this.points[2], this.points[3], t);

    // Layer 2
    const r0 = this.lerp(q0, q1, t);
    const r1 = this.lerp(q1, q2, t);

    // Final point
    const final = this.lerp(r0, r1, t);

    // Draw all lines
    this.drawLine(this.points[0], this.points[1], "#555");
    this.drawLine(this.points[1], this.points[2], "#555");
    this.drawLine(this.points[2], this.points[3], "#555");

    this.drawLine(q0, q1, "#ffaa00");
    this.drawLine(q1, q2, "#ffaa00");

    this.drawLine(r0, r1, "#00ff88");

    // Draw points
    this.drawPoint(this.points[0], "#ff6666", "P0");
    this.drawPoint(this.points[1], "#ffaa00", "P1");
    this.drawPoint(this.points[2], "#ffaa00", "P2");
    this.drawPoint(this.points[3], "#ff6666", "P3");

    this.drawPoint(q0, "#ffff66", "Q0");
    this.drawPoint(q1, "#ffff66", "Q1");
    this.drawPoint(q2, "#ffff66", "Q2");

    this.drawPoint(r0, "#88ff88", "R0");
    this.drawPoint(r1, "#88ff88", "R1");

    this.drawPoint(final, "#00ffff", "B(t)");

    // t value
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", "130");
    text.setAttribute("y", "20");
    text.setAttribute("fill", "#00ffff");
    text.setAttribute("font-size", "11");
    text.setAttribute("text-anchor", "middle");
    text.textContent = `t = ${t.toFixed(2)}`;
    this.svg.appendChild(text);
  },

  lerp: function(a, b, t) {
    return {
      x: a.x * (1 - t) + b.x * t,
      y: a.y * (1 - t) + b.y * t
    };
  },

  drawLine: function(a, b, color) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "2");
    this.svg.appendChild(line);
  },

  drawPoint: function(p, color, label) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", p.x);
    circle.setAttribute("cy", p.y);
    circle.setAttribute("r", "5");
    circle.setAttribute("fill", color);
    this.svg.appendChild(circle);

    if (label) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", p.x);
      text.setAttribute("y", p.y - 10);
      text.setAttribute("fill", color);
      text.setAttribute("font-size", "9");
      text.setAttribute("text-anchor", "middle");
      text.textContent = label;
      this.svg.appendChild(text);
    }
  }
};
