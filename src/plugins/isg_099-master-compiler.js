/**
 * isg_099-master-compiler.js
 * WazOs master synthesis with audio beat sync integration
 * 
 * Combines continuity, motion, and audio rhythm into final prompt
 */

export default class MasterPromptCompiler {
  constructor() {
    this.metadata = { name: "Master Synthesis Matrix", id: "wazg_master_compiler" };
  }

  async apply(seed, context) {
    const packet = context.lastOutput || {};
    
    const rigName = (packet.rigProfile || "unassigned").toUpperCase();
    const frameData = packet.activeFrameDerived ?? packet.activeFrame ?? 0;
    
    // Extract beat sync data
    const beatSync = packet.beatSync || {};
    const audioBpm = packet.audioBpmLocked || 120;
    const beatGrid = packet.beatGrid || [];
    const loopSelection = packet.loopSelection || {};
    
    // Check if an image was uploaded, and apply the Rig Application Weight
    const rigAnchorStatus = packet.frame1Image 
      ? `[RIG ANCHOR: Lock underlying anatomy to source image with strict structural weight of ${packet.fxRigWeight?.toFixed(2) || "0.85"}]` 
      : `[RIG ANCHOR: Free-form generation, no image lock]`;

    // Extract the FX Mutation data we generated in plugin 006
    const fxData = packet.appliedMutationEffects || "";

    // Build audio sync section
    let audioSyncSection = "";
    if (beatSync.mode) {
      const beatInfo = beatSync.beatDetected 
        ? `BPM ${audioBpm} | ${beatSync.beatCount} beats | Energy ${(beatSync.beat?.energy || 0).toFixed(3)}`
        : `BPM ${audioBpm} | awaiting beat detection`;
      
      const loopInfo = beatSync.loopActive 
        ? `Loop Active: ${(loopSelection.start || 0).toFixed(2)}s → ${(loopSelection.end || 8).toFixed(2)}s`
        : `Loop Inactive`;

      audioSyncSection = `\n[AUDIO SYNC: ${beatInfo}]\n[LOOP STATUS: ${loopInfo}]\n[SYNC MODE: ${beatSync.mode.toUpperCase()}]`;
    }

    // Compile the final un-truncatable Master String
    const compiledOutputString = [
      `MASTER SUBJECT: ${packet.prompt || "Entity"}`,
      `[Structure: ${rigName} mechanical/biological hybrid array]`,
      `[Timeline: Kinematic phase frame ${frameData}]`,
      rigAnchorStatus,
      fxData,
      audioSyncSection,
      `[Neural Gait: ${packet.neuralEngineMeta?.beatSyncActive ? "Audio-locked" : "Free-run"} | Anchor Weight: ${packet.neuralEngineMeta?.frameWeightBias?.toFixed(3) || "0.000"}]`,
      `[Aesthetic Override: Gritty dirty cartoon, severe high-contrast, fully realized physics${packet.neuralEngineMeta?.appliedGrittyTokens ? `, ${packet.neuralEngineMeta.appliedGrittyTokens}` : ""}]`,
      packet.neuralEngineMeta?.appliedGrittyTokens ? "" : ""
    ].filter(Boolean).join("\n");

    context.terminal(`COMPILER SUCCESS: Payload finalized with ${beatSync.beatCount || 0} beats. Oracle Output ready.`);
    
    // Returns the final text string to the Oracle Output Box
    return compiledOutputString;
  }
}
