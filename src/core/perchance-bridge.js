// ANTI-SABOTEUR GUARD - matches your existing git
export const generateImage = (typeof window.generateImage!== "undefined")? window.generateImage : null;
export const storage = (typeof window.storage!== "undefined")? window.storage : null;
export const date = (typeof window.date!== "undefined")? window.date : null;
export const generatorStats = (typeof window.generatorStats!== "undefined")? window.generatorStats : null;
export const imageUpload = (typeof window.imageUpload!== "undefined")? window.imageUpload : null;

export const _keepPlugins = [generateImage, storage, date, generatorStats, imageUpload];
export const _plugin_check = "{generateImage}";

if(!generateImage) console.warn("Image plugin not found - check top of file for saboteur");
