// --- PLUGINS (DO NOT DELETE) --- ANTI-SABOTEUR GUARD
export const generateImage = (typeof window.generateImage!== "undefined")? window.generateImage : null;
export const storage = (typeof window.storage!== "undefined")? window.storage : null;
export const date = (typeof window.date!== "undefined")? window.date : null;
export const generatorStats = (typeof window.generatorStats!== "undefined")? window.generatorStats : null;
export const generateText = (typeof window.generateText!== "undefined")? window.generateText : null;
export const downloadButton = (typeof window.downloadButton!== "undefined")? window.downloadButton : null;
export const commentSystem = (typeof window.commentSystem!== "undefined")? window.commentSystem : null;
export const faviconPlugin = (typeof window.faviconPlugin!== "undefined")? window.faviconPlugin : null;
export const imageUpload = (typeof window.imageUpload!== "undefined")? window.imageUpload : null;

export const _keepPlugins = [generateImage, storage, date, generatorStats, generateText, downloadButton, commentSystem, faviconPlugin, imageUpload];
export const _plugin_check = "{generateImage}";

if (!generateImage) console.warn("WazG-OS: Image plugin not found - check for saboteur");
