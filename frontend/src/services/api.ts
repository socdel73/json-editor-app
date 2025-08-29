export async function getFileContent(fileName: string) {
  const BASE = `${window.location.origin}/editor/api`;
  const response = await fetch(`${BASE}/file/${encodeURIComponent(fileName)}`);
  if (!response.ok) {
    throw new Error("Error loading file");
  }
  return await response.json();
}

export async function saveFileContent(fileName: string, content: any) {
  const BASE = `${window.location.origin}/editor/api`;
  const response = await fetch(`${BASE}/file/${encodeURIComponent(fileName)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content, null, 2),
  });
  if (!response.ok) {
    throw new Error("Error saving file");
  }
  return await response.json();
}

export async function getFileList(): Promise<string[]> {
  const BASE = `${window.location.origin}/editor/api`;
  const response = await fetch(`${BASE}/files`);
  if (!response.ok) {
    throw new Error("Error loading file list");
  }
  return await response.json();
}
