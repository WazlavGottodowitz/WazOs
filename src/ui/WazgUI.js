// wazOS - WazgUI.js (Component Factory & UI Toolkit)
window.WazgUI = {
    isStub: false,

    init: function() {
        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("UI", "WazgUI-Komponenten-Fabrik erfolgreich im RAM registriert.");
        }
    },

    createButton: function(text, color, bg, onClick) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.className = "waz-btn";
        btn.style.cssText = `background:${bg}; border:1px solid ${color}; color:${color}; padding:6px 10px; font-size:11px; font-family:monospace; border-radius:4px; cursor:pointer; flex:1; font-weight:bold; transition:opacity 0.15s;`;
        
        btn.addEventListener('touchstart', () => btn.style.opacity = "0.7", {passive: true});
        btn.addEventListener('touchend', () => btn.style.opacity = "1", {passive: true});
        btn.onclick = onClick;
        return btn;
    },

    // Generiert ein platzsparendes, ausklappbares Menü für die Regler
    createCollapsiblePanel: function(title, elementsArray) {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `border: 1px solid #333; border-radius: 4px; margin-bottom: 5px; background: #111; overflow: hidden;`;

        const toggleBtn = document.createElement("div");
        toggleBtn.innerHTML = `⚙️ ${title} <span style="float:right;">▼</span>`;
        toggleBtn.style.cssText = `background: #1a1a1a; color: #ffaa00; padding: 6px 10px; font-size: 11px; font-family: monospace; cursor: pointer; user-select: none; font-weight: bold;`;

        const content = document.createElement("div");
        content.style.cssText = `padding: 8px; display: none; flex-direction: column; gap: 8px; background: #0c0c0c;`;

        elementsArray.forEach(el => content.appendChild(el));

        toggleBtn.onclick = () => {
            const isHidden = content.style.display === "none";
            content.style.display = isHidden ? "flex" : "none";
            toggleBtn.querySelector("span").innerHTML = isHidden ? "▲" : "▼";
        };

        wrapper.appendChild(toggleBtn);
        wrapper.appendChild(content);
        return wrapper;
    },

    createSliderBox: function(name, min, max, val, onChange) {
        const box = document.createElement("div");
        box.style.cssText = `display:flex; align-items:center; justify-content:space-between; color:#ffaa00; font-size:11px; font-family:monospace; gap:8px; width:100%;`;
        
        const label = document.createElement("span");
        label.innerText = `${name}:`;
        label.style.styleCcst = `width:70px; color:#ffaa00;`;
        
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.value = val;
        slider.style.cssText = `flex:1; accent-color:#ffaa00; cursor:pointer; height:14px; background:#222;`;
        
        const display = document.createElement("span");
        display.innerText = val;
        display.style.cssText = `width:30px; text-align:right; color:#fff; font-weight:bold;`;

        slider.oninput = (e) => {
            display.innerText = e.target.value;
            onChange(e.target.value);
        };

        box.appendChild(label);
        box.appendChild(slider);
        box.appendChild(display);
        return box;
    },

    // Kopiert den Inhalt des Terminals in die Zwischenablage
    copyTerminalLog: function() {
        const termText = document.getElementById("waz-terminal-text");
        if (!termText) return;
        
        // HTML-Tags (<br> etc.) für reinen Text entfernen
        const cleanText = termText.innerHTML.replace(/<br\s*\/?>/mg, "\n").replace(/<[^>]+>/g, "");
        
        navigator.clipboard.writeText(cleanText).then(() => {
            if (window.WazgLogcat) window.WazgLogcat.log("SYS", "Terminal-Log in Zwischenablage kopiert!");
        }).catch(err => {
            if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "Copy fehlgeschlagen: " + err);
        });
    }
};

if (window.WazgManager) window.WazgManager.registerStub("WazgUI");
