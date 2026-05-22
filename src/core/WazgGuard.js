// wazOS Guard - Sicherheits-Sperren & Achsen-Locking
window.WazgGuard = {
    isStub: false,
    isLocked: false,
    lockedJoints: new Set(),

    init: function() {
        if(window.WazgLogcat) {
            window.WazgLogcat.log("GUARD", "Sicherheits-System aktiv. Ueberwache Touch-Inputs.");
        }
    },

    toggleGlobalLock: function(state) {
        this.isLocked = (state !== undefined) ? state : !this.isLocked;
        const statusText = this.isLocked ? "SKELETT GESPERRT (LOCK)" : "SKELETT FREIGEGEBEN";
        
        if(window.WazgLogcat) {
            window.WazgLogcat.log("GUARD", statusText, this.isLocked ? "alert" : "info");
        }
        
        const canvas = document.getElementById("waz-svg-canvas");
        if (canvas) {
            canvas.style.opacity = this.isLocked ? "0.6" : "1.0";
        }
    },

    lockJoint: function(jointId) {
        this.lockedJoints.add(jointId);
        // Runde Klammern statt eckige, um Perchance-Parser-Fehler zu vermeiden!
        if(window.WazgLogcat) window.WazgLogcat.log("GUARD", "Gelenk (" + jointId + ") gesperrt.");
    },

    unlockJoint: function(jointId) {
        this.lockedJoints.delete(jointId);
        if(window.WazgLogcat) window.WazgLogcat.log("GUARD", "Gelenk (" + jointId + ") freigegeben.");
    },

    canMove: function(jointId) {
        if (this.isLocked) return false;
        if (this.lockedJoints.has(jointId)) return false;
        return true;
    }
};

if (window.WazgManager) {
    window.WazgManager.registerStub("WazgGuard");
}