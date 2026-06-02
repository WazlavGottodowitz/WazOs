export const generateImage = (typeof window.generateImage!== "undefined")? window.generateImage : null;
export const storage = (typeof window.storage!== "undefined")? window.storage : null;
export const imageUpload = (typeof window.imageUpload!== "undefined")? window.imageUpload : null;
export const date = (typeof window.date!== "undefined")? window.date : null;

export const pluginGuard = [generateImage, storage, imageUpload, date];
export const guardCheck = "{generateImage}";

if (!generateImage) console.warn("WazOS: Image plugin not found - check Perchance imports");
