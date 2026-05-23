window.WazgGuard = {
  // Biomechanische Limits
  MAX_BONE_LENGTH: 250,

  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("GUARD", "Anatomy Shield online. Knochen-Riss-Limit: 250px.");
    }
  },

  // Prüft, ob eine Bewegung legal ist
  isMoveLegal: function(nodeId, newX, newY, state) {
    // Finde alle Knochen (Connections), an denen dieser Knoten hängt
    const relatedConnections = state.connections.filter(c => c.source === nodeId || c.target === nodeId);

    for (let conn of relatedConnections) {
      // Finde den jeweiligen Partner-Knoten am anderen Ende des Knochens
      const partnerId = (conn.source === nodeId) ? conn.target : conn.source;
      const partnerNode = state.nodes.find(n => n.id === partnerId);

      if (partnerNode) {
        // Berechne die Distanz (Satz des Pythagoras)
        const dx = partnerNode.x - newX;
        const dy = partnerNode.y - newY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Wenn die Distanz das Limit überschreitet, blockiere die Bewegung
        if (distance > this.MAX_BONE_LENGTH) {
          if (window.WazgLogcat) window.WazgLogcat.log("ALERT", `Guard blockiert! Knochen würde bei ${Math.round(distance)}px reißen.`);
          return false;
        }
      }
    }
    
    return true; // Bewegung ist im legalen Rahmen
  }
};
