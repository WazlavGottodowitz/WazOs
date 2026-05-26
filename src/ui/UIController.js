// src/ui/UIController.js

window.UIController = {
    init: function() {
        console.log("UI-Controller: Initialisiere Event-Listener...");

        // 1. Hole die Buttons aus dem HTML
        const btnAddJoint = document.getElementById('btn-add-joint');
        const btnClear = document.getElementById('btn-clear');

        // 2. Binde die Klick-Events an den Manager (VST-Bus)
        if (btnAddJoint) {
            btnAddJoint.addEventListener('click', (event) => {
                event.preventDefault();
                // Sende den Befehl an den Core
                window.WazgManager.dispatch('ADD_NODE', { 
                    x: Math.random() * 500, 
                    y: Math.random() * 300 
                }, event);
            });
        }

        if (btnClear) {
            btnClear.addEventListener('click', (event) => {
                event.preventDefault();
                window.WazgManager.dispatch('CLEAR_WORKSPACE', null, event);
            });
        }

        console.log("UI-Controller: Bereit.");
    }
};

// Startsequenz (Wartet, bis die Seite komplett geladen ist)
window.addEventListener('DOMContentLoaded', () => {
    try {
        // Zuerst den Core hochfahren...
        if(window.WazgManager) window.WazgManager.init();
        if(window.WazgAnatomy) window.WazgAnatomy.init();
        
        // ...dann die Benutzeroberfläche anklemmen
        window.UIController.init();
        
        if(window.isg_997_WazLogger) {
            window.isg_997_WazLogger.log("System erfolgreich gestartet (Modular Mode)");
        }
    } catch (e) {
        console.error("FATAL BOOT ERROR:", e);
    }
});
