import React, { useEffect, useState } from "react";

const BASE = `${window.location.origin}/editor/api`;

type JsonValue = unknown;

export default function AppManager() {
  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [content, setContent] = useState<JsonValue | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // Llista de fitxers
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE}/files`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: string[] = await res.json();
        setFiles(data);
        if (data.length && !selected) setSelected(data[0]);
      } catch (err: any) {
        setMsg(`Error carregant llista: ${err.message || err}`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carregar contingut quan canvïa el fitxer seleccionat
  useEffect(() => {
    if (!selected) return;
    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await fetch(`${BASE}/file/${encodeURIComponent(selected)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setContent(data);
      } catch (err: any) {
        setMsg(`Error carregant fitxer: ${err.message || err}`);
        setContent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  const save = async () => {
    if (!selected) return;
    setMsg("");
    try {
      const res = await fetch(`${BASE}/file/${encodeURIComponent(selected)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content, null, 2),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMsg("Desat correctament ✅");
    } catch (err: any) {
      setMsg(`Error desant: ${err.message || err}`);
    }
  };

  const onTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const parsed = JSON.parse(e.target.value || "null");
      setContent(parsed);
      setMsg("");
    } catch {
      // No invalidem l’estat: només mostrem que el JSON no és vàlid
      setMsg("JSON no vàlid (revisa les cometes/comes)");
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      <h1>JSON Editor</h1>

      {msg && (
        <div
          style={{
            background: "#222",
            color: "#fff",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {msg}
        </div>
      )}

      <label>
        Fitxer:&nbsp;
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ minWidth: 280 }}
        >
          <option value="" disabled>
            — selecciona —
          </option>
          {files.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <div style={{ marginTop: 12 }}>
        <button onClick={save} disabled={!selected || loading}>
          Desar
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <textarea
          rows={24}
          style={{ width: "100%", fontFamily: "monospace" }}
          value={
            content === null ? "" : JSON.stringify(content, null, 2)
          }
          onChange={onTextChange}
          placeholder="Enganxa o edita JSON aquí…"
        />
      </div>
    </div>
  );
}
