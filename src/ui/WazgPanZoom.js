window.WazgPanZoom = {
  svg: null,
  scale: 1,
  posX: 0,
  posY: 0,
  isDragging: false,

  init: function() {
    this.svg = document.getElementById("waz-svg-canvas");
    if (!this.svg) return;
    this.enable();
    if (window.WazgLogcat) window.WazgLogcat.log("PANZOOM", "Pan & Zoom enabled");
  },

  enable: function() {
    const startDrag = (e) => {
      this.isDragging = true;
      this.startX = (e.type === "mousedown" ? e.clientX : e.touches[0].clientX) - this.posX;
      this.startY = (e.type === "mousedown" ? e.clientY : e.touches[0].clientY) - this.posY;
    };

    const drag = (e) => {
      if (!this.isDragging) return;
      this.posX = (e.type === "mousemove" ? e.clientX : e.touches[0].clientX) - this.startX;
      this.posY = (e.type === "mousemove" ? e.clientY : e.touches[0].clientY) - this.startY;
      this.applyTransform();
    };

    const endDrag = () => this.isDragging = false;

    this.svg.addEventListener("mousedown", startDrag);
    this.svg.addEventListener("mousemove", drag);
    this.svg.addEventListener("mouseup", endDrag);
    this.svg.addEventListener("mouseleave", endDrag);

    this.svg.addEventListener("touchstart", startDrag, { passive: true });
    this.svg.addEventListener("touchmove", drag, { passive: true });
    this.svg.addEventListener("touchend", endDrag);

    this.svg.style.cursor = "grab";
  },

  applyTransform: function() {
    this.svg.style.transformOrigin = "0 0";
    this.svg.style.transform = `translate(${this.posX}px, ${this.posY}px) scale(${this.scale})`;
  }
};
