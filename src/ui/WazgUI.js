// =============================================
// WazgUI.js - Shared UI Components
// =============================================

window.WazgUI = {
  createButton: function(text, options = {}) {
    const { color = "#00ff88", borderColor = "#004400", onClick = null, size = "normal" } = options;
    const btn = document.createElement("div");
    btn.innerHTML = text;
    btn.style.cssText = `
      background:#1a1a1a; border:2px solid ${borderColor}; color:${color};
      padding:${size==="small"?"7px 10px":"10px 14px"}; border-radius:6px;
      cursor:pointer; text-align:center; transition:all 0.1s;
    `;
    btn.onmouseover = () => btn.style.background = "#222";
    btn.onmouseout = () => btn.style.background = "#1a1a1a";
    if (onClick) btn.onclick = onClick;
    return btn;
  },

  createSlider: function(label, min, max, defaultVal, onChange, options = {}) {
    const { step = 1, unit = "", color = "#ffcc00", showReset = true } = options;
    const container = document.createElement("div");
    container.style.cssText = `background:#1a1a1a; border:2px solid ${color}; padding:8px 12px; border-radius:6px; color:${color};`;

    container.innerHTML = `
      ${label}: <strong id="val-${label.toLowerCase().replace(/\s/g,'')}">${defaultVal}${unit}</strong><br>
      <input type="range" id="slider-${label.toLowerCase().replace(/\s/g,'')}" 
             min="${min}" max="${max}" value="${defaultVal}" step="${step}" style="width:100%;">
    `;

    const slider = container.querySelector("input");
    const span = container.querySelector("strong");

    slider.oninput = () => {
      const val = parseFloat(slider.value);
      span.textContent = val + unit;
      if (onChange) onChange(val);
    };

    return container;
  }
};
