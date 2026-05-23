// =============================================
// WazgPanZoom.js - Modular SVG Pan & Zoom
// Lightweight & Mobile Friendly
// =============================================

window.WazgPanZoom = {
  instance: null,
  svg: null,

  init: function() {
    this.svg = document.getElementById("waz-svg-canvas");
    if (!this.svg) {
      if (window.WazgLogcat) window.WazgLogcat.log("PANZOOM", "SVG Canvas not found");
      return;
    }

    this.enable();
    
    if (window.WazgLogcat) {
      window.WazgLogcat.log("PANZOOM", "Pan & Zoom module initialized (mobile friendly)");
    }
  },

  enable: function() {
    if (this.instance) return;

    // Simple native + CSS transform based pan/zoom (no heavy library)
    let scale = 1;
    let posX = 0, posY = 0;
    let isDragging = false;
    let startX, startY;

    const container = this.svg.parentElement;

    // Mouse / Touch Pan
    const startDrag = (e) => {
      isDragging = true;
      startX = (e.type === "mousedown" ? e.clientX : e.touches[0].clientX) - posX;
      startY = (e.type === "mousedown" ? e.clientY : e.touches[0].clientY) - posY;
      this.svg.style.cursor = "grabbing";
    };

    const drag = (e) => {
      if (!isDragging) return;
      posX = (e.type === "mousemove" ? e.clientX : e.touches[0].clientX) - startX;
      posY = (e.type === "mousemove" ? e.clientY : e.touches[0].clientY) - startY;
      this.applyTransform();
    };

    const endDrag = () => {
      isDragging = false;
      this.svg.style.cursor = "grab";
    };

    // Zoom with mouse wheel + pinch
    const zoom = (e) => {
      e.preventDefault();
      const delta = e.wheelDelta ? e.wheelDelta / 120 : (e.deltaY ? -e.deltaY / 50 : 0);
      const factor = Math.pow(1.1, delta);
      
      scale = Math.max(0.3, Math.min(scale * factor, 8)); // Limit zoom range
      
      this.applyTransform();
    };

    // Apply CSS transform
    this.applyTransform = function() {
      this.svg.style.transformOrigin = "0 0";
      this.svg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    };

    // Event listeners
    this.svg.addEventListener("mousedown", startDrag);
    this.svg.addEventListener("mousemove", drag);
    this.svg.addEventListener("mouseup", endDrag);
    this.svg.addEventListener("mouseleave", endDrag);

    // Touch support
    this.svg.addEventListener("touchstart", startDrag, { passive: true });
    this.svg.addEventListener("touchmove", drag, { passive: true });
    this.svg.addEventListener("touchend", endDrag);

    // Wheel zoom
    this.svg.addEventListener("wheel", zoom, { passive: false });

    this.svg.style.cursor = "grab";
  },

  reset: function() {
    if (this.svg) {
      this.svg.style.transform = "translate(0px, 0px) scale(1)";
    }
  }
};
