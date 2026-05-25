// wazOS - WazgUI.js (Component Factory & UI Toolkit)
window.WazgUI = {
    isStub: false,

    init: function() {
        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("UI", "WazgUI-Komponenten-Fabrik erfolgreich im RAM registriert.");
        }
    },

    /**
     * Erzeugt einen standardisierten wazOS Button mit Touch-Feedback
     */
    createButton: function(text, color, bg, onClick) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.className = "waz-btn";
        btn.style.cssText = `
            background: ${bg}; 
            border: 1px solid ${color}; 
            color: ${color}; 
            padding: 6px 10px; 
            font-size: 11px; 
            font-family: monospace; 
            border-radius: 4px; 
            cursor: pointer; 
            flex: 1; 
            font-weight: bold; 
            transition: opacity 0.15s, transform 0.05s;
        `;
        
        // Visuelles Feedback für Touch-Geräte beim Drücken
        btn.addEventListener('touchstart', () => {
            btn.style.opacity = "0.7";
            btn.style.transform = "scale(0.98)";
        }, {passive: true});
        
        btn.addEventListener('touchend', () => {
            btn.style.opacity = "1";
            btn.style.transform = "scale(1)";
        }, {passive: true});

        btn.onclick = onClick;
        return btn;
    },

    /**
     * Erzeugt eine Container-Box inklusive Label, Range-Slider und Live-Wert-Anzeige
     */
    createSliderBox: function(name, min, max, val, onChange) {
        const box = document.createElement("div");
        box.className = "waz-slider-box";
        box.style.cssText = `
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            color: #ffaa00; 
            font-size: 11px; 
            font-family: monospace;
            gap: 8px;
            width: 100%;
        `;
        
        const label = document.createElement("span");
        label.innerText = `${name}:`;
        label.style.cssText = `width: 75px; text-align: left; color: #ffaa00;`;
        
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.value = val;
        slider.style.cssText = `
            flex: 1; 
            accent-color: #ffaa00; 
            cursor: pointer; 
            height: 14px;
            background: #222;
            border-radius: 2px;
        `;
        
        const display = document.createElement("span");
        display.innerText = val;
        display.style.cssText = `width: 35px; text-align: right; color: #ffffff; font-weight: bold;`;

        // Live-Update des Werts beim Ziehen
        slider.oninput = (e) => {
            display.innerText = e.target.value;
            onChange(e.target.value);
        };

        box.appendChild(label);
        box.appendChild(slider);
        box.appendChild(display);
        return box;
    }
};

// Registrierung beim globalen wazOS-Manager erzwingen
if (window.WazgManager) {
    window.WazgManager.registerStub("WazgUI");
}
