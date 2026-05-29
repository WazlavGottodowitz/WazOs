// =============================================
// WazgProcedural.js - Procedural Animation System
// =============================================

window.WazgProcedural = {
  animations: new Map(),   // name → animation data
  time: 0,

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("PROC", "Procedural Animation Engine loaded");
  },

  // 1. Sine Wave Breathing / Idle
  addBreathing: function(rig, speed = 1.2, intensity = 0.08) {
    const anim = {
      type: "breathing",
      update: (delta) => {
        this.time += delta * speed;
        const breathe = Math.sin(this.time) * intensity;
        if (rig.bones.chest) rig.bones.chest.scale.setScalar(1 + breathe);
        if (rig.bones.spine) rig.bones.spine.position.y = breathe * 0.3;
      }
    };
    this.animations.set("breathing", anim);
  },

  // 2. Head Look At (Procedural)
  addLookAt: function(rig, targetObject) {
    const anim = {
      type: "lookat",
      update: () => {
        if (rig.bones.head && targetObject) {
          rig.bones.head.lookAt(targetObject.position);
          // Clamp neck rotation
          if (window.WazgJointLimits) window.WazgJointLimits.clampJoint("neck", rig.bones.head.quaternion);
        }
      }
    };
    this.animations.set("lookat", anim);
  },

  // 3. Procedural Walking Cycle
  addWalkCycle: function(rig, speed = 1.8, stride = 0.4) {
    const anim = {
      type: "walk",
      phase: 0,
      update: (delta) => {
        this.phase += delta * speed;
        const leftLeg = Math.sin(this.phase) * stride;
        const rightLeg = Math.sin(this.phase + Math.PI) * stride;

        if (rig.bones.leftKnee) rig.bones.leftKnee.rotation.x = leftLeg * 1.2;
        if (rig.bones.rightKnee) rig.bones.rightKnee.rotation.x = rightLeg * 1.2;

        if (rig.bones.leftHip) rig.bones.leftHip.rotation.x = leftLeg * 0.6;
        if (rig.bones.rightHip) rig.bones.rightHip.rotation.x = rightLeg * 0.6;
      }
    };
    this.animations.set("walk", anim);
  },

  // 4. Perlin Noise Based Organic Movement
  addOrganicSway: function(rig, intensity = 0.5) {
    let noiseTime = 0;
    const anim = {
      update: (delta) => {
        noiseTime += delta * 0.8;
        const sway = Math.sin(noiseTime) * intensity * 0.3;

        if (rig.bones.spine) rig.bones.spine.rotation.z = sway;
        if (rig.bones.head) rig.bones.head.rotation.z = sway * 0.6;
      }
    };
    this.animations.set("organic", anim);
  },

  update: function(delta = 0.016) {
    this.animations.forEach(anim => {
      if (anim.update) anim.update(delta);
    });
  },

  clear: function() {
    this.animations.clear();
  }
};
