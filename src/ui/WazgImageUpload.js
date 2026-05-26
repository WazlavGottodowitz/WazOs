// =============================================
// WazgImageUpload.js - Modular Image Upload Plugin
// =============================================

window.WazgImageUpload = {
  init: function() {
    if (window.WazgLogcat) {
      window.WazgLogcat.log("UPLOAD", "Image Upload Plugin initialized");
    }
  },

  // Create upload button and input
  createUploadButton: function(container, onSuccess) {
    const uploadBtn = document.createElement("div");
    uploadBtn.innerHTML = "📤 Upload Image";
    uploadBtn.style.cssText = `
      background:#1a1a1a; border:2px solid #00aaff; color:#00ccff;
      padding:10px 14px; border-radius:6px; cursor:pointer; text-align:center;
    `;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";

    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (window.WazgLogcat) window.WazgLogcat.log("UPLOAD", `Uploading: ${file.name}`);

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        
        if (onSuccess) {
          onSuccess({
            url: imageUrl,
            name: file.name,
            size: file.size,
            type: file.type
          });
        }

        if (window.WazgLogcat) window.WazgLogcat.log("UPLOAD", "Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    };

    container.appendChild(uploadBtn);
    container.appendChild(fileInput); // hidden
  },

  // Use uploaded image as Frame 0
  useAsFrame0: function(imageData) {
    const svg = document.getElementById("waz-svg-canvas");
    if (!svg) return;

    svg.innerHTML = `
      <image href="${imageData.url}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice"/>
      <text x="30" y="40" fill="#00ff88" font-size="18" font-weight="bold">FRAME 0 - ${imageData.name}</text>
    `;

    if (window.WazgLogcat) window.WazgLogcat.log("FRAME", `Frame 0 set from upload: ${imageData.name}`);
  }
};
