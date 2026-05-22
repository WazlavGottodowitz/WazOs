// =============================================
// WazgLayout.js - UI Layer (Emoji Controls)
// =============================================

window.WazgLayout = {
  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "Workspace element not found!");
      return;
    }

    if (window.WazgLogcat) {
      window.WazgLogcat.log("UI", "WazgLayout initialized - Mobile-first Emoji Controls loaded.");
    }

    // Container for controls (z-index above SVG)
    const controls = document.createElement("div");
    controls.style.cssText = `
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 200;
      display: flex;
      flex-direction: column;
      gap: 8px;
      user-select: none;
    `;
    workspace.appendChild(controls);

    // === ADD JOINT BUTTON ===
    const addBtn = this.createButton("🦾 ADD JOINT", "#00ff00", "#004400");
    addBtn.onclick = () => {
      if (window.WazgManager) {
        const rx = Math.floor(Math.random() * 280) + 80;
        const ry = Math.floor(Math.random() * 280) + 80;
        
        window.WazgManager.dispatch('ADD_NODE', {
          id: "JOINT_" + String(Math.floor(Math.random() * 9999)).padStart(4, '0'),
          x: rx,
          y: ry
        });
      }
    };
    controls.appendChild(addBtn);

    // === UNDO BUTTON ===
    const undoBtn = this.createButton("↩️ UNDO", "#ffcc00", "#442200");
    undoBtn.onclick = () => {
      if (window.WazgManager) {
        window.WazgManager.dispatch('UNDO');
      }
    };
    controls.appendChild(undoBtn);

    // === CLEAR WORKSPACE BUTTON ===
    const clearBtn = this.createButton("🗑️ CLEAR ALL", "#ff4444", "#440000");
    clearBtn.onclick = () => {
      if (window.WazgManager) {
        if (confirm("Wirklich den gesamten Workspace löschen?")) {
          window.WazgManager.dispatch('CLEAR_WORKSPACE');
        }
      }
    };
    controls.appendChild(clearBtn);

    // === Status Indicator ===
    const status = document.createElement("div");
    status.style.cssText = `
      margin-top: 12px;
      font-size: 10px;
      color: #008800;
      background: rgba(0,0,0,0.6);
      padding: 4px 8px;
      border: 1px solid #004400;
      border-radius: 4px;
    `;
    status.textContent = "wazOS Biomech Ready";
    controls.appendChild(status);
  },

  // Helper: Create styled emoji button
  createButton: function(label, color, borderColor) {
    const btn = document.createElement("div");
    btn.innerHTML = label;
    btn.style.cssText = `
      background: #1a1a1a;
      border: 2px solid ${borderColor};
      color: ${color};
      font-family: 'Courier New', monospace;
      font-size: 14px;
      padding: 10px 16px;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(0, 255, 0, 0.2);
      transition: all 0.1s ease;
      min-width: 140px;
      text-align: center;
    `;

    btn.onmouseover = () => {
      btn.style.background = "#222";
      btn.style.boxShadow = "0 0 12px rgba(0, 255, 0, 0.4)";
    };
    btn.onmouseout = () => {
      btn.style.background = "#1a1a1a";
      btn.style.boxShadow = "0 0 8px rgba(0, 255, 0, 0.2)";
    };

    return btn;
  }
};
