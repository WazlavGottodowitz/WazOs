// =============================================
// WazgLayout.js - With Theme Switcher
// =============================================

window.WazgLayout = {
  currentFPS: 10,

  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    const controls = document.createElement("div");
    controls.style.cssText = `
      position: absolute; top: 15px; left: 15px; z-index: 250;
      display: flex; flex-direction: column; gap: 9px; min-width: 200px;
    `;
    workspace.appendChild(controls);

    // Theme Switcher
    controls.appendChild(WazgUI.createButton("🌗 Switch Theme", {
      color: "#ffcc00",
      borderColor: "#664400",
      onClick: () => {
        if (window.WazgTheme) window.WazgTheme.toggle();
      }
    }));

    // Generate Frames
    controls.appendChild(WazgUI.createButton("🎞️ Generate Frames", {
      color: "#00ff88",
      borderColor: "#004400",
      onClick: () => {
        if (window.WazgFrameThrower) {
          const p = prompt("Base prompt:", "cybernetic biomechanical warrior, dynamic pose");
          if (p) window.WazgFrameThrower.throwFrames(p, 10);
        }
      }
    }));

    // FPS Slider
    controls.appendChild(WazgUI.createSlider("FPS", 5, 20, 10, (v) => {
      window.WazgLayout.currentFPS = v;
    }));

    // Interpolation
    controls.appendChild(WazgUI.createSlider("Interp (ms)", 80, 800, 280, (v) => {
      if (window.WazgFrameThrower) window.WazgFrameThrower.fadeDuration = v;
    }));

    // ... (rest of your presets and buttons remain the same)
    // Play, Stop, Clear buttons...
  }
};
