import { encodeContent, decodeContent } from "./base64";

const REPO_OWNER = "ninest";
const REPO_NAME = "parthkabra.me";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

async function ghFetch(token: string, path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}/${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "parthkabra.me-admin",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message || `GitHub API ${res.status}`), {
      status: res.status,
    });
  }
  return res.json();
}

export type DirEntry = { name: string; path: string; type: "file" | "dir" };
export type FileResult = { content: string; sha: string; path: string };

export async function listDirectory(token: string, path: string): Promise<DirEntry[]> {
  const data = await ghFetch(token, `contents/${path}`);
  if (!Array.isArray(data)) throw new Error(`${path} is not a directory`);
  return data.map((item: any) => ({
    name: item.name,
    path: item.path,
    type: item.type === "dir" ? ("dir" as const) : ("file" as const),
  }));
}

export async function getFile(token: string, path: string): Promise<FileResult> {
  const data = await ghFetch(token, `contents/${path}`);
  if (Array.isArray(data)) throw new Error(`${path} is a directory`);
  return {
    content: decodeContent(data.content),
    sha: data.sha,
    path: data.path,
  };
}

export async function saveFile(
  token: string,
  path: string,
  content: string,
  sha?: string,
  message?: string,
): Promise<{ sha: string }> {
  const body: Record<string, string> = {
    message: message || (sha ? `Update ${path}` : `Create ${path}`),
    content: encodeContent(content),
  };
  if (sha) body.sha = sha;

  const data = await ghFetch(token, `contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { sha: data.content.sha };
}

export async function uploadImage(
  token: string,
  path: string,
  base64Data: string,
  message?: string,
): Promise<{ path: string }> {
  const data = await ghFetch(token, `contents/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message || `Upload ${path.split("/").pop()}`,
      content: base64Data,
    }),
  });
  return { path: data.content.path };
}

/**
 * Try to list a directory, returning empty array on 404.
 */
export async function listDirectorySafe(token: string, path: string): Promise<DirEntry[]> {
  try {
    return await listDirectory(token, path);
  } catch (e: any) {
    if (e.status === 404) return [];
    throw e;
  }
}
