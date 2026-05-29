window.WazgLogcat = {
  log: function(type, message) {
    const terminal = document.getElementById("waz-terminal-text");
    if (!terminal) return;
    const time = new Date().toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
    const color = (type === "ERROR" || type === "PANIK") ? "#ff6666" : "#00ff99";
    terminal.innerHTML += `<span style="color:${color}">(${time}) > (${type}) ${message}</span><br>`;
    terminal.scrollTop = terminal.scrollHeight;
    if (terminal.children.length > 35) terminal.removeChild(terminal.children[0]);
  }
};
