// src/ui/WazgFABRIK.js
window.WazgFABRIK = {
  solve: function(bones, target, maxIterations = 12) {
    const positions = bones.map(b => b.getWorldPosition(new THREE.Vector3()));
    const lengths = [];

    for (let i = 0; i < bones.length - 1; i++) {
      lengths.push(positions[i].distanceTo(positions[i+1]));
    }

    let bestDist = Infinity;
    for (let iter = 0; iter < maxIterations; iter++) {
      // Backward
      positions[positions.length - 1].copy(target);
      for (let i = positions.length - 2; i >= 0; i--) {
        const dir = new THREE.Vector3().subVectors(positions[i], positions[i+1]).normalize();
        positions[i].copy(positions[i+1]).add(dir.multiplyScalar(lengths[i]));
      }

      // Forward
      positions[0].copy(bones[0].getWorldPosition(new THREE.Vector3()));
      for (let i = 0; i < positions.length - 1; i++) {
        const dir = new THREE.Vector3().subVectors(positions[i+1], positions[i]).normalize();
        positions[i+1].copy(positions[i]).add(dir.multiplyScalar(lengths[i]));
      }

      const currentDist = positions[positions.length - 1].distanceTo(target);
      if (currentDist < bestDist) bestDist = currentDist;
      if (currentDist < 0.01) break;
    }

    // Apply back to bones
    for (let i = 0; i < bones.length; i++) {
      if (i < bones.length - 1) {
        const dir = new THREE.Vector3().subVectors(positions[i+1], positions[i]).normalize();
        bones[i].lookAt(positions[i+1]);
      }
    }
  }
};
