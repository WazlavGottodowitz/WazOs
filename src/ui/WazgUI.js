// wazOS - WazgUI.js (Component Factory & UI Toolkit)
window.WazgUI = {
    isStub: false,

    init: function() {
        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("UI", "WazgUI-Komponenten-Fabrik betriebsbereit.");
        }
    },

    createButton: function(text, color, bg, onClick) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.style.cssText = `background:${bg}; border:1px solid ${color}; color:${color}; padding:6px 10px; font-size:11px; font-family:monospace; border-radius:4px; cursor:pointer; flex:1; font-weight:bold; transition: opacity 0.15s;`;
        
        // Touch-Optimierung für Mobilgeräte
        btn.addEventListener('touchstart', () => btn.style.opacity = "0.7", {passive: true});
        btn.addEventListener('touchend', () => btn.style.opacity = "1", {passive: true});
        btn.onclick = onClick;
        return btn;
    },

    createSliderBox: function(name, min, max, val, onChange) {
        const box = document.createElement("div");
        box.style.cssText = `display:flex; align-items:center; justify-content:space-between; color:#ffaa00; font-size:11px; font-family:monospace;`;
        
        const label = document.createElement("span");
        label.innerText = `${name}: `;
        label.style.cssText = `width:80px; text-align:left;`;
        
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.value = val;
        slider.style.cssText = `flex:1; accent-color:#ffaa00; cursor:pointer; height:15px;`;
        
        const display = document.createElement("span");
        display.innerText = val;
        display.style.cssText = `width:30px; text-align:right; margin-left:5px; color:#fff;`;

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

if (window.WazgManager) window.WazgManager.registerStub("WazgUI");
