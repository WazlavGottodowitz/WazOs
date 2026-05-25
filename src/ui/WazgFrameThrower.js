// wazOS - WazgFrameThrower.js (Core Animation Engine)
window.WazgFrameThrower = {
    isStub: false,
    isRunning: false,
    frameBuffer: [],
    maxParallel: 2,
    fadeDuration: 280,
    easingType: "ease-in-out",
    animationTimer: null,

    init: function() {
        if (window.WazgLogcat && typeof window.WazgLogcat.log === "function") {
            window.WazgLogcat.log("FRAME", "FrameThrower mit regelbarer Interpolation geladen.");
        }
    },

    throwFrames: async function(basePrompt, frameCount = 8) {
        if (this.isRunning) return [];
        this.isRunning = true;
        this.frameBuffer = [];

        if (window.WazgLogcat) window.WazgLogcat.log("FRAME", `Generiere ${frameCount} Frames...`);

        const results = [];
        for (let i = 0; i < frameCount; i += this.maxParallel) {
            const batch = [];
            const end = Math.min(i + this.maxParallel, frameCount);
            for (let j = i; j < end; j++) {
                batch.push(this.fetchImage(basePrompt, j));
            }
            const batchResults = await Promise.all(batch);
            results.push(...batchResults);
            this.frameBuffer.push(...batchResults);
        }

        this.isRunning = false;
        if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "Frame-Generierung abgeschlossen.");
        return results;
    },

    fetchImage: async function(basePrompt, index) {
        try {
            const seed = Date.now() + index * 73;
            const url = `https://picsum.photos/id/${(seed % 900) + 100}/800/600`;
            await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
            return { frame: index, url: url, prompt: basePrompt };
        } catch (e) {
            return { frame: index, url: `https://picsum.photos/800/600?random=${Date.now()}`, prompt: basePrompt };
        }
    },

    playAnimation: function(fps = 10) {
        this.stopAnimation();
        if (this.frameBuffer.length < 2) return;

        const svg = document.getElementById("waz-svg-canvas");
        if (!svg) return;

        let index = 0;
        const intervalTime = 1000 / fps;

        if (window.WazgLogcat) window.WazgLogcat.log("FRAME", `Starte Loop mit ${fps} FPS.`);

        this.animationTimer = setInterval(() => {
            const frameData = this.frameBuffer[index];
            // SVG-Update Logik
            let imgElement = svg.getElementById("waz-anim-target");
            if (!imgElement) {
                imgElement = document.createElementNS("http://www.w3.org/2000/svg", "image");
                imgElement.setAttribute("id", "waz-anim-target");
                imgElement.setAttribute("width", "100%");
                imgElement.setAttribute("height", "100%");
                svg.appendChild(imgElement);
            }
            imgElement.setAttributeNS("http://www.w3.org/1999/xlink", "href", frameData.url);
            imgElement.style.transition = `all ${this.fadeDuration}ms ${this.getTransitionEasing()}`;

            index = (index + 1) % this.frameBuffer.length;
        }, intervalTime);
    },

    stopAnimation: function() {
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
            if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "Loop gestoppt.");
        }
    },

    clear: function() {
        this.stopAnimation();
        this.frameBuffer = [];
        const svg = document.getElementById("waz-svg-canvas");
        if (svg) svg.innerHTML = "";
        if (window.WazgLogcat) window.WazgLogcat.log("FRAME", "Buffer geleert.");
    },

    setEasing: function(val) {
        this.easingType = val;
    },

    getTransitionEasing: function() {
        if (this.easingType === "ease-out-back") return "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        return this.easingType;
    }
};

if (window.WazgManager) window.WazgManager.registerStub("WazgFrameThrower");
