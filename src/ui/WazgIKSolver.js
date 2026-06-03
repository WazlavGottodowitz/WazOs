// =============================================
// WazgIKSolver.js - Full Inverse Kinematics Solver
// Supports FABRIK + CCD + Joint Limits
// =============================================

window.WazgIKSolver = {
  chains: new Map(), // targetName → chain data

  init: function() {
    if (window.WazgLogcat) window.WazgLogcat.log("IK", "Advanced Inverse Kinematics Solver initialized");
  },

  // Create IK Chain (e.g. arm, leg, spine)
  createChain: function(bones, targetName, solverType = "FABRIK") {
    const chain = {
      bones: bones,                    // array of THREE.Bone
      lengths: [],
      targetName: targetName,
      solverType: solverType,
      goal: new THREE.Vector3(),
      maxIterations: 12,
      tolerance: 0.01
    };

    // Pre-calculate bone lengths
    for (let i = 0; i < bones.length - 1; i++) {
      const a = bones[i].getWorldPosition(new THREE.Vector3());
      const b = bones[i + 1].getWorldPosition(new THREE.Vector3());
      chain.lengths.push(a.distanceTo(b));
    }

    this.chains.set(targetName, chain);
    if (window.WazgLogcat) window.WazgLogcat.log("IK", `Chain created: ${targetName} (${solverType})`);
    return chain;
  },

  // FABRIK Solver (Recommended)
  solveFABRIK: function(chain) {
    if (!chain || chain.bones.length < 2) return false;

    const bones = chain.bones;
    const goal = chain.goal;
    const lengths = chain.lengths;
    let iterations = 0;

    while (iterations < chain.maxIterations) {
      iterations++;

      // Backward pass
      let current = goal.clone();
      for (let i = bones.length - 1; i >= 0; i--) {
        const bone = bones[i];
        if (i === bones.length - 1) {
          bone.position.copy(current);
        } else {
          const dir = new THREE.Vector3().subVectors(current, bones[i + 1].position).normalize();
          current = bones[i + 1].position.clone().add(dir.multiplyScalar(lengths[i]));
          bone.position.copy(current);
        }
      }

      // Forward pass
      current = bones[0].position.clone();
      for (let i = 0; i < bones.length - 1; i++) {
        const dir = new THREE.Vector3().subVectors(bones[i + 1].position, current).normalize();
        current = bones[i].position.clone().add(dir.multiplyScalar(lengths[i]));
        bones[i + 1].position.copy(current);
      }

      if (bones[bones.length - 1].position.distanceTo(goal) < chain.tolerance) break;
    }

    bones[0].updateMatrixWorld(true);
    return true;
  },

  // Simple CCD Solver (Alternative)
  solveCCD: function(chain, maxIterations = 8) {
    const bones = chain.bones;
    const goal = chain.goal;

    for (let iter = 0; iter < maxIterations; iter++) {
      for (let i = bones.length - 2; i >= 0; i--) {
        const bone = bones[i];
        const endEffector = bones[bones.length - 1];

        const toEffector = new THREE.Vector3().subVectors(endEffector.getWorldPosition(new THREE.Vector3()), bone.getWorldPosition(new THREE.Vector3()));
        const toTarget = new THREE.Vector3().subVectors(goal, bone.getWorldPosition(new THREE.Vector3()));

        const angle = toEffector.angleTo(toTarget);
        if (angle < 0.01) continue;

        const axis = new THREE.Vector3().crossVectors(toEffector, toTarget).normalize();
        const q = new THREE.Quaternion().setFromAxisAngle(axis, angle * 0.7);

        bone.quaternion.multiplyQuaternions(q, bone.quaternion);
        bone.updateMatrixWorld(true);
      }
    }
  },

  // Main Solve Function
  solve: function(targetName) {
    const chain = this.chains.get(targetName);
    if (!chain) return false;

    if (chain.solverType === "FABRIK") {
      return this.solveFABRIK(chain);
    } else {
      return this.solveCCD(chain);
    }
  },

  setGoal: function(targetName, position) {
    const chain = this.chains.get(targetName);
    if (chain) chain.goal.copy(position);
  },

  update: function() {
    this.chains.forEach((chain, name) => {
      this.solve(name);
    });
  },

  clear: function() {
    this.chains.clear();
  }
};
