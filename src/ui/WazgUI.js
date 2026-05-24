// =============================================
// WazgUI.js - Shared Modular UI Components
// =============================================

window.WazgUI = {
  // Consistent Button Creator
  createButton: function(text, options = {}) {
    const {
      color = "#00ff88",
      borderColor = "#004400",
      background = "#1a1a1a",
      onClick = null,
      size = "normal"
    } = options;

    const btn = document.createElement("div");
    btn.innerHTML = text;
    
    btn.style.cssText = `
      background: ${background};
      border: 2px solid ${borderColor};
      color: ${color};
      font-family: 'Courier New', monospace;
      font-size: ${size === "small" ? "11px" : "13px"};
      padding: ${size === "small" ? "7px 10px" : "10px 14px"};
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
      transition: all 0.1s ease;
      user-select: none;
    `;

    btn.onmouseover = () => {
      btn.style.background = "#222";
      btn.style.boxShadow = "0 0 12px rgba(0, 255, 0, 0.4)";
    };
    btn.onmouseout = () => {
      btn.style.background = background;
      btn.style.boxShadow = "0 0 8px rgba(0, 255, 0, 0.2)";
    };

    if (onClick) btn.onclick = onClick;

    return btn;
  },

  // Consistent Slider Creator
  createSlider: function(label, min, max, defaultValue, onChange, options = {}) {
    const { step = 1, unit = "", color = "#ffcc00" } = options;

    const container = document.createElement("div");
    container.style.cssText = `
      background: #1a1a1a;
      border: 2px solid ${color};
      padding: 8px 12px;
      border-radius: 6px;
      color: ${color};
    `;

    container.innerHTML = `
      ${label}: <span id="slider-val-${label.toLowerCase().replace(/\s/g,'')}">${defaultValue}${unit}</span><br>
      <input type="range" id="slider-${label.toLowerCase().replace(/\s/g,'')}" 
             min="${min}" max="${max}" value="${defaultValue}" step="${step}" 
             style="width:100%; accent-color:${color};">
    `;

    const slider = container.querySelector("input");
    const valueSpan = container.querySelector("span");

    slider.oninput = () => {
      const val = parseFloat(slider.value);
      valueSpan.textContent = val + unit;
      if (onChange) onChange(val);
    };

    return container;
  }
};
