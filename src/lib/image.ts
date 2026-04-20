// Formats kept as-is: SVG (vector), GIF (may be animated), AVIF (already compact).
const PASSTHROUGH_MIME = new Set(["image/svg+xml", "image/gif", "image/avif"]);

// Re-encode raster images to WebP @ q=0.92 in the browser. Returns the
// original file for passthrough mimes, decode failures, or when the
// re-encoded blob isn't smaller than the source.
export async function compressImageToWebp(file: File): Promise<File> {
  if (PASSTHROUGH_MIME.has(file.type) || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    bitmap = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("decode failed"));
      };
      img.src = url;
    });
  }

  const w = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const h = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  if (!w || !h) return file;

  let blob: Blob | null = null;
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0);
    blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.92 });
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0);
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.92));
  }
  if (!blob) return file;

  // Keep original if WebP encoding didn't save space (happens on already-efficient JPEGs).
  if (blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.webp`, { type: "image/webp", lastModified: Date.now() });
}

// Format bytes for status text: "512 B" / "1.5 KB" / "2.40 MB".
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
