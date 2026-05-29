// =============================================
// WazgPathMorph.js - Full Cubic Bezier Support
// =============================================

window.WazgPathMorph = {
  animationFrame: null,
  currentEasing: "ease-out",

  // Predefined Cubic Bezier Easing Functions
  easings: {
    "linear":      t => t,
    "ease-in":     t => t * t,
    "ease-out":    t => 1 - Math.pow(1 - t, 3),
    "ease-in-out": t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
    
    // Custom Cubic Bezier
    "custom": (t, cp1x = 0.25, cp1y = 0.1, cp2x = 0.25, cp2y = 1) => {
      // Approximate cubic bezier using de Casteljau algorithm
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;
      
      return 3 * uu * t * cp1y + 3 * u * tt * cp2y + ttt;
    }
  },

  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("MORPH", "Cubic Bézier Path Morphing Engine ready");
    }
  },

  // Main morph function
  morph: function(startPath, endPath, duration = 1400, easingName = "ease-out", onComplete = null) {
    const svg = document.getElementById("waz-svg-canvas");
    if (!svg) return;

    let pathEl = svg.querySelector("#morph-path");
    if (!pathEl) {
      pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.id = "morph-path";
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("stroke", "#00ff88");
      pathEl.setAttribute("stroke-width", "6");
      pathEl.setAttribute("stroke-linecap", "round");
      pathEl.setAttribute("stroke-linejoin", "round");
      svg.appendChild(pathEl);
    }

    const startData = this.parsePath(startPath);
    const endData = this.parsePath(endPath);
    const startTime = Date.now();
    const easingFn = this.easings[easingName] || this.easings["ease-out"];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / duration, 1);
      progress = easingFn(progress);

      const morphed = this.interpolateBezier(startData, endData, progress);
      pathEl.setAttribute("d", morphed);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    cancelAnimationFrame(this.animationFrame);
    animate();
  },

  // Parse SVG path into structured points
  parsePath: function(d) {
    const commands = d.match(/[MLCQZ][^MLCQZ]*/gi) || [];
    const points = [];
    let isClosed = false;

    commands.forEach(cmd => {
      const type = cmd[0].toUpperCase();
      const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

      if (type === 'M' || type === 'L') {
        points.push({ type: 'L', x: nums[0], y: nums[1] });
      } else if (type === 'C' && nums.length >= 6) {
        points.push({
          type: 'C',
          x: nums[4],
          y: nums[5],
          cp1x: nums[0],
          cp1y: nums[1],
          cp2x: nums[2],
          cp2y: nums[3]
        });
      } else if (type === 'Z') {
        isClosed = true;
      }
    });

    return { points, isClosed };
  },

  // Cubic Bezier interpolation between two paths
  interpolateBezier: function(startData, endData, t) {
    const start = startData.points;
    const end = endData.points;
    const result = [];
    const len = Math.min(start.length, end.length);

    for (let i = 0; i < len; i++) {
      const a = start[i];
      const b = end[i] || a;

      if (a.type === 'L' || b.type === 'L') {
        const x = a.x * (1 - t) + b.x * t;
        const y = a.y * (1 - t) + b.y * t;
        result.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
      } else {
        // Full Cubic Bezier interpolation
        const x = a.x * (1 - t) + b.x * t;
        const y = a.y * (1 - t) + b.y * t;
        const cp1x = a.cp1x * (1 - t) + b.cp1x * t;
        const cp1y = a.cp1y * (1 - t) + b.cp1y * t;
        const cp2x = a.cp2x * (1 - t) + b.cp2x * t;
        const cp2y = a.cp2y * (1 - t) + b.cp2y * t;

        result.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)} ${cp2x.toFixed(2)} ${cp2y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
    }

    if (startData.isClosed || endData.isClosed) result.push('Z');

    return result.join(' ');
  },

  stop: function() {
    cancelAnimationFrame(this.animationFrame);
  }
};
