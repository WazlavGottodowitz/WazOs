// =============================================
// WazgIKRetargeter.js - Inverse Kinematics Retargeting
// =============================================

window.WazgIKRetargeter = {
  chains: new Map(), // bone chains for IK

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("IK", "Inverse Kinematics Retargeter initialized");
  },

  // Create IK chain (e.g. arm: shoulder → elbow → hand)
  createChain: function(bones, targetBoneName) {
    const chain = {
      bones: bones,
      targetName: targetBoneName,
      goalPosition: new THREE.Vector3()
    };
    this.chains.set(targetBoneName, chain);
    return chain;
  },

  // Simple CCD (Cyclic Coordinate Descent) IK Solver
  solveCCD: function(chain, maxIterations = 8) {
    const gl = window.WazgThree?.scene; // assume Three.js is active
    if (!chain || chain.bones.length < 2) return;

    for (let iter = 0; iter < maxIterations; iter++) {
      for (let i = chain.bones.length - 2; i >= 0; i--) {
        const bone = chain.bones[i];
        const endEffector = chain.bones[chain.bones.length - 1];

        const toEffector = new THREE.Vector3().subVectors(endEffector.getWorldPosition(new THREE.Vector3()), bone.getWorldPosition(new THREE.Vector3()));
        const toTarget = new THREE.Vector3().subVectors(chain.goalPosition, bone.getWorldPosition(new THREE.Vector3()));

        const angle = toEffector.angleTo(toTarget);
        if (angle < 0.01) continue;

        const axis = new THREE.Vector3().crossVectors(toEffector, toTarget).normalize();
        const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle * 0.6); // damping

        bone.quaternion.multiplyQuaternions(quaternion, bone.quaternion);
        bone.updateMatrixWorld(true);
      }
    }
  },

  // Apply retargeting with IK adjustment
  retargetWithIK: function(sourceSkeleton, targetSkeleton) {
    if (!sourceSkeleton || !targetSkeleton) return;

    // Example: Retarget arm with IK
    const sourceArm = [sourceSkeleton.getObjectByName("LeftArm"), sourceSkeleton.getObjectByName("LeftForeArm"), sourceSkeleton.getObjectByName("LeftHand")];
    const targetArm = [targetSkeleton.getObjectByName("LeftArm"), targetSkeleton.getObjectByName("LeftForeArm"), targetSkeleton.getObjectByName("LeftHand")];

    if (sourceArm[2] && targetArm[2]) {
      const chain = this.createChain(targetArm, "LeftHand");
      chain.goalPosition.copy(sourceArm[2].getWorldPosition(new THREE.Vector3()));
      this.solveCCD(chain);
    }
  },

  update: function() {
    this.chains.forEach(chain => {
      this.solveCCD(chain, 4); // lighter iterations for real-time
    });
  }
};
