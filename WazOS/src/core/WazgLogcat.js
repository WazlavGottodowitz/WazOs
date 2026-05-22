window.WazgLogcat = {
    isStub: false,
    
    log: function(channel, message, type = "info") {
        const timestamp = new Date().toLocaleTimeString();
        let prefix = `[${timestamp}] [${channel}]`;
        
        if (type === "alert") prefix = `🚨 ${prefix}`;
        
        console.log(`${prefix} ${message}`);
        
        // Hier wird später der Text in dein HTML-Footer-Element gerendert
        const terminalOutput = document.getElementById("waz-terminal-text");
        if (terminalOutput) {
            const line = document.createElement("div");
            line.className = `log-${type}`;
            line.innerText = `${prefix} ${message}`;
            terminalOutput.appendChild(line);
            // Auto-Scroll nach unten
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    },
    
    verbose: function(channel, message) {
        this.log(channel, message, "info");
    },
    
    panic: function(channel, message) {
        this.log(channel, message, "alert");
        if(window.WazgGuide) {
            window.WazgGuide.triggerPanic(channel, message);
        }
    }
};