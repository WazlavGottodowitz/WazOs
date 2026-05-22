// wazOS Logcat - Terminal-Logger (STRENG PARSER-SICHER)
window.WazgLogcat = {
    isStub: false,
    logs: [],

    init: function() {
        this.log("LOGCAT", "Terminal-Konsole bereit.");
    },

    log: function(system, message, type = "info") {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        
        // ABSOLUT KEINE ECKIGEN KLAMMERN! Wir nutzen runde Klammern und Pipes
        const formattedLog = "(" + timeStr + ") |" + system + "| " + message;
        
        this.logs.push({ text: formattedLog, type: type });
        
        // Direkt ins Perchance UI rendern
        const container = document.getElementById("waz-terminal-text");
        if (container) {
            // Wenn es der erste echte Eintrag ist, den Boot-Text ersetzen
            if (this.logs.length === 1 && container.innerHTML.includes("Initialisiere")) {
                container.innerHTML = "";
            }
            
            const cssClass = type === "alert" ? "log-alert" : "log-info";
            container.innerHTML += "<div class='" + cssClass + "'>" + formattedLog + "</div>";
            
            // Automatisch nach unten scrollen bei neuen Logs
            const terminal = document.getElementById("waz-terminal");
            if (terminal) {
                terminal.scrollTop = terminal.scrollHeight;
            }
        }
        
        // Parallel in die echte Browser-Konsole spiegeln
        console.log(formattedLog);
    }
};

if (window.WazgManager) {
    window.WazgManager.registerStub("WazgLogcat");
}