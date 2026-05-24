// =============================================
// WazgTheme.js - Updated with Contrast Checking
// =============================================

window.WazgTheme = {
  currentTheme: "dark",

  themes: {
    dark: { bg: "#0a0a0a", header: "#1a1a1a", workspace: "#151515", terminal: "rgba(20,20,20,0.95)", accent: "#00ff88" },
    crt:  { bg: "#0f0f0f", header: "#111111", workspace: "#0a0a0a", terminal: "rgba(10,30,10,0.95)", accent: "#00ff44" }
  },

  init: function() {
    this.applyTheme(this.currentTheme);
    if (window.WazgLogcat) window.WazgLogcat.log("THEME", "Theme manager with accessibility checks loaded");
  },

  applyTheme: function(themeName) {
    if (!this.themes[themeName]) return;
    this.currentTheme = themeName;
    const t = this.themes[themeName];

    // Apply styles...
    const workspace = document.getElementById("waz-workspace");
    const terminal = document.getElementById("waz-terminal");
    const header = document.getElementById("waz-header");

    if (workspace) workspace.style.background = t.workspace;
    if (terminal) terminal.style.background = t.terminal;
    if (header) header.style.background = t.header;

    // Run accessibility check after theme change
    if (window.WazgAccessibility) {
      setTimeout(() => window.WazgAccessibility.runFullCheck(), 100);
    }

    if (window.WazgLogcat) window.WazgLogcat.log("THEME", `Theme switched to ${themeName}`);
  },

  toggle: function() {
    const next = this.currentTheme === "dark" ? "crt" : "dark";
    this.applyTheme(next);
  }
};
