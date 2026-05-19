export default class AdvancedNeuralGait {
  constructor() {
    this.metadata = { name: "Neural Gait Interpolation Axis", id: "wazg_neural_gait" };
  }

  async apply(seed, context) {
    const incomingPacket = context.lastOutput || {};
    
    // Safely extract coordinates from our underlying structure
    const frameIndex = incomingPacket.activeFrame !== undefined ? incomingPacket.activeFrame : 0;
    const currentProfile = incomingPacket.rigProfile || "pentapod";
    
    // 1. COMPUTE HIGH-TORQUE ROTATIONAL MOMENTUM (The "Tougher" Vector)
    // Commercial tools smoothing softens the impact; we amplify the physics math.
    const rawTimePhase = (frameIndex % 720) / 720;
    const highVelocityImpact = Math.sin(rawTimePhase * Math.PI * 16) * (incomingPacket.linearMagnitude || 15);
    const angularWarpForce = Math.cos(rawTimePhase * Math.PI * 8) * (incomingPacket.vortexTorque || 0);

    // 2. DETECT CORE KEYFRAME ANCHORS (Image-to-Image Tracking)
    let structuralAnchorState = "Inter-Frame Interpolation Continuous";
    let imageWeightBias = 0.00;

    if (frameIndex === 0 || frameIndex === 1) {
      structuralAnchorState = incomingPacket.frame1Image ? "CRITICAL: Hard-Locking onto Frame 1 Uploaded Image Baseline Assets" : "No Frame 1 Image Loaded. Generating from pure procedural math.";
      imageWeightBias = incomingPacket.frame1Image ? 1.00 : 0.00;
    } else {
      // Linear decay calculation mapping how far we are from the uploaded image anchor
      imageWeightBias = Math.max(0.0, 1.0 - (frameIndex / 45)); 
    }

    // 3. COMPILE RE-ENGINEERED ROUGH STYLISTIC ATTRIBUTES
    // We append harsh, stylized formatting prompts directly to circumvent generic commercial models.
    const grittyStyleToken = "dirty cartoon styling, explicit high-contrast lines, highly detailed textured elements, un-smoothed mechanical physics weight";

    const neuralPacket = {
      ...incomingPacket,
      neuralEngineMeta: {
        anchorStatus: structuralAnchorState,
        frameWeightBias: parseFloat(imageWeightBias.toFixed(3)),
        appliedGrittyTokens: grittyStyleToken
      },
      vectorCalculations: {
        impactVelocity: parseFloat(highVelocityImpact.toFixed(4)),
        torsionWarp: parseFloat(angularWarpForce.toFixed(4)),
        cyclePhaseProgress: parseFloat(rawTimePhase.toFixed(6))
      }
    };

    context.terminal(`NEURAL GAIT: Frame ${frameIndex} Computed [Anchor Weight: ${imageWeightBias.toFixed(2)} | Motion Phase: ${rawTimePhase.toFixed(3)}]`);
    return neuralPacket;
  }
}