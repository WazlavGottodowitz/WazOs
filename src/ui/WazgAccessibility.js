// =============================================
// WazgAccessibility.js - Live Contrast Checker
// WCAG Contrast Monitoring
// =============================================

window.WazgAccessibility = {
  displayElement: null,

  init: function() {
    this.createLiveDisplay();
    if (window.WazgLogcat) {
      window.WazgLogcat.log("ACCESS", "Accessibility & Contrast Monitor initialized");
    }
    this.runFullCheck();
  },

  createLiveDisplay: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    this.displayElement = document.createElement("div");
    this.displayElement.id = "live-contrast-display";
    this.displayElement.style.cssText = `
      position: absolute;
      top: 15px;
      right: 220px;
      background: rgba(26,26,26,0.95);
      border: 1px solid #00cc88;
      color: #00cc88;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 10px;
      z-index: 270;
      min-width: 130px;
      text-align: center;
      box-shadow: 0 0 6px rgba(0, 204, 136, 0.3);
    `;
    workspace.appendChild(this.displayElement);
  },

  updateLiveDisplay: function(ratios) {
    if (!this.displayElement) return;

    let html = `<strong>Contrast Ratios</strong><br>`;
    
    ratios.forEach(r => {
      const color = r.ratio >= 4.5 ? "#00ff88" : (r.ratio >= 3.0 ? "#ffcc00" : "#ff6666");
      html += `<span style="color:${color}">${r.name}: ${r.ratio.toFixed(2)}:1</span><br>`;
    });

    this.displayElement.innerHTML = html;
  },

  getLuminance: function(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0,2), 16) / 255;
    const g = parseInt(hex.substr(2,2), 16) / 255;
    const b = parseInt(hex.substr(4,2), 16) / 255;

    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  },

  getContrast: function(color1, color2) {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  runFullCheck: function() {
    const checks = [
      { name: "Header", text: "#00ff00", bg: "#1a1a1a" },
      { name: "Terminal", text: "#00ff00", bg: "#141414" },
      { name: "Accent", text: "#00ff88", bg: "#1a1a1a" },
      { name: "Easing", text: "#ffaa00", bg: "#1a1a1a" }
    ];

    const results = checks.map(check => ({
      name: check.name,
      ratio: this.getContrast(check.text, check.bg)
    }));

    this.updateLiveDisplay(results);
    return results;
  }
};
