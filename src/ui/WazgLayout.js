// wazOS Layout - Mobile Responsive GUI & Canvas-Steuerung
window.WazgLayout = {
    isStub: false,

    init: function() {
        this.resizeCanvas();
        
        // Event-Listener für saubere Resizes auf Mobilgeräten
        window.addEventListener('resize', () => this.resizeCanvas());

        if(window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("LAYOUT", "Responsive GUI initialisiert. Multi-Touch-Canvas bereit.");
        }
    },

    resizeCanvas: function() {
        const canvas = document.getElementById("waz-svg-canvas");
        const workspace = document.getElementById("waz-workspace");
        
        if (canvas && workspace) {
            canvas.setAttribute("width", workspace.clientWidth);
            canvas.setAttribute("height", workspace.clientHeight);
        }
    }
};

if (window.WazgManager) {
    window.WazgManager.registerStub("WazgLayout");
          }
