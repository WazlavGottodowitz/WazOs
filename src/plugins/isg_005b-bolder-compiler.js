export default class BolderPromptCompiler {
  constructor() {
    this.metadata = { name: "Bolder Prompt Synthesis Matrix", id: "wazg_bolder_compiler" };
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    
    if (!packet.vectorCalculations) {
      context.terminal("COMPILER WARN: Neural gait data absent. Falling back to default formatting.");
      return packet;
    }

    const physics = packet.vectorCalculations;
    const neural = packet.neuralEngineMeta;
    
    // 1. EXTRACT MECHANICAL RIG ATTRIBUTES
    const rigName = (packet.rigProfile || "pentapod").toUpperCase();
    const linearForce = packet.linearMagnitude || 0;
    const vortexForce = packet.vortexTorque || 0;

    // 2. CONSTRUCT MASSIVE UN-TRUNCATED GENERATION EXPRESSION
    const compiledOutputString = [
      `[Subject Structure: Massive hyper-stylized ${rigName} mechanical construct operating on continuous motion array]`,
      `[Kinematic Phase: Frame ${packet.activeFrame || 0} of 720, step cycle progress marker: ${physics.cyclePhaseProgress}]`,
      `[Kinematic Physics Vector Forces: directional linear impact velocity momentum = ${physics.impactVelocity}, rotational torsional warp angular stress profile = ${physics.torsionWarp}]`,
      `[Anatomy Sub-Rig Activations: Head=${packet.subRigs?.head}, Spine=${packet.subRigs?.spine}, Appendages=${packet.subRigs?.hands}]`,
      `[Image Reference Context Control Anchor Weight: ${neural.frameWeightBias} - Status: ${neural.anchorStatus}]`,
      `[Aesthetic Execution Blueprint: ${neural.appliedGrittyTokens}, extreme industrial atmosphere, razor-sharp vector definition, structural raw energy, completely uncompromised resolution parameters]`
    ].join(", ");

    context.terminal(`COMPILER SUCCESS: Master engineering string output generated successfully.`);
    
    // Return the raw compiled string block as the final output payload for the Perchance canvas
    return compiledOutputString;
  }
}