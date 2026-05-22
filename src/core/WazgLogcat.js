// =============================================
// WazgLogcat.js - Terminal Logger (Perchance-safe)
// =============================================

window.WazgLogcat = {
  log: function(type, message) {
    const terminal = document.getElementById("waz-terminal-text");
    const container = document.getElementById("waz-terminal");
    
    if (!terminal || !container) return;

    const time = new Date().toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });

    let cssClass = "log-info";
    if (type === "ERROR" || type === "PANIK" || type === "GUARD") {
      cssClass = "log-alert";
    } else if (type === "WARNING") {
      cssClass = "log-warning";
    }

    // Perchance-safe format (no square brackets)
    const entry = `<span class="${cssClass}">(${time}) > (${type}) ${message}</span><br>`;
    
    terminal.innerHTML += entry;

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Prevent log bloat
    const lines = terminal.getElementsByTagName('span');
    if (lines.length > 80) {
      terminal.innerHTML = Array.from(lines).slice(-60).map(s => s.outerHTML).join('');
    }
  }
};

// Add CSS classes
const style = document.createElement('style');
style.textContent = `
  .log-warning { color: #ffaa00; }
  .log-alert { color: #ff4444; font-weight: bold; }
`;
document.head.appendChild(style);
