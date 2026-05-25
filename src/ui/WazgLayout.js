// wazOS - WazgLayout.js (Responsive Mobile GUI & Controls)
window.WazgLayout = {
    isStub: false,
    currentFPS: 10,

    init: function() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Baue Steuerungs-Panel auf dem Workspace auf
        this.buildControls();

        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("LAYOUT", "Mobile GUI initialisiert. Steuerungspanel aktiv.");
        }
    },

    resizeCanvas: function() {
        const canvas = document.getElementById("waz-svg-canvas");
        const workspace = document.getElementById("waz-workspace");
        if (canvas && workspace) {
            canvas.setAttribute("width", workspace.clientWidth);
            canvas.setAttribute("height", workspace.clientHeight);
        }
    },

    buildControls: function() {
        const workspace = document.getElementById("waz-workspace");
        if (!workspace) return;

        // Panel Container
        let controls = document.getElementById("waz-controls-panel");
        if (!controls) {
            controls = document.createElement("div");
            controls.id = "waz-controls-panel";
            controls.style.cssText = `position:absolute; bottom:10px; left:10px; right:10px; background:rgba(0,0,0,0.85); border:1px solid #ffaa00; padding:10px; border-radius:8px; z-index:100; display:flex; flex-direction:column; gap:8px; font-family:monospace;`;
            workspace.appendChild(controls);
        } else {
            controls.innerHTML = "";
        }

        // Generator Input & Button
        const topRow = document.createElement("div");
        topRow.style.cssText = `display:flex; gap:5px;`;
        
        const input = document.createElement("input");
        input.id = "waz-prompt-input";
        input.placeholder = "Prompt eingeben...";
        input.style.cssText = `flex:1; background:#111; border:1px solid #555; color:#fff; padding:5px; font-size:12px; border-radius:4px;`;
        topRow.appendChild(input);

        const genBtn = this.createButton("⚡ Throw", "#ffaa00", "#221100", () => {
            const p = document.getElementById("waz-prompt-input").value;
            if (p && window.WazgFrameThrower) window.WazgFrameThrower.throwFrames(p, 10);
        });
        topRow.appendChild(genBtn);
        controls.appendChild(topRow);

        // Sliders
        controls.appendChild(this.createSliderBox("FPS", 5, 20, 10, (v) => this.currentFPS = parseInt(v)));
        controls.appendChild(this.createSliderBox("Interp (ms)", 80, 800, 280, (v) => {
            if (window.WazgFrameThrower) window.WazgFrameThrower.fadeDuration = parseInt(v);
        }));

        // Presets Row
        const presetRow = document.createElement("div");
        presetRow.style.cssText = `display:flex; flex-wrap:wrap; gap:5px; align-items:center;`;
        
        const label = document.createElement("span");
        label.innerText = "Easing: ";
        label.style.cssText = `color:#888; font-size:10px;`;
        presetRow.appendChild(label);

        const presets = [
            { label: "Ease Out", value: "ease-out" },
            { label: "Smooth", value: "ease-in-out" },
            { label: "Linear", value: "linear" },
            { label: "Bounce", value: "ease-out-back" }
        ];

        presets.forEach(p => {
            const btn = document.createElement("div");
            btn.innerHTML = p.label;
            btn.style.cssText = `background:#1a1a1a; border:1px solid #ffaa00; color:#ffaa00; padding:3px 6px; border-radius:4px; font-size:10px; cursor:pointer;`;
            btn.onclick = () => {
                if (window.WazgFrameThrower) window.WazgFrameThrower.setEasing(p.value);
            };
            presetRow.appendChild(btn);
        });
        controls.appendChild(presetRow);

        // Play / Stop / Clear Actions Row
        const actRow = document.createElement("div");
        actRow.style.cssText = `display:flex; gap:5px;`;
        actRow.appendChild(this.createButton("▶️ Play", "#ffcc00", "#442200", () => {
            if (window.WazgFrameThrower) window.WazgFrameThrower.playAnimation(this.currentFPS);
        }));
        actRow.appendChild(this.createButton("⏹️ Stop", "#ff6666", "#440000", () => {
            if (window.WazgFrameThrower) window.WazgFrameThrower.stopAnimation();
        }));
        actRow.appendChild(this.createButton("🗑️ Clear", "#ff4444", "#440000", () => {
            if (window.WazgFrameThrower && confirm("Frames löschen?")) window.WazgFrameThrower.clear();
        }));
        controls.appendChild(actRow);
    },

    createButton: function(text, color, bg, onClick) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.style.cssText = `background:${bg}; border:1px solid ${color}; color:${color}; padding:6px 10px; font-size:11px; font-family:monospace; border-radius:4px; cursor:pointer; flex:1; font-weight:bold;`;
        btn.onclick = onClick;
        return btn;
    },

    createSliderBox: function(name, min, max, val, onChange) {
        const box = document.createElement("div");
        box.style.cssText = `display:flex; align-items:center; justify-content:space-between; color:#ffaa00; font-size:11px;`;
        
        const label = document.createElement("span");
        label.innerText = `${name}: `;
        label.style.cssText = `width:80px; text-align:left;`;
        
        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.value = val;
        slider.style.cssText = `flex:1; accent-color:#ffaa00; cursor:pointer;`;
        
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

if (window.WazgManager) window.WazgManager.registerStub("WazgLayout");
