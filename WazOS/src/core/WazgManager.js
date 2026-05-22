// wazOS Kernel & Plugin Manager
window.WazgManager = {
    version: "66.0",
    plugins: {},
    status: "BOOTING",

    // Initialisiert das gesamte wazOS System
    init: function() {
        console.log(`%c ⚙️ wazOS v${this.version} Core Booting... `, "background: #1e1e1e; color: #00ff00; font-family: monospace;");
        
        // Boot-Reihenfolge festlegen
        this.registerStub("WazgLogcat");
        this.registerStub("WazgGuard");
        this.registerStub("WazgHistory");
        
        this.status = "READY";
        if(window.WazgLogcat) {
            window.WazgLogcat.verbose("SYS", "wazOS erfolgreich initialisiert. Alle Sockets bereit.");
        }
    },

    // Verhindert Abstürze: Wenn ein Modul fehlt, wird ein leeres Dummy-Objekt (Stub) erstellt
    registerStub: function(moduleName) {
        if (!window[moduleName]) {
            window[moduleName] = { isStub: true };
            console.warn(`[WazgManager] ${moduleName} nicht gefunden. Platzhalter-Socket injiziert.`);
        } else {
            this.plugins[moduleName] = window[moduleName];
        }
    }
};

// Automatischer Boot-Trigger für Perchance
document.addEventListener("DOMContentLoaded", () => {
    window.WazgManager.init();
});