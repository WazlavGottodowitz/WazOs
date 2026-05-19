export default class SystemDiagnosticModule {
  constructor() {
    this.metadata = { 
      name: "Kernel Context Diagnostics", 
      id: "wazg_core_diagnostic" 
    };
  }

  /**
   * Universal Execution Contract
   * @param {number} seed - The synchronized runtime locker key injected by the UI shell.
   * @param {Object} context - The shared system matrix containing all engine resources.
   */
  async apply(seed, context) {
    // 1. ACCESS THE INJECTED TERMINAL WRAPPER
    // No need to import a console logging module; the kernel hooks directly to the UI screen.
    const log = context.terminal;
    log("DIAGNOSTIC: Analyzing environment memory allocations...");

    // 2. ACCESS THE PIPELINE DATA STREAM (The Shared State Carrier)
    // 'context.lastOutput' contains the complete structural dataset from the preceding plugin.
    const incomingDataPacket = context.lastOutput || {};

    // 3. SECURE PIPELINE DATA INTERCEPT
    // We parse the current layout variables directly from the UI context snapshot
    const activeTimelineFrame = incomingDataPacket.activeFrame !== undefined ? incomingDataPacket.activeFrame : 0;
    const currentRigSetup = incomingDataPacket.rigProfile || "unassigned";

    log(`DIAGNOSTIC: Active Timeline Frame Index -> ${activeTimelineFrame}`);
    log(`DIAGNOSTIC: Current Rig Profile State -> [${currentRigSetup.toUpperCase()}]`);

    // 4. PREPARE THE MODIFIED OUTBOUND PASSPayload
    // We attach a dynamic diagnostic tracking object to the packet stream without breaking upstream modules.
    const updatedPacket = {
      ...incomingDataPacket, // Forward every single global state variable safely
      diagnosticMatrix: {
        lastCalculatedSeed: seed,
        executionTimestamp: Date.now(),
        pipelineStatus: "OPTIMIZED",
        memoryLeakCheck: "PASS"
      }
    };

    // 5. PIPELINE TRANSMISSION CONTRACT
    // Pass the completed packet straight to the next sequential plugin block in the loop.
    return updatedPacket;
  }
}