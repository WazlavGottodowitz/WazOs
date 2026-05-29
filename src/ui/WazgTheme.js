window.WazgTheme = {
  currentTheme: "dark",

  themes: {
    dark: {
      bg: "#0a0a0a",
      header: "#1a1a1a",
      workspace: "#151515",
      terminal: "rgba(20,20,20,0.95)",
      accent: "#00ff88"
    },
    crt: {
      bg: "#0f0f0f",
      header: "#111111",
      workspace: "#0a0a0a",
      terminal: "rgba(10,30,10,0.95)",
      accent: "#00ff44"
    }
  },

  init: function() {
    this.applyTheme(this.currentTheme);
    if (window.WazgLogcat) window.WazgLogcat.log("THEME", "Theme Manager ready");
  },

  applyTheme: function(themeName) {
    const t = this.themes[themeName];
    if (!t) return;

    this.currentTheme = themeName;

    const workspace = document.getElementById("waz-workspace");
    const terminal = document.getElementById("waz-terminal");
    const header = document.getElementById("waz-header");

    if (workspace) workspace.style.background = t.workspace;
    if (terminal) terminal.style.background = t.terminal;
    if (header) header.style.background = t.header;

    if (window.WazgLogcat) window.WazgLogcat.log("THEME", `Switched to ${themeName}`);
  },

  toggle: function() {
    const next = this.currentTheme === "dark" ? "crt" : "dark";
    this.applyTheme(next);
  }
};
