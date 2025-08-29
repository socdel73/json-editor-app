import React, { useEffect, useState } from "react";
import DynamicForm from "./components/DynamicForm";

const AppManager: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `${window.location.origin}/editor/api/files`
        );
        if (response.ok) {
          const files = await response.json();
          setAvailableFiles(files);
        } else {
          console.error("Error al obtener la lista de archivos.");
        }
      } catch (error) {
        console.error(
          "No se pudo conectar al servidor para obtener la lista de archivos.",
          error
        );
      } finally {
        setLoadingFiles(false);
      }
    };
    fetchFiles();
  }, []);

  const handleEditExisting = (selectedFile: string) => {
    setFileName(selectedFile);
  };

  const handleCreateNew = () => {
    if (newFileName.trim()) {
      setFileName(
        newFileName.endsWith(".json") ? newFileName : `${newFileName}.json`
      );
    }
  };

  const handleBack = () => {
    setFileName(null);
  };

  if (fileName) {
    return (
      <div>
        <button onClick={handleBack} style={{ marginBottom: "20px" }}>
          &lt; Volver al menú
        </button>
        <DynamicForm fileName={fileName} key={fileName} />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Bienvenido al Editor de JSON</h2>
      <p>Selecciona una opción:</p>

      {loadingFiles ? (
        <p>Cargando lista de archivos...</p>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          <h3>Editar un archivo existente</h3>
          <select
            onChange={(e) => handleEditExisting(e.target.value)}
            style={{ padding: "8px", marginRight: "10px" }}
          >
            <option value="">Seleccionar un archivo...</option>
            {availableFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <h3>Crear un nuevo archivo</h3>
        <input
          type="text"
          placeholder="Nombre del archivo (ej: SONY_VENICE_2)"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          style={{ width: "300px", padding: "10px" }}
        />
        <button
          onClick={handleCreateNew}
          style={{ padding: "10px 20px", marginLeft: "10px" }}
        >
          Crear nuevo
        </button>
      </div>
    </div>
  );
};

export default AppManager;
