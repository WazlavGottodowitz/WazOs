// wazOS - WazgAccessability.js (Mobile UX & Accessibility Shield)
window.WazgAccessability = {
    isStub: false,

    init: function() {
        this.applyTouchShield();
        this.optimizeScreenReader();
        
        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("A11Y", "Accessibility-Shield aktiv. Touch-Gesten stabilisiert.");
        }
    },

    applyTouchShield: function() {
        // Verhindert das lästige automatische Zoomen bei schnellen Doppel-Taps auf Mobile-Buttons
        document.addEventListener('touchend', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.classList.contains('waz-btn')) {
                if (e.cancelable) e.preventDefault();
                e.target.click();
            }
        }, { passive: false });
    },

    optimizeScreenReader: function() {
        const canvas = document.getElementById("waz-svg-canvas");
        if (canvas) {
            canvas.setAttribute("role", "img");
            canvas.setAttribute("aria-label", "wazOS Vektor-Canvas für Biomechanik und Frame-Animationen");
        }

        const terminal = document.getElementById("waz-terminal");
        if (terminal) {
            terminal.setAttribute("role", "log");
            terminal.setAttribute("aria-live", "polite");
        }
    }
};

if (window.WazgManager) {
    window.WazgManager.registerStub("WazgAccessability");
}
