window.WazgAccessibility = {
  displayElement: null,

  init: function() {
    this.createLiveDisplay();
    this.runFullCheck();
  },

  createLiveDisplay: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    this.displayElement = document.createElement("div");
    this.displayElement.style.cssText = `
      position:absolute; top:15px; right:220px; background:rgba(26,26,26,0.95);
      border:1px solid #00cc88; color:#00cc88; padding:6px 10px; border-radius:6px;
      font-size:10px; z-index:270;
    `;
    workspace.appendChild(this.displayElement);
  },

  updateLiveDisplay: function(ratios) {
    if (!this.displayElement) return;
    let html = `<strong>Contrast</strong><br>`;
    ratios.forEach(r => {
      const color = r.ratio >= 4.5 ? "#00ff88" : "#ffcc00";
      html += `<span style="color:${color}">${r.name}: ${r.ratio.toFixed(2)}:1</span><br>`;
    });
    this.displayElement.innerHTML = html;
  },

  getContrast: function(c1, c2) {
    const l1 = this.getLuminance(c1);
    const l2 = this.getLuminance(c2);
    return (Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05);
  },

  getLuminance: function(hex) {
    hex = hex.replace('#','');
    const r = parseInt(hex.substr(0,2),16)/255;
    const g = parseInt(hex.substr(2,2),16)/255;
    const b = parseInt(hex.substr(4,2),16)/255;
    const a = [r,g,b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
    return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
  },

  runFullCheck: function() {
    const checks = [
      {name:"Header", text:"#00ff00", bg:"#1a1a1a"},
      {name:"Terminal", text:"#00ff00", bg:"#141414"},
      {name:"Accent", text:"#00ff88", bg:"#1a1a1a"}
    ];
    const results = checks.map(c => ({name:c.name, ratio:this.getContrast(c.text, c.bg)}));
    this.updateLiveDisplay(results);
  }
};
