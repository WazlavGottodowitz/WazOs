// =============================================
// WazgPoseLibrary.js - Fixed Bone References
// Consistent with WazgBipedRig.js
// =============================================

window.WazgPoseLibrary = {
  poses: {},

  init: function() {
    this.defineStandardPoses();
    if (window.WazgLogcat) {
      window.WazgLogcat.log("POSE", "Pose Library loaded with fixed bone references");
    }
  },

  defineStandardPoses: function() {
    this.poses = {

      // === IDLE POSES ===
      "idle_neutral": {
        spine1: { x: 0, y: 0, z: 0 },
        spine2: { x: 5, y: 0, z: 0 },
        neck: { x: 8, y: 0, z: 0 },
        head: { x: 5, y: 0, z: 0 },
        leftShoulder: { x: 10, y: -15, z: 5 },
        rightShoulder: { x: 10, y: 15, z: -5 }
      },

      "idle_breathing": {
        spine1: { x: 3, y: 0, z: 0 },
        spine2: { x: 8, y: 0, z: 0 }
      },

      // === LOCOMOTION ===
      "walk_cycle": {
        leftHip: { x: 25, y: 0, z: 0 },
        rightHip: { x: -25, y: 0, z: 0 },
        leftKnee: { x: 45, y: 0, z: 0 },
        rightKnee: { x: 15, y: 0, z: 0 },
        leftFoot: { x: -20, y: 0, z: 0 },
        rightFoot: { x: 10, y: 0, z: 0 }
      },

      "run_cycle": {
        leftHip: { x: 45, y: 0, z: 0 },
        rightHip: { x: -45, y: 0, z: 0 },
        leftKnee: { x: 80, y: 0, z: 0 },
        rightKnee: { x: 30, y: 0, z: 0 }
      },

      // === COMBAT ===
      "combat_stance": {
        spine1: { x: 15, y: 0, z: 0 },
        leftShoulder: { x: -30, y: -40, z: 20 },
        rightShoulder: { x: -30, y: 40, z: -20 },
        leftElbow: { x: 60, y: 0, z: 0 },
        rightElbow: { x: 60, y: 0, z: 0 }
      },

      "punch_right": {
        rightShoulder: { x: -40, y: 60, z: -30 },
        rightElbow: { x: 20, y: 0, z: 0 },
        spine2: { x: 12, y: -25, z: 0 }
      },

      // === UTILITY ===
      "crouch": {
        spine1: { x: 35, y: 0, z: 0 },
        leftHip: { x: 80, y: 0, z: 0 },
        rightHip: { x: 80, y: 0, z: 0 },
        leftKnee: { x: 110, y: 0, z: 0 },
        rightKnee: { x: 110, y: 0, z: 0 }
      },

      "sit": {
        spine1: { x: 40, y: 0, z: 0 },
        leftHip: { x: 90, y: 0, z: 0 },
        rightHip: { x: 90, y: 0, z: 0 },
        leftKnee: { x: 100, y: 0, z: 0 },
        rightKnee: { x: 100, y: 0, z: 0 }
      },

      "reach_forward": {
        leftShoulder: { x: -20, y: -30, z: 10 },
        leftElbow: { x: 30, y: 0, z: 0 },
        rightShoulder: { x: -20, y: 30, z: -10 },
        rightElbow: { x: 30, y: 0, z: 0 }
      }
    };
  },

  applyPose: function(rigName, poseName) {
    const rig = window.WazgIKSystem?.rigs.get(rigName);
    if (!rig || !this.poses[poseName]) {
      if (window.WazgLogcat) window.WazgLogcat.log("POSE", `Pose "${poseName}" not found for rig "${rigName}"`);
      return false;
    }

    const pose = this.poses[poseName];
    let appliedCount = 0;

    Object.keys(pose).forEach(boneName => {
      const bone = rig.bones[boneName];
      if (bone) {
        const rot = pose[boneName];
        bone.rotation.set(
          (rot.x || 0) * Math.PI / 180,
          (rot.y || 0) * Math.PI / 180,
          (rot.z || 0) * Math.PI / 180
        );
        appliedCount++;
      }
    });

    if (window.WazgJointLimits) window.WazgJointLimits.applyToRig(rig);

    if (window.WazgLogcat) {
      window.WazgLogcat.log("POSE", `Applied pose "${poseName}" to "${rigName}" (${appliedCount} bones)`);
    }
    return true;
  },

  getPoseList: function() {
    return Object.keys(this.poses);
  }
};
