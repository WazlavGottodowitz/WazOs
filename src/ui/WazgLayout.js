window.WazgLayout = {
  init: function() {
    const workspace = document.getElementById("waz-workspace");
    if (!workspace) return;

    // Button: Knoten hinzufügen
    const addBtn = document.createElement("div");
    addBtn.innerHTML = "🦾 ADD JOINT";
    addBtn.style.cssText = "position:absolute; top:20px; left:20px; background:#222; border:2px solid #00ff00; color:#00ff00; padding:10px; cursor:pointer; font-family:monospace; z-index:100;";
    
    addBtn.onclick = () => {
      if (window.WazgManager) {
        // Schickt die Aktion an den Manager. Der Manager ändert den State. Die Anatomie zeichnet.
        window.WazgManager.dispatch('ADD_NODE', {
          id: "ARM_NODE_" + Math.floor(Math.random() * 1000),
          x: Math.floor(Math.random() * 300) + 100,
          y: Math.floor(Math.random() * 300) + 100
        });
      }
    };

    // Button: Alles löschen
    const clearBtn = document.createElement("div");
    clearBtn.innerHTML = "🗑️ CLEAR";
    clearBtn.style.cssText = "position:absolute; top:70px; left:20px; background:#222; border:2px solid #ff0000; color:#ff0000; padding:10px; cursor:pointer; font-family:monospace; z-index:100;";
    
    clearBtn.onclick = () => {
      if (window.WazgManager) {
        window.WazgManager.dispatch('CLEAR_WORKSPACE', null);
      }
    };

    workspace.appendChild(addBtn);
    workspace.appendChild(clearBtn);

    if (window.WazgLogcat) window.WazgLogcat.log("UI", "Emoji-Hitboxes geladen.");
  }
};
