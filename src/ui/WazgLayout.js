// wazOS - WazgLayout.js (Flexible Grid UI)
window.WazgLayout = {
    isStub: false,
    currentFPS: 10,

    init: function() {
        this.applyFlexGrid();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.buildControls();
        this.injectUtilityButtons();

        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("LAYOUT", "Flexibles CSS-Grid-Layout injiziert.");
        }
    },

    applyFlexGrid: function() {
        // Formatiert den Hauptcontainer als flexibles Grid-System
        const container = document.getElementById("waz-container");
        if (container) {
            container.style.cssText = `
                display: grid;
                grid-template-rows: 35px 1fr 110px;
                height: 100vh;
                width: 100vw;
                overflow: hidden;
            `;
        }
        
        // Workspace kriegt relative Positionierung für absolute Overlays
        const workspace = document.getElementById("waz-workspace");
        if (workspace) {
            workspace.style.cssText = `position: relative; background: #0a0a0a; overflow: hidden;`;
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
        if (!workspace || !window.WazgUI) return;

        let controls = document.getElementById("waz-controls-panel");
        if (!controls) {
            controls = document.createElement("div");
            controls.id = "waz-controls-panel";
            controls.style.cssText = `position:absolute; bottom:10px; left:10px; right:10px; background:rgba(0,0,0,0.9); border:1px solid #ffaa00; padding:8px; border-radius:6px; z-index:100; display:flex; flex-direction:column; gap:6px;`;
            workspace.appendChild(controls);
        } else {
            controls.innerHTML = "";
        }

        // Zeile 1: Prompt Input & Throw Button
        const topRow = document.createElement("div");
        topRow.style.cssText = `display:flex; gap:5px;`;
        
        const input = document.createElement("input");
        input.id = "waz-prompt-input";
        input.placeholder = "Prompt eingeben...";
        input.style.cssText = `flex:1; background:#111; border:1px solid #444; color:#fff; padding:5px; font-size:12px; font-family:monospace; border-radius:4px;`;
        topRow.appendChild(input);

        const genBtn = window.WazgUI.createButton("⚡ Throw", "#ffaa00", "#221100", () => {
            const p = document.getElementById("waz-prompt-input").value;
            if (p && window.WazgFrameThrower) window.WazgFrameThrower.throwFrames(p, 10);
        });
        topRow.appendChild(genBtn);
        controls.appendChild(topRow);

        // PLATZSPAREND: Erzeuge die Regler und packe sie in das Ausklapp-Panel
        const fpsSlider = window.WazgUI.createSliderBox("FPS", 5, 20, this.currentFPS, (v) => this.currentFPS = parseInt(v));
        const interpSlider = window.WazgUI.createSliderBox("Interp (ms)", 80, 800, 280, (v) => {
            if (window.WazgFrameThrower) window.WazgFrameThrower.fadeDuration = parseInt(v);
        });

        const collapsibleEngineSettings = window.WazgUI.createCollapsiblePanel("Engine Parameter", [fpsSlider, interpSlider]);
        controls.appendChild(collapsibleEngineSettings);

        // Zeile 3: Wiedergabe-Aktionen
        const actRow = document.createElement("div");
        actRow.style.cssText = `display:flex; gap:5px;`;
        actRow.appendChild(window.WazgUI.createButton("▶️ Play", "#ffcc00", "#442200", () => {
            if (window.WazgFrameThrower) window.WazgFrameThrower.playAnimation(this.currentFPS);
        }));
        actRow.appendChild(window.WazgUI.createButton("⏹️ Stop", "#ff6666", "#440000", () => {
            if (window.WazgFrameThrower) window.WazgFrameThrower.stopAnimation();
        }));
        actRow.appendChild(window.WazgUI.createButton("🗑️ Clear", "#ff4444", "#440000", () => {
            if (window.WazgFrameThrower && confirm("Clear buffer?")) window.WazgFrameThrower.clear();
        }));
        controls.appendChild(actRow);
    },

    injectUtilityButtons: function() {
        const terminal = document.getElementById("waz-terminal");
        if (!terminal || !window.WazgUI) return;
        
        terminal.style.position = "relative";

        // Erstelle den Copy-Log Button direkt oben rechts im Terminal-Fenster
        const copyBtn = window.WazgUI.createButton("📋 Copy Log", "#00ffaa", "#002211", () => {
            window.WazgUI.copyTerminalLog();
        });
        copyBtn.style.position = "absolute";
        copyBtn.style.top = "5px";
        copyBtn.style.right = "5px";
        copyBtn.style.zIndex = "110";
        copyBtn.style.flex = "none";
        copyBtn.style.fontSize = "9px";
        copyBtn.style.padding = "3px 6px";

        terminal.appendChild(copyBtn);
    }
};

if (window.WazgManager) window.WazgManager.registerStub("WazgLayout");
