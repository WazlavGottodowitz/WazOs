export default class FluidMutationEngine {
  constructor() {
    this.metadata = { name: "FX Matrix: Fluid & Morph", id: "wazg_fx_mutation" };
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    
    // Only apply if the user actually used the sliders
    if (packet.fxViscosity > 0 || packet.fxMorph > 0) {
      
      let mutationTokens = [];
      
      // Calculate Viscosity (Melting/Fluidity)
      if (packet.fxViscosity > 0) {
        const meltLevel = packet.fxViscosity > 0.7 ? "extreme phase-shifting liquid flesh" : "semi-viscous structural boundary melting";
        mutationTokens.push(`[FLUID DYNAMICS: ${meltLevel}, non-newtonian physics material, liquid metal dripping, viscosity coefficient ${packet.fxViscosity.toFixed(2)}]`);
      }

      // Calculate Morphing Interpolation (Entity transitioning)
      if (packet.fxMorph > 0) {
        mutationTokens.push(`[ALGORITHMIC MORPH: latent space subject transitioning, chimerical biological blending, algorithmic structure recalculation, morph state ${packet.fxMorph.toFixed(2)}]`);
      }

      // Append FX data to the packet for the Master Compiler to read
      packet.appliedMutationEffects = mutationTokens.join(", ");
      context.terminal(`FX LAB: Fluid mutation and morph matrices injected.`);
    } else {
      packet.appliedMutationEffects = "[FX MATRIX: Stable physical bounds, no mutation]";
    }

    return packet;
  }
}