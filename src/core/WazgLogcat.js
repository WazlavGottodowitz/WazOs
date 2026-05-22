// =============================================
// WazgLogcat.js - Terminal Logger
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

    const entry = `<span class="${cssClass}">[${time}] > (${type}) ${message}</span><br>`;
    
    terminal.innerHTML += entry;

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;

    // Optional: Limit log lines to prevent memory bloat
    const lines = terminal.innerHTML.split('<br>');
    if (lines.length > 80) {
      terminal.innerHTML = lines.slice(-60).join('<br>');
    }
  }
};

// Add missing CSS class for warnings (in case it's used)
const style = document.createElement('style');
style.textContent = `
  .log-warning { color: #ffaa00; }
`;
document.head.appendChild(style);
