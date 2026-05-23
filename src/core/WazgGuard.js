<script src="src/core/WazgLogcat.js"></script>
  <script src="src/core/WazgGuard.js"></script> 
  <script src="src/core/WazgManager.js"></script>
  <script src="src/core/WazgAnatomy.js"></script>
  <script src="src/ui/WazgLayout.js"></script>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      try {
        if (window.WazgLogcat) window.WazgLogcat.log("BOOT", "Module geladen. Starte Zündung...");
        
        if (window.WazgGuard) window.WazgGuard.init();    // NEU HINZUGEFÜGT
        if (window.WazgManager) window.WazgManager.init();
        if (window.WazgAnatomy) window.WazgAnatomy.init();
        if (window.WazgLayout) window.WazgLayout.init();
        
        if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "WazOs erfolgreich gebootet. Bereit für Input.");
      } catch (error) {
        console.error(error);
        const term = document.getElementById("waz-terminal-text");
        if(term) term.innerHTML += `\n<span class="log-alert">🚨 KERNEL-PANIK: ${error.message}</span>`;
      }
    });
  </script>

</body>
</html>
