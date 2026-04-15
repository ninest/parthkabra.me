export function encodeContent(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
  return btoa(binString);
}

export function decodeContent(base64: string): string {
  const binString = atob(base64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binString, (c) => c.codePointAt(0)!);
  return new TextDecoder().decode(bytes);
}

export function fileToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const binString = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
  return btoa(binString);
}
