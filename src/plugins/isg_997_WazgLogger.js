window.isg_997_WazLogger = {
  init: function(manager) { console.log("Logger aktiv."); },
  log: function(msg) {
    const logBox = document.getElementById('log-container');
    if (logBox) {
      logBox.innerHTML += `<div>> ${msg}</div>`;
      logBox.scrollTop = logBox.scrollHeight;
    }
    console.log("[WazOs]:", msg);
  }
};
