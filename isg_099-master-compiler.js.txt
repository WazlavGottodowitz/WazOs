export default class MasterPromptCompiler {
  constructor() {
    this.metadata = { name: "Master Synthesis Matrix", id: "wazg_master_compiler" };
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    
    const rigName = (packet.rigProfile || "unassigned").toUpperCase();
    const frameData = packet.activeFrame || 0;
    
    // Check if an image was uploaded, and apply the Rig Application Weight
    const rigAnchorStatus = packet.frame1Image 
      ? `[RIG ANCHOR: Lock underlying anatomy to source image with strict structural weight of ${packet.fxRigWeight.toFixed(2)}]` 
      : `[RIG ANCHOR: Free-form generation, no image lock]`;

    // Extract the FX Mutation data we generated in plugin 006
    const fxData = packet.appliedMutationEffects || "";

    // Compile the final un-truncatable Master String
    const compiledOutputString = [
      `MASTER SUBJECT: ${packet.prompt || "Entity"}`,
      `[Structure: ${rigName} mechanical/biological hybrid array]`,
      `[Timeline: Kinematic phase frame ${frameData}]`,
      rigAnchorStatus,
      fxData, // Inserts the fluid/morph text here
      `[Aesthetic Override: Gritty dirty cartoon, severe high-contrast, fully realized physics]`
    ].filter(Boolean).join("\n");

    context.terminal(`COMPILER SUCCESS: Payload finalized and sent to Oracle Output.`);
    
    // Returns the final text string to the Oracle Output Box
    return compiledOutputString;
  }
}