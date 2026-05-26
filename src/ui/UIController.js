window.UIController = {
    init: function() {
        console.log("UI-Controller: Initialisiere Interfaces...");

        this.setupTabs();
        this.setupMicroTerminal();
        this.setupNodeEditorButtons();

        console.log("UI-Controller: Bereit.");
    },

    setupTabs: function() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.panel');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 1. Alle aktiven Klassen entfernen
                tabBtns.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // 2. Geklickten Tab aktivieren
                e.target.classList.add('active');
                const targetId = e.target.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
            });
        });
    },

    setupMicroTerminal: function() {
        const btnLogger = document.getElementById('sw-logger');
        const btnTicker = document.getElementById('sw-ticker');
        const termContent = document.getElementById('terminal-content');

        if(btnLogger && btnTicker) {
            btnLogger.addEventListener('click', () => {
                btnLogger.classList.add('active');
                btnTicker.classList.remove('active');
                termContent.innerHTML = "> Logger View aktiv...<br>> Zeigt System-Events.";
                // Hier könntest du später deinen WazLogger-Output reinrouten
            });

            btnTicker.addEventListener('click', () => {
                btnTicker.classList.add('active');
                btnLogger.classList.remove('active');
                termContent.innerHTML = "> Ticker View aktiv...<br>> [ 140 BPM | Frame 24 ]";
                // Hier kommt später der Output von deinem Ticker/Metronom rein
            });
        }
    },

    setupNodeEditorButtons: function() {
        // Die Buttons aus dem Maschinenraum
        const btnAddJoint = document.getElementById('btn-add-joint');
        
        if (btnAddJoint && window.WazgManager) {
            btnAddJoint.addEventListener('click', (e) => {
                e.preventDefault();
                window.WazgManager.dispatch('ADD_NODE', { 
                    x: Math.random() * 500, 
                    y: Math.random() * 300 
                }, e);
            });
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    try {
        if(window.WazgManager) window.WazgManager.init();
        if(window.WazgAnatomy) window.WazgAnatomy.init();
        
        window.UIController.init();
    } catch (e) {
        console.error("FATAL BOOT ERROR:", e);
    }
});
