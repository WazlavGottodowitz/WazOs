// wazOS Anatomy - 13-Punkt Humanoid Rig-Definition
window.WazgAnatomy = {
    isStub: false,

    // Die 13 Kern-Gelenke (Joints)
    joints: {
        head:     { id: "head",     x: 200, y: 80,  name: "Kopf" },
        neck:     { id: "neck",     x: 200, y: 120, name: "Hals" },
        chest:    { id: "chest",    x: 200, y: 160, name: "Brust" },
        pelvis:   { id: "pelvis",   x: 200, y: 240, name: "Becken" },
        
        // Linker Arm (Mit Ellenbogen!)
        shoulder_L: { id: "shoulder_L", x: 150, y: 130, name: "Schulter_L" },
        elbow_L:    { id: "elbow_L",    x: 110, y: 150, name: "Ellbogen_L" },
        hand_L:     { id: "hand_L",     x: 70,  y: 170, name: "Hand_L" },
        
        // Rechter Arm (Mit Ellenbogen!)
        shoulder_R: { id: "shoulder_R", x: 250, y: 130, name: "Schulter_R" },
        elbow_R:    { id: "elbow_R",    x: 290, y: 150, name: "Ellbogen_R" },
        hand_R:     { id: "hand_R",     x: 330, y: 170, name: "Hand_R" },
        
        // Beine (Mit Knien!)
        knee_L:   { id: "knee_L",   x: 170, y: 320, name: "Knie_L" },
        foot_L:   { id: "foot_L",   x: 170, y: 400, name: "Fuss_L" },
        knee_R:   { id: "knee_R",   x: 230, y: 320, name: "Knie_R" },
        foot_R:   { id: "foot_R",   x: 230, y: 400, name: "Fuss_R" }
    },

    // Die Knochen-Verbindungen (Bones)
    bones: [
        { from: "head",       to: "neck" },
        { from: "neck",       to: "chest" },
        { from: "chest",      to: "pelvis" },
        
        // Linker Arm-Strang
        { from: "chest",      to: "shoulder_L" },
        { from: "shoulder_L", to: "elbow_L" },
        { from: "elbow_L",    to: "hand_L" },
        
        // Rechter Arm-Strang
        { from: "chest",      to: "shoulder_R" },
        { from: "shoulder_R", to: "elbow_R" },
        { from: "elbow_R",    to: "hand_R" },
        
        // Bein-Straenge
        { from: "pelvis",     to: "knee_L" },
        { from: "knee_L",     to: "foot_L" },
        { from: "pelvis",     to: "knee_R" },
        { from: "knee_R",     to: "foot_R" }
    ],

    init: function() {
        if(window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("ANATOMY", "13-Punkt Skelett-Struktur geladen (Inkl. Knie/Ellbogen).");
        }
    },

    getJoints: function() { return this.joints; },
    getBones: function() { return this.bones; }
};

if (window.WazgManager) {
    window.WazgManager.registerStub("WazgAnatomy");
}
