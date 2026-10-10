/**
 * isg_004b-neural-gait.js
 * WazOs neural gait with audio beat sync integration
 * 
 * Now accepts beat timing from audio module and derives motion from rhythm
 */

export default class AdvancedNeuralGait {
  constructor() {
    this.metadata = { name: "Neural Gait Interpolation Axis", id: "wazg_neural_gait" };
  }

  async apply(seed, context) {
    const incomingPacket = context.lastOutput || {};
    
    // Extract beat sync data if available
    const beatSync = incomingPacket.beatSync || {};
    const beatGrid = incomingPacket.beatGrid || [];
    const loopSelection = incomingPacket.loopSelection || {};
    const audioBpm = incomingPacket.audioBpm || 120;

    // Determine frame index from beat timing or use standard frame index
    let frameIndex = incomingPacket.activeFrame ?? 0;
    
    if (beatGrid.length > 0 && beatSync.currentTime !== undefined) {
      // Derive frame from beat position within loop
      const loopStart = loopSelection.start || 0;
      const loopEnd = loopSelection.end || 8;
      const loopDuration = loopEnd - loopStart;
      
      if (loopDuration > 0 && beatSync.currentTime >= loopStart && beatSync.currentTime <= loopEnd) {
        const positionInLoop = (beatSync.currentTime - loopStart) / loopDuration;
        frameIndex = Math.floor(positionInLoop * beatGrid.length);
      }
    }

    const currentProfile = incomingPacket.rigProfile || "pentapod";
    
    // COMPUTE HIGH-TORQUE ROTATIONAL MOMENTUM (The "Tougher" Vector)
    // Commercial tools smoothing softens the impact; we amplify the physics math.
    const rawTimePhase = (frameIndex % 720) / 720;
    
    // Scale motion intensity by beat energy if available
    let motionScale = incomingPacket.linearMagnitude || 15;
    if (beatSync.beat && beatSync.beat.energy) {
      motionScale *= (1 + beatSync.beat.energy * 0.6);
    }

    const highVelocityImpact = Math.sin(rawTimePhase * Math.PI * 16) * motionScale;
    const angularWarpForce = Math.cos(rawTimePhase * Math.PI * 8) * (incomingPacket.vortexTorque || 0);

    // DETECT CORE KEYFRAME ANCHORS (Audio-Locked)
    let structuralAnchorState = "Inter-Frame Interpolation Continuous";
    let imageWeightBias = 0.0;

    if (frameIndex === 0 || frameIndex === 1) {
      structuralAnchorState = incomingPacket.frame1Image 
        ? "CRITICAL: Hard-Locking onto Frame 1 Uploaded Image Baseline Assets" 
        : "No Frame 1 Image Loaded. Generating from pure procedural math.";
      imageWeightBias = incomingPacket.frame1Image ? 1.0 : 0.0;
    } else {
      // Decay calculation, but influenced by beat stability
      const baseFade = Math.max(0.0, 1.0 - (frameIndex / 45));
      
      if (beatSync.loopActive) {
        // Inside loop: maintain stronger anchor
        imageWeightBias = baseFade * (0.8 + beatSync.beat?.energy * 0.2 || 0.8);
      } else {
        // Outside loop: standard decay
        imageWeightBias = baseFade;
      }
    }

    // COMPILE RE-ENGINEERED ROUGH STYLISTIC ATTRIBUTES
    const grittyStyleToken = "dirty cartoon styling, explicit high-contrast lines, highly detailed textured elements, un-smoothed mechanical physics weight";

    // Add audio-reactive styling
    let audioStyleModifier = "";
    if (beatSync.mode === "loop-locked") {
      audioStyleModifier = ", rhythmic pulse-driven morphing, beat-locked kinematic transitions";
    } else if (beatSync.beatDetected) {
      audioStyleModifier = ", dynamic beat-reactive energy, temporal phase alignment";
    }

    const neuralPacket = {
      ...incomingPacket,
      neuralEngineMeta: {
        anchorStatus: structuralAnchorState,
        frameWeightBias: parseFloat(imageWeightBias.toFixed(3)),
        appliedGrittyTokens: grittyStyleToken + audioStyleModifier,
        beatSyncActive: !!beatSync.mode,
        beatSyncMode: beatSync.mode || "free-run"
      },
      vectorCalculations: {
        impactVelocity: parseFloat(highVelocityImpact.toFixed(4)),
        torsionWarp: parseFloat(angularWarpForce.toFixed(4)),
        cyclePhaseProgress: parseFloat(rawTimePhase.toFixed(6)),
        audioInfluence: beatSync.beat?.energy ? parseFloat((beatSync.beat.energy * 0.8).toFixed(4)) : 0
      },
      audioBpmLocked: audioBpm,
      activeFrameDerived: frameIndex
    };

    context.terminal(`NEURAL GAIT: Frame ${frameIndex} [Anchor: ${imageWeightBias.toFixed(2)} | Beat: ${beatSync.beatDetected ? "YES" : "NO"} | Mode: ${beatSync.mode || "free"}]`);
    
    return neuralPacket;
  }
}
