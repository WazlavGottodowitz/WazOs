// =============================================
// WazgLayout.js - With Interpolation Slider
// =============================================

window.WazgLayout = {
  currentFPS: 10,

  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    const controls = document.createElement("div");
    controls.style.cssText = `
      position: absolute; top: 15px; left: 15px; z-index: 250;
      display: flex; flex-direction: column; gap: 9px; min-width: 180px;
    `;
    workspace.appendChild(controls);

    // Generate Frames
    const genBtn = this.createButton("🎞️ Generate Frames", "#00ff88", "#004400");
    genBtn.onclick = () => {
      if (window.WazgFrameThrower) {
        const p = prompt("Base prompt:", "cybernetic biomechanical warrior, dynamic pose");
        if (p) window.WazgFrameThrower.throwFrames(p, 10);
      }
    };
    controls.appendChild(genBtn);

    // FPS Slider
    const fpsBox = this.createSliderBox("FPS", 5, 20, 10, (val) => {
      window.WazgLayout.currentFPS = val;
    });
    controls.appendChild(fpsBox);

    // Interpolation Strength Slider
    const interpBox = this.createSliderBox("Interpolation", 80, 800, 280, (val) => {
      if (window.WazgFrameThrower) {
        window.WazgFrameThrower.setInterpolationStrength(val);
      }
    });
    controls.appendChild(interpBox);

    // Play / Stop / Clear
    const playBtn = this.createButton("▶️ Play", "#ffcc00", "#442200");
    playBtn.onclick = () => {
      if (window.WazgFrameThrower) window.WazgFrameThrower.playAnimation(window.WazgLayout.currentFPS);
    };
    controls.appendChild(playBtn);

    const stopBtn = this.createButton("⏹️ Stop", "#ff6666", "#440000");
    stopBtn.onclick = () => {
      if (window.WazgFrameThrower) window.WazgFrameThrower.stopAnimation();
    };
    controls.appendChild(stopBtn);

    const clearBtn = this.createButton("🗑️ Clear", "#ff4444", "#440000");
    clearBtn.onclick = () => {
      if (window.WazgFrameThrower && confirm("Clear frames?")) window.WazgFrameThrower.clear();
    };
    controls.appendChild(clearBtn);
  },

  createButton: function(text, color, border) {
    const b = document.createElement("div");
    b.innerHTML = text;
    b.style.cssText = `background:#1a1a1a; border:2px solid ${border}; color:${color}; padding:10px 14px; border-radius:6px; cursor:pointer; text-align:center;`;
    b.onmouseover = () => b.style.background = "#222";
    b.onmouseout = () => b.style.background = "#1a1a1a";
    return b;
  },

  createSliderBox: function(label, min, max, defaultVal, onChange) {
    const box = document.createElement("div");
    box.style.cssText = `background:#1a1a1a; border:2px solid #ffcc00; padding:8px 12px; border-radius:6px; color:#ffcc00;`;
    box.innerHTML = `
      ${label}: <span id="${label.toLowerCase()}-val">${defaultVal}</span><br>
      <input type="range" id="${label.toLowerCase()}-slider" 
             min="${min}" max="${max}" value="${defaultVal}" step="10" style="width:100%;">
    `;

    const slider = box.querySelector("input");
    const valueSpan = box.querySelector("span");

    slider.oninput = () => {
      const val = parseInt(slider.value);
      valueSpan.textContent = val;
      if (onChange) onChange(val);
    };

    return box;
  }
};
