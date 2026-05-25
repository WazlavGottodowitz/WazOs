<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>wazOS Mobile Engine</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body, html { width: 100%; height: 100%; background: #050505; color: #00ff00; font-family: monospace; overflow: hidden; touch-action: manipulation; }
    #waz-container { display: flex; flex-direction: column; width: 100vw; height: 100vh; }
    #waz-header { display: flex; align-items: center; background: #111; border-bottom: 1px solid #222; padding: 5px 10px; height: 35px; font-size: 11px; gap: 10px; }
    .guide-label { color: #ffaa00; cursor: pointer; display: flex; align-items: center; font-size: 14px; }
    #chk-guide { margin-right: 3px; cursor: pointer; accent-color: #ffaa00; }
    .ticker-wrapper { flex: 1; overflow: hidden; white-space: nowrap; position: relative; color: #888; }
    #ticker-text { display: block; padding-left: 5px; font-size: 11px; color: #00ffaa; }
    #waz-workspace { flex: 1; position: relative; background: #0a0a0a; overflow: hidden; width: 100%; }
    #waz-svg-canvas { display: block; width: 100%; height: 100%; }
    #waz-terminal { height: 100px; background: #000; border-top: 2px solid #222; padding: 6px; font-size: 11px; overflow-y: auto; color: #ffcc00; box-shadow: inset 0 5px 15px rgba(0,0,0,0.8); }
    #waz-terminal-text { line-height: 1.4; word-break: break-all; }
  </style>
</head>
<body>

  <div id="waz-container">
    <div id="waz-header">
      <label class="guide-label">
        <input type="checkbox" id="chk-guide" checked onchange="toggleGuide()"> 🧠
      </label>
      <div class="ticker-wrapper">
        <div id="ticker-text">wazOS v66.0 • Mobile Architecture v2</div>
      </div>
    </div>

    <div id="waz-workspace">
      <svg id="waz-svg-canvas" width="100%" height="100%"></svg>
    </div>

    <div id="waz-terminal">
      <div id="waz-terminal-text">> (BOOT) Starte Core-Injektion...</div>
    </div>
  </div>

  <script>
    const repoUser = "wazlavgottodowitz";
    const repoName = "WazOs";
    const branch   = "main";

    function safeLog(type, msg) {
      const term = document.getElementById("waz-terminal-text");
      if (!term) return;
      const time = new Date().toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
      term.innerHTML += `(${time}) |${type}| ${msg}<br>`;
      term.scrollTop = term.scrollHeight;
      
      // Begrenzung auf 25 Zeilen wegen Mobile-Performance
      const lines = term.innerHTML.split("<br>");
      if (lines.length > 25) {
        lines.shift();
        term.innerHTML = lines.join("<br>");
      }
    }

    // Globaler Logcat Bridge-Fallback, falls Module loggen wollen bevor das echte Logcat geladen ist
    window.WazgLogcat = { log: function(t, m) { safeLog(t, m); } };
    window.WazgManager = { registerStub: function(n) { safeLog("SYS", `Modul ${n} im RAM registriert.`); } };

    async function loadModule(path) {
      const cacheBust = Math.floor(Date.now() / 60000); // 1 Minute Cache-Bypass
      const url = `https://cdn.jsdelivr.net/gh/${repoUser}/${repoName}@${branch}/${path}?v=${cacheBust}`;
      
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const code = await response.text();
        const script = document.createElement("script");
        script.text = code;
        document.head.appendChild(script);
        
        // Versuche das Modul nach Injektion zu initialisieren
        const moduleName = path.split('/').pop().replace('.js', '');
        if (window[moduleName] && typeof window[moduleName].init === "function") {
          window[moduleName].init();
        }
      } catch (e) {
        safeLog("ERROR", `Fehler beim Laden von ${path}: ${e.message}`);
      }
    }

    async function bootSystem() {
      // WICHTIG: Hier sind alle Module in der korrekten Reihenfolge registriert!
      const modules = [
        "src/core/WazgLogcat.js",
        "src/core/WazgAnatomy.js",
        "src/core/WazgFrameThrower.js", // <-- Der neue Motor!
        "src/ui/WazgLayout.js"          // <-- Die neue Oberfläche!
      ];

      for (const path of modules) {
        await loadModule(path);
        await new Promise(r => setTimeout(r, 200)); // sanfter Delay
      }

      safeLog("SYSTEM", "Mobile boot completed. wazOS einsatzbereit.");
    }

    function toggleGuide() {
      const t = document.getElementById('ticker-text');
      if (t) t.style.display = document.getElementById('chk-guide').checked ? "block" : "none";
    }

    document.addEventListener("DOMContentLoaded", bootSystem);
  </script>
</body>
</html>
