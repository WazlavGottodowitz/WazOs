// wazOS History - RAM-schonender 10-Schritt Undo/Redo Buffer
window.WazgHistory = {
    isStub: false,
    stack: [],
    maxSteps: 10,

    init: function() {
        if(window.WazgLogcat) {
            window.WazgLogcat.log("HISTORY", "Zustands-Speicher aktiv. Limit: 10 Snapshots.");
        }
    },

    // Speichert den aktuellen Zustand (Pose, Seeds, etc.) als kompakten JSON-String
    saveSnapshot: function(stateObject) {
        // Falls das Limit erreicht ist, fliegt der älteste Schritt raus
        if (this.stack.length >= this.maxSteps) {
            this.stack.shift(); 
        }
        
        // Tiefen-Kopie per String-Konvertierung schont die Speicher-Referenzen
        this.stack.push(JSON.stringify(stateObject));
        
        if(window.WazgLogcat) {
            window.WazgLogcat.log("HISTORY", "Snapshot gesichert. Buffer-Stand: " + this.stack.length + "/10");
        }
        this.updateUndoButton();
    },

    // Holt den letzten Zustand zurück
    undo: function() {
        if (this.stack.length <= 1) {
            if(window.WazgLogcat) window.WazgLogcat.log("HISTORY", "Undo nicht moeglich. Keine weiteren Snapshots.");
            return null;
        }
        
        // Den aktuellen Zustand verwerfen
        this.stack.pop();
        
        // Den davor abgreifen
        const previousState = JSON.parse(this.stack[this.stack.length - 1]);
        
        if(window.WazgLogcat) {
            window.WazgLogcat.log("HISTORY", "Undo ausgefuehrt. Verbleibend: " + this.stack.length);
        }
        
        this.updateUndoButton();
        return previousState;
    },

    // Blendet den UI-Button aus oder ein, je nach Buffer-Zustand
    updateUndoButton: function() {
        const btn = document.getElementById("btn-undo");
        if (btn) {
            btn.style.opacity = this.stack.length > 1 ? "1.0" : "0.3";
            btn.style.pointerEvents = this.stack.length > 1 ? "auto" : "none";
        }
    }
};

if (window.WazgManager) {
    window.WazgManager.registerStub("WazgHistory");
}