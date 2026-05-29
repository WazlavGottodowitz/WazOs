window.WazgUI = {
  createButton: function(text, options = {}) {
    const { color = "#00ff88", borderColor = "#004400", onClick = null } = options;
    const btn = document.createElement("div");
    btn.innerHTML = text;
    btn.style.cssText = `background:#1a1a1a; border:2px solid ${borderColor}; color:${color}; padding:10px 14px; border-radius:6px; cursor:pointer; text-align:center;`;
    btn.onmouseover = () => btn.style.background = "#222";
    btn.onmouseout = () => btn.style.background = "#1a1a1a";
    if (onClick) btn.onclick = onClick;
    return btn;
  }
};
