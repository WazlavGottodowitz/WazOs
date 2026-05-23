// In deiner init-Funktion innerhalb von WazgManager.js:
init: function() {
  const modules = Object.keys(window).filter(k => k.startsWith("isg_"));
  
  // DAS IST DEIN PATCH-RACK:
  // Hier bestimmst du die FX-Reihenfolge.
  const chain = [
    'isg_001_guard', 
    'isg_002_rig_processor', 
    'isg_005_zappel_fx'
  ];
  
  this.pipeline = chain.map(name => window[name]).filter(p => p);
  this.pipeline.forEach(p => { if (p.init) p.init(this); });
  
  if (window.WazgLogcat) window.WazgLogcat.log("SYSTEM", "VST-Pipeline geladen: Guard -> Rig -> Zappel");
},
