// =============================================
// WazgJointLimits.js - Biomechanical Joint Constraints
// =============================================

window.WazgJointLimits = {
  limits: {},

  init: function() {
    this.defineDefaultLimits();
    if (window.WazgLogcat) window.WazgLogcat.log("RIG", "Joint Angle Limits system active");
  },

  defineDefaultLimits: function() {
    this.limits = {
      // Spine
      spine: { min: -25, max: 35 },      // forward/back
      chest: { min: -20, max: 30 },

      // Head
      neck: { min: -40, max: 45 },
      head: { min: -35, max: 35 },

      // Arms
      leftShoulder: { 
        x: { min: -80, max: 100 },   // abduction
        y: { min: -90, max: 90 },    // flexion
        z: { min: -60, max: 60 }     // rotation
      },
      leftElbow: { min: 0, max: 145 },   // flexion

      rightShoulder: { 
        x: { min: -80, max: 100 },
        y: { min: -90, max: 90 },
        z: { min: -60, max: 60 }
      },
      rightElbow: { min: 0, max: 145 },

      // Legs
      leftHip: { 
        x: { min: -60, max: 120 },
        y: { min: -45, max: 45 },
        z: { min: -30, max: 30 }
      },
      leftKnee: { min: 0, max: 140 },

      rightHip: { 
        x: { min: -60, max: 120 },
        y: { min: -45, max: 45 },
        z: { min: -30, max: 30 }
      },
      rightKnee: { min: 0, max: 140 }
    };
  },

  // Apply limits to a bone
  clampJoint: function(boneName, quaternion) {
    const limit = this.limits[boneName];
    if (!limit) return quaternion;

    const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');

    if (limit.x) {
      euler.x = Math.max(limit.x.min * Math.PI/180, Math.min(limit.x.max * Math.PI/180, euler.x));
    }
    if (limit.y) {
      euler.y = Math.max(limit.y.min * Math.PI/180, Math.min(limit.y.max * Math.PI/180, euler.y));
    }
    if (limit.z) {
      euler.z = Math.max(limit.z.min * Math.PI/180, Math.min(limit.z.max * Math.PI/180, euler.z));
    }
    if (typeof limit.min === 'number') {
      euler.y = Math.max(limit.min * Math.PI/180, Math.min(limit.max * Math.PI/180, euler.y));
    }

    return new THREE.Quaternion().setFromEuler(euler);
  },

  // Apply limits to entire rig
  applyToRig: function(rig) {
    if (!rig || !rig.bones) return;

    Object.keys(rig.bones).forEach(boneName => {
      const bone = rig.bones[boneName];
      if (bone && bone.quaternion) {
        bone.quaternion.copy(this.clampJoint(boneName, bone.quaternion));
      }
    });
  },

  // Debug: Show current joint angles
  debugJoint: function(boneName) {
    const bone = window.WazgBipedRig?.bones[boneName];
    if (!bone) return;

    const euler = new THREE.Euler().setFromQuaternion(bone.quaternion, 'YXZ');
    const degrees = {
      x: (euler.x * 180 / Math.PI).toFixed(1),
      y: (euler.y * 180 / Math.PI).toFixed(1),
      z: (euler.z * 180 / Math.PI).toFixed(1)
    };

    if (window.WazgLogcat) {
      window.WazgLogcat.log("RIG", `${boneName}: ${degrees.x}° / ${degrees.y}° / ${degrees.z}°`);
    }
  }
};
