/** Resize a base64 JPEG (no data: prefix) to a thumbnail data URL for storage.
 *  640px/0.78 keeps back-label text (small print, appellation info) legible
 *  while staying well within reason for a JSON-embedded data URI — roughly
 *  10x the pixels of the old 200px/0.6 default, still only tens of KB. */
export function resizeImageForStorage(base64: string, maxDim = 640, quality = 0.78): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width, h = img.height;
      if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
      else { w = Math.round(w * maxDim / h); h = maxDim; }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };
    img.onerror = () => resolve("");
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}
