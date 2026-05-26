// =============================================
// WazgTheme.js - Modular Theme Manager
// =============================================

window.WazgTheme = {
  currentTheme: "dark",

  themes: {
    dark: {
      bg: "#0a0a0a",
      header: "#1a1a1a",
      workspace: "#151515",
      terminal: "rgba(20,20,20,0.95)",
      accent: "#00ff88",
      text: "#00ff00"
    },
    crt: {
      bg: "#0f0f0f",
      header: "#111111",
      workspace: "#0a0a0a",
      terminal: "rgba(10,30,10,0.95)",
      accent: "#00ff44",
      text: "#00cc00"
    }
  },

  init: function() {
    this.applyTheme(this.currentTheme);
    if (window.WazgLogcat) {
      window.WazgLogcat.log("THEME", "Theme Manager initialized");
    }
  },

  applyTheme: function(themeName) {
    if (!this.themes[themeName]) {
      if (window.WazgLogcat) window.WazgLogcat.log("THEME", `Unknown theme: ${themeName}`);
      return;
    }

    this.currentTheme = themeName;
    const t = this.themes[themeName];

    // Apply CSS variables
    document.documentElement.style.setProperty('--bg', t.bg);
    document.documentElement.style.setProperty('--header', t.header);
    document.documentElement.style.setProperty('--workspace', t.workspace);
    document.documentElement.style.setProperty('--terminal', t.terminal);
    document.documentElement.style.setProperty('--accent', t.accent);

    // Direct element styling
    const workspace = document.getElementById("waz-workspace");
    const terminal = document.getElementById("waz-terminal");
    const header = document.getElementById("waz-header");

    if (workspace) workspace.style.background = t.workspace;
    if (terminal) terminal.style.background = t.terminal;
    if (header) header.style.background = t.header;

    // Trigger accessibility re-check
    if (window.WazgAccessibility) {
      setTimeout(() => window.WazgAccessibility.runFullCheck(), 150);
    }

    if (window.WazgLogcat) {
      window.WazgLogcat.log("THEME", `Theme switched to ${themeName}`);
    }
  },

  toggle: function() {
    const next = this.currentTheme === "dark" ? "crt" : "dark";
    this.applyTheme(next);
  }
};
