// Formats kept as-is: SVG (vector) and GIF (may be animated).
const PASSTHROUGH_MIME = new Set(["image/svg+xml", "image/gif"]);

export const IMAGE_ACTION_BODY_SIZE_LIMIT = 25 * 1024 * 1024;
export const IMAGE_ACTION_MULTIPART_OVERHEAD = 4 * 1024;
export const MAX_IMAGE_UPLOAD_BYTES = IMAGE_ACTION_BODY_SIZE_LIMIT - IMAGE_ACTION_MULTIPART_OVERHEAD;

const WEBP_QUALITIES = [0.92, 0.82, 0.72, 0.62, 0.52, 0.42, 0.34, 0.28];
const MIN_DIMENSION = 480;

// Re-encode raster images to WebP in the browser, reducing quality and
// dimensions until it fits the upload action limit when possible.
export async function compressImageToWebp(file: File): Promise<File> {
  if (PASSTHROUGH_MIME.has(file.type) || !file.type.startsWith("image/")) return file;

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    try {
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
    } catch {
      return file;
    }
  }

  const w = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const h = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  if (!w || !h) return file;

  if (file.size <= MAX_IMAGE_UPLOAD_BYTES) {
    const blob = await encodeWebp(bitmap, w, h, WEBP_QUALITIES[0]);
    if ("close" in bitmap) bitmap.close();
    return blob && blob.size < file.size ? webpFile(file, blob) : file;
  }

  let bestBlob: Blob | null = null;
  let uploadableBlob: Blob | null = null;
  let width = w;
  let height = h;

  for (let attempt = 0; attempt < 10; attempt++) {
    for (const quality of WEBP_QUALITIES) {
      const blob = await encodeWebp(bitmap, width, height, quality);
      if (!blob) continue;
      if (!bestBlob || blob.size < bestBlob.size) bestBlob = blob;
      if (blob.size <= MAX_IMAGE_UPLOAD_BYTES) {
        uploadableBlob = blob;
        break;
      }
    }

    if (uploadableBlob) break;
    if (Math.min(width, height) <= MIN_DIMENSION || !bestBlob) break;

    const targetScale = Math.sqrt(MAX_IMAGE_UPLOAD_BYTES / bestBlob.size) * 0.95;
    const scale = Math.min(0.82, Math.max(0.55, targetScale));
    const minScale = MIN_DIMENSION / Math.min(width, height);
    const nextScale = Math.max(scale, minScale);
    width = Math.round(width * nextScale);
    height = Math.round(height * nextScale);
  }

  if ("close" in bitmap) bitmap.close();

  if (uploadableBlob) return webpFile(file, uploadableBlob);
  if (!bestBlob) return file;

  return webpFile(file, bestBlob);
}

async function encodeWebp(
  bitmap: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined") {
    try {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
      return await canvas.convertToBlob({ type: "image/webp", quality });
    } catch {
      return null;
    }
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
    return await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  } catch {
    return null;
  }
}

function webpFile(source: File, blob: Blob): File {
  const base = source.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${base}.webp`, { type: "image/webp", lastModified: source.lastModified || Date.now() });
}

// Estimate multipart request payload size before the action rejects the request.
export function estimateActionBodySize(file: File): number {
  return file.size + IMAGE_ACTION_MULTIPART_OVERHEAD;
}

// Returns true for formats intentionally uploaded without browser re-encoding.
export function isPassthroughImageType(file: File): boolean {
  return PASSTHROUGH_MIME.has(file.type);
}

// Format bytes for status text: "512 B" / "1.5 KB" / "2.40 MB".
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
