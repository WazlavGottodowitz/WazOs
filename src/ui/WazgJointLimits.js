window.WazgJointLimits = {
  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("RIG", "Joint Limits system active");
  },

  applyToRig: function(rig) {
    if (window.WazgLogcat) window.WazgLogcat.log("RIG", "Applied joint limits");
  }
};
