// wazOS Kernel und Plugin Manager - STRENG PARSER-SICHER
window.WazgManager = {
    version: "66.0",
    plugins: {},
    status: "BOOTING",

    init: function() {
        console.log("wazOS Core Booting...");
        
        // Registriere die Kern-Sockets
        this.registerStub("WazgLogcat");
        this.registerStub("WazgGuard");
        this.registerStub("WazgHistory");
        
        this.status = "READY";
        
        if(window.WazgLogcat) {
            window.WazgLogcat.log("SYS", "wazOS Core erfolgreich initialisiert. Alle Sockets bereit.");
        }
    },

    registerStub: function(moduleName) {
        if (!window[moduleName]) {
            window[moduleName] = { isStub: true };
        } else {
            this.plugins[moduleName] = window[moduleName];
        }
    }
};

// Automatischer Trigger nach DOM-Injektion
if (document.readyState === "complete" || document.readyState === "interactive") {
    if(window.WazgManager) window.WazgManager.init();
} else {
    document.addEventListener("DOMContentLoaded", () => {
        if(window.WazgManager) window.WazgManager.init();
    });
}