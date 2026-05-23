window.WazgAnatomy = {
  canvas: null,

  init: function() {
    this.canvas = document.getElementById("waz-svg-canvas");
    
    if (!this.canvas) {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "SVG-Canvas nicht gefunden!");
      return;
    }

    if (window.WazgManager) {
      // Beim Manager anmelden! Sobald sich der State ändert, wird render() automatisch aufgerufen.
      window.WazgManager.subscribe((state) => this.render(state));
      if (window.WazgLogcat) window.WazgLogcat.log("ANATOMY", "Biomechanik-Engine an Manager gekoppelt.");
    } else {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "Manager nicht gefunden! Anatomy läuft ins Leere.");
    }
  },

  render: function(state) {
    if (!this.canvas) return;

    // 1. RADIKAL: Alles löschen - Firefox-sichere Methode
    // Bricht die XML-Struktur des SVGs im Gegensatz zu .innerHTML = '' nicht auf.
    while (this.canvas.firstChild) {
      this.canvas.removeChild(this.canvas.firstChild);
    }

    // 2. (Optional für später) Hier würden wir zuerst die Knochen/Verbindungen zeichnen
    // state.connections.forEach(conn => this.drawBone(conn.startX, conn.startY, ...));

    // 3. Alle Knotenpunkte aus dem State zeichnen
    // Wir zeichnen die Punkte nach den Linien, damit die Gelenke immer über den Knochen liegen.
    state.nodes.forEach(node => {
      this.drawJoint(node.x, node.y, node.id);
    });
  },

  drawJoint: function(x, y, id) {
    // Der Namespace ist bei dynamisch generierten SVGs zwingend erforderlich
    const svgNS = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNS, "g");

    // Das eigentliche Gelenk (Kreis)
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 15);
    circle.setAttribute("fill", "#111");
    circle.setAttribute("stroke", "#00ff00");
    circle.setAttribute("stroke-width", "2");
    circle.style.cursor = "pointer";

    // Interaktion: Ein Klick auf das Gelenk meldet die Aktion sauber an den Manager zurück
    circle.onclick = () => {
      if (window.WazgManager) {
        window.WazgManager.dispatch('SELECT_NODE', { id: id });
      }
    };

    // Das Label (Text über dem Gelenk)
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y - 25);
    text.setAttribute("fill", "#00ff00");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-family", "monospace");
    text.setAttribute("text-anchor", "middle");
    text.textContent = id;

    // Elemente gruppieren und auf den Canvas werfen
    group.appendChild(circle);
    group.appendChild(text);
    this.canvas.appendChild(group);
  }
};
