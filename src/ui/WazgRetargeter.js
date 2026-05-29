// =============================================
// WazgRetargeter.js - Skeletal Animation Retargeting
// =============================================

window.WazgRetargeter = {
  sourceSkeleton: null,
  targetSkeleton: null,
  boneMap: new Map(),

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("RETARGET", "Skeletal Retargeter initialized");
  },

  // Map source bones to target bones by name patterns
  createMapping: function(sourceBones, targetBones) {
    this.boneMap.clear();

    sourceBones.forEach(sourceBone => {
      const targetName = this.findBestMatch(sourceBone.name, targetBones);
      if (targetName) {
        this.boneMap.set(sourceBone.name, targetName);
      }
    });

    if (window.WazgLogcat) window.WazgLogcat.log("RETARGET", `Mapped ${this.boneMap.size} bones`);
  },

  findBestMatch: function(name, targetBones) {
    const lowerName = name.toLowerCase();
    for (let target of targetBones) {
      const t = target.name.toLowerCase();
      if (t.includes(lowerName) || lowerName.includes(t)) {
        return target.name;
      }
    }
    return null;
  },

  // Retarget a single frame of animation
  retargetPose: function(sourcePose, targetSkeleton) {
    sourcePose.traverse((sourceBone) => {
      const targetName = this.boneMap.get(sourceBone.name);
      if (!targetName) return;

      const targetBone = targetSkeleton.getObjectByName(targetName);
      if (targetBone) {
        targetBone.quaternion.copy(sourceBone.quaternion);
      }
    });
  },

  // Apply retargeted animation to mixer
  applyRetargetedAnimation: function(sourceClip, targetMixer, targetSkeleton) {
    const retargetedClip = sourceClip.clone();
    
    // Retarget keyframes
    retargetedClip.tracks.forEach(track => {
      const boneName = track.name.split('.')[0];
      const targetBoneName = this.boneMap.get(boneName);
      if (targetBoneName) {
        track.name = track.name.replace(boneName, targetBoneName);
      }
    });

    const action = targetMixer.clipAction(retargetedClip);
    action.play();
    return action;
  }
};
