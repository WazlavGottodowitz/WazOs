window.WazgLogcat = {
  log: function(type, message) {
    const terminal = document.getElementById("waz-terminal-text");
    const container = document.getElementById("waz-terminal");
    if (!terminal || !container) return;
    
    const time = new Date().toLocaleTimeString('de-DE', { hour12: false });
    const cssClass = (type === "ERROR" || type === "PANIK") ? "log-alert" : "log-info";
    
    // Log-Eintrag anhängen
    terminal.innerHTML += `\n<span class="${cssClass}">[${time}] > (${type}) ${message}</span>`;
    
    // Auto-Scroll nach unten
    container.scrollTop = container.scrollHeight;
  }
};
