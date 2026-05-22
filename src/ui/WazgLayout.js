window.WazgLayout = {
  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("UI", "Lade mobiles Layout & Hitboxes...");
    }
    
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) {
      if (window.WazgLogcat) window.WazgLogcat.log("ERROR", "Workspace nicht gefunden!");
      return;
    }

    // Erstelle den ersten modularen Emoji-Button
    const actionBtn = document.createElement("div");
    actionBtn.innerHTML = "🦾 INIT";
    actionBtn.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      background: #222;
      border: 2px solid #00ff00;
      color: #00ff00;
      font-size: 16px;
      padding: 10px 15px;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
    `;

    actionBtn.onclick = () => {
      if (window.WazgLogcat) {
        window.WazgLogcat.log("ACTION", "Emoji-Button 'INIT' ausgelöst!");
      }
      // Hier triggern wir später WazgAnatomy oder WazgManager
    };

    workspace.appendChild(actionBtn);
  }
};
