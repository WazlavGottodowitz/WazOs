window.WazgIKSystem = {
  rigs: new Map(),

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("IK", "Integrated IK System ready");
  },

  createBipedRig: function(name) {
    const rig = { name: name, bones: {} };
    this.rigs.set(name, rig);
    return rig;
  }
};
