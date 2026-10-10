export default class BeatAwareNeuralGait {
  constructor() {
    this.metadata = {
      name: "Beat-Aware Neural Gait Interpolation",
      id: "wazg_beat_aware_gait"
    };
  }

  async apply(seed, context) {
    const incomingPacket = context.lastOutput || {};

    // Get beat sync data if available
    const beatSync = incomingPacket.beatSync || {};
    const audioActiveFrame = incomingPacket.audioActiveFrame ?? 0;
    const audioBpm = incomingPacket.audioBpm ?? 120;
    const beatDetected = beatSync.beatDetected ?? false;

    // Use audio frame if beat sync is active, otherwise use regular frame
    const frameIndex = beatSync.mode === "loop-locked" ? audioActiveFrame : (incomingPacket.activeFrame ?? 0);
    const currentProfile = incomingPacket.rigProfile || "pentapod";

    // Motion driven by BPM when beat sync is active
    const bpmFactor = beatSync.mode === "loop-locked" ? (audioBpm / 120) : 1.0;
    const rawTimePhase = (frameIndex % 720) / 720;
    const highVelocityImpact = Math.sin(rawTimePhase * Math.PI * 16 * bpmFactor) * ((incomingPacket.linearMagnitude || 15) * bpmFactor);
    const angularWarpForce = Math.cos(rawTimePhase * Math.PI * 8 * bpmFactor) * ((incomingPacket.vortexTorque || 0) * bpmFactor);

    // Anchor state
    let structuralAnchorState = "Inter-Frame Interpolation Continuous";
    let imageWeightBias = 0.0;

    if (frameIndex === 0 || frameIndex === 1) {
      structuralAnchorState = incomingPacket.frame1Image 
        ? "CRITICAL: Hard-Locking onto Frame 1 Uploaded Image Baseline Assets" 
        : "No Frame 1 Image Loaded. Generating from pure procedural math.";
      imageWeightBias = incomingPacket.frame1Image ? 1.0 : 0.0;
    } else {
      imageWeightBias = Math.max(0.0, 1.0 - (frameIndex / 45));
    }

    // Beat-aware continuity boost
    let continuityBoost = 1.0;
    if (beatSync.mode === "loop-locked" && beatDetected) {
      continuityBoost = 1.2; // Stronger anchor lock on beat detection
    }

    const grittyStyleToken = "dirty cartoon styling, explicit high-contrast lines, highly detailed textured elements, un-smoothed mechanical physics weight";

    const neuralPacket = {
      ...incomingPacket,
      neura lEngineMeta: {
        anchorStatus: structuralAnchorState,
        frameWeightBias: parseFloat(imageWeightBias.toFixed(3)),
        appliedGrittyTokens: grittyStyleToken,
        beatSyncActive: beatSync.mode === "loop-locked",
        bpmFactor: parseFloat(bpmFactor.toFixed(3))
      },
      vectorCalculations: {
        impactVelocity: parseFloat(highVelocityImpact.toFixed(4)),
        torsionWarp: parseFloat(angularWarpForce.toFixed(4)),
        cyclePhaseProgress: parseFloat(rawTimePhase.toFixed(6)),
        beatContinuityBoost: parseFloat(continuityBoost.toFixed(3))
      
