// =============================================
// WazgLayout.js - Refactored Button System
// =============================================

window.WazgLayout = {
  currentFPS: 10,

  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    const controls = document.createElement("div");
    controls.style.cssText = `
      position: absolute; top: 15px; left: 15px; z-index: 250;
      display: flex; flex-direction: column; gap: 9px; min-width: 210px;
    `;
    workspace.appendChild(controls);

    // Button Definitions (Clean & Centralized)
    const buttons = [
      {
        text: "🎞️ Generate Frames",
        color: "#00ff88",
        borderColor: "#004400",
        action: () => {
          if (window.WazgFrameThrower) {
            const prompt = prompt("Base prompt for frames:", "cybernetic biomechanical warrior, dynamic pose");
            if (prompt) window.WazgFrameThrower.throwFrames(prompt, 10);
          }
        }
      },
      {
        text: "▶️ Play Animation",
        color: "#ffcc00",
        borderColor: "#442200",
        action: () => {
          if (window.WazgFrameThrower) window.WazgFrameThrower.playAnimation(this.currentFPS);
        }
      },
      {
        text: "⏹️ Stop Animation",
        color: "#ff6666",
        borderColor: "#440000",
        action: () => {
          if (window.WazgFrameThrower) window.WazgFrameThrower.stopAnimation();
        }
      },
      {
        text: "🌗 Toggle Theme",
        color: "#ffcc00",
        borderColor: "#664400",
        action: () => {
          if (window.WazgTheme) window.WazgTheme.toggle();
        }
      },
      {
        text: "🔄 Bezier Morph",
        color: "#ff88ff",
        borderColor: "#660066",
        action: () => {
          if (window.WazgPathMorph) {
            const start = "M 200 300 Q 300 150 450 280 Q 520 380 400 480 Z";
            const end = "M 180 320 L 340 180 L 490 290 L 410 470 L 260 430 Z";
            window.WazgPathMorph.morph(start, end, 1400);
          }
        }
      },
      {
        text: "🌐 3D Orbit View",
        color: "#88ccff",
        borderColor: "#224466",
        action: () => {
          if (window.WazgThree) {
            if (window.WazgThree.container.style.display === "block") {
              window.WazgThree.hide();
            } else {
              window.WazgThree.show();
              if (window.WazgThree.scene.children.length === 0) window.WazgThree.addTestObject();
            }
          }
        }
      }
    ];

    // Create all buttons using shared factory
    buttons.forEach(btnConfig => {
      const btn = WazgUI.createButton(btnConfig.text, {
        color: btnConfig.color,
        borderColor: btnConfig.borderColor,
        onClick: btnConfig.action
      });
      controls.appendChild(btn);
    });

    safeLog("UI", "WazgLayout initialized with refactored button handlers");
  }
};
