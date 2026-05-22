window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    if (!this.canvas) {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "SVG-Canvas nicht gefunden!");
      return;
    }
    if (window.WazgLogcat) {
      window.WazgLogcat.log("ANATOMY", "Biomechanik-Engine bereit.");
    }
  },

  drawJoint: function(x, y, label = "Joint") {
    if (!this.canvas) return;

    // Erstelle den Kreis (das Gelenk)
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 15);
    circle.setAttribute("fill", "#111");
    circle.setAttribute("stroke", "#00ff00");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "pointer";

    // Klick-Event für das Gelenk (Feedback ans System)
    circle.onclick = () => {
      if (window.WazgManager) {
        window.WazgManager.triggerAction('SELECT_NODE', { id: label });
      }
    };

    // Erstelle das Label (Text)
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 25);
    text.setAttribute("fill", "#00ff00");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-family", "monospace");
    text.setAttribute("text-anchor", "middle");
    text.textContent = label;

    // Auf die Leinwand werfen
    this.canvas.appendChild(circle);
    this.canvas.appendChild(text);

    if (window.WazgLogcat) {
      window.WazgLogcat.log("ANATOMY", `Knotenpunkt [${label}] bei ${x}/${y} gespawnt.`);
    }
  }
};
