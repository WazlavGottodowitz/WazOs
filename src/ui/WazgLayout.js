window.WazgLayout = {
  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    const controls = document.createElement("div");
    controls.style.cssText = `position:absolute; top:15px; left:15px; z-index:250; display:flex; flex-direction:column; gap:9px; min-width:210px;`;
    workspace.appendChild(controls);

    const buttons = [
      { text: "🎞️ Generate Frames", action: () => window.WazgFrameThrower?.throwFrames("biomechanical character", 8) },
      { text: "▶️ Play", action: () => window.WazgFrameThrower?.playAnimation(12) },
      { text: "⏹️ Stop", action: () => window.WazgFrameThrower?.stopAnimation() },
      { text: "🌗 Theme", action: () => window.WazgTheme?.toggle() },
      { text: "🦴 Pose Idle", action: () => window.WazgPoseLibrary?.applyPose("player", "idle_neutral") }
    ];

    buttons.forEach(b => {
      const btn = WazgUI.createButton(b.text, { onClick: b.action });
      controls.appendChild(btn);
    });

    if (window.WazgLogcat) window.WazgLogcat.log("UI", "Main Layout initialized");
  }
};
