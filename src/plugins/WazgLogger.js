window.WazgLogger = {
  log: function(msg, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[WazOs ${timestamp}]`;
    if (type === 'error') {
      console.error(`${prefix} FEHLER:`, msg);
    } else {
      console.log(`${prefix} ${msg}`);
    }
  }
};
console.log("WazgLogger geladen.");
