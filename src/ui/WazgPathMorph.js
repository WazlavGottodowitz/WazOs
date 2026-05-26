// =============================================
// WazgPathMorph.js - Cubic Bezier Path Morphing
// =============================================

window.WazgPathMorph = {
  animationFrame: null,
  customCurve: { cp1x: 0.25, cp1y: 0.1, cp2x: 0.25, cp2y: 1.0 },

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("MORPH", "Bezier Morphing ready");
  },

  morph: function(startPath, endPath, duration = 1400, onComplete = null) {
    const svg = document.getElementById("waz-svg-canvas");
    if (!svg) return;

    let path = svg.querySelector("#morph-path");
    if (!path) {
      path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.id = "morph-path";
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#00ff88");
      path.setAttribute("stroke-width", "6");
      svg.appendChild(path);
    }

    const startData = this.parsePath(startPath);
    const endData = this.parsePath(endPath);
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / duration, 1);
      progress = this.applyCustomBezier(progress);

      path.setAttribute("d", this.interpolateBezier(startData, endData, progress));

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else if (onComplete) onComplete();
    };

    cancelAnimationFrame(this.animationFrame);
    animate();
  },

  applyCustomBezier: function(t) {
    const c = this.customCurve;
    return 3*(1-t)*(1-t)*t*c.cp1y + 3*(1-t)*t*t*c.cp2y + t*t*t;
  },

  parsePath: function(d) { /* full parser from previous version */ },
  interpolateBezier: function(startData, endData, t) { /* full interpolator */ },

  stop: function() { cancelAnimationFrame(this.animationFrame); }
};
