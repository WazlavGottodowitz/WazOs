window.isg_997_WazLogger = {
  init: function(manager) {
    console.log("WazOs: Logger Modul 997 initialisiert.");
  },
  // Logger ist kein klassisches Plugin-Signal-Prozessor-Modul, 
  // sondern ein globaler Dienst. Wir stellen ihn über window bereit.
  log: function(msg) {
    console.log(`[WazOs-System]: ${msg}`);
  }
};
