// =============================================
// WazgDeCasteljau.js - Precise Cubic Bezier Algorithm
// =============================================

window.WazgDeCasteljau = {
  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("BEZIER", "De Casteljau Algorithm Engine loaded");
    }
  },

  // Evaluate cubic Bezier at parameter t using De Casteljau
  evaluate: function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t) {
    // Layer 1
    const q0x = (1-t)*p0x + t*p1x;
    const q0y = (1-t)*p0y + t*p1y;
    const q1x = (1-t)*p1x + t*p2x;
    const q1y = (1-t)*p1y + t*p2y;
    const q2x = (1-t)*p2x + t*p3x;
    const q2y = (1-t)*p2y + t*p3y;

    // Layer 2
    const r0x = (1-t)*q0x + t*q1x;
    const r0y = (1-t)*q0y + t*q1y;
    const r1x = (1-t)*q1x + t*q2x;
    const r1y = (1-t)*q1y + t*q2y;

    // Final point
    const x = (1-t)*r0x + t*r1x;
    const y = (1-t)*r0y + t*r1y;

    return { x, y };
  },

  // Generate smooth path using De Casteljau (for morphing or drawing)
  generatePath: function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, segments = 40) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = this.evaluate(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y, t);
      points.push(point);
    }
    return points;
  },

  // Convert points to SVG path string
  pointsToPath: function(points) {
    if (points.length === 0) return "";
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }
    return d;
  }
};
