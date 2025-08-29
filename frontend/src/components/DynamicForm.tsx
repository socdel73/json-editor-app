import React, { useEffect, useState } from "react";
import { getFileContent, saveFileContent } from "../services/api";
import { jsonTemplate } from "../template";

// Usaremos esta interfaz para tipar el estado de los datos, aunque es genérica
interface DataObject {
  [key: string]: any;
}

interface DynamicFormProps {
  fileName: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fileName }) => {
  const [data, setData] = useState<DataObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const fileData = await getFileContent(fileName);
      if (fileData) {
        setData(fileData);
      } else {
        // Si el archivo no se encuentra, usamos la plantilla
        console.log(
          "Archivo no encontrado, usando plantilla para un nuevo archivo."
        );
        setData(jsonTemplate[0]); // Usamos el primer elemento de la plantilla
      }
      setLoading(false);
    };
    fetchData();
  }, [fileName]);

  // Función recursiva para crear una plantilla vacía de un objeto o array
  const getInitialItem = (templateItem: any): any => {
    if (templateItem === null || typeof templateItem !== "object") {
      // Es un valor simple, devuelve un valor por defecto
      if (typeof templateItem === "string") return "";
      if (typeof templateItem === "number") return 0;
      if (Array.isArray(templateItem)) return [];
      return null;
    }

    // Si es un array
    if (Array.isArray(templateItem)) {
      // Si el array no está vacío, crea una plantilla para el primer elemento
      const templateArrayItem =
        templateItem.length > 0 ? getInitialItem(templateItem[0]) : {};
      return [templateArrayItem];
    }

    // Si es un objeto
    const newItem: any = {};
    for (const key in templateItem) {
      if (Object.prototype.hasOwnProperty.call(templateItem, key)) {
        newItem[key] = getInitialItem(templateItem[key]);
      }
    }
    return newItem;
  };

  const handleInputChange = (path: string, value: any) => {
    const newData = { ...data };
    let current: any = newData;
    const parts = path.split(".");

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = typeof current === "object" ? {} : [];
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
    setData(newData);
  };

  // Lógica para añadir un nuevo elemento a un array
  const handleAddItem = (path: string) => {
    const newData = { ...data };
    let current: any = newData;
    const parts = path.split(".");

    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    const arrayKey = parts[parts.length - 1];
    const arrayToUpdate = current[arrayKey];

    const templateItem = arrayToUpdate.length > 0 ? arrayToUpdate[0] : null;
    const newItem = getInitialItem(templateItem);

    const newArray = [...arrayToUpdate, newItem];
    current[arrayKey] = newArray;
    setData(newData);
  };

  // Lógica para eliminar un elemento de un array
  const handleRemoveItem = (path: string) => {
    const newData = { ...data };
    let current: any = newData;
    const parts = path.split(".");
    const indexToRemove = parseInt(parts.pop() || "0");
    const arrayKey = parts.pop() || "";

    for (const part of parts) {
      current = current[part];
    }

    const newArray = [...current[arrayKey]];
    newArray.splice(indexToRemove, 1);
    current[arrayKey] = newArray;
    setData(newData);
  };

  const getBreadcrumbs = (path: string) => {
    if (!path) return [];
    const parts = path.split(".");
    return parts.map((part) => {
      // Si el nombre de la parte es un número, significa que es un elemento de un array.
      if (!isNaN(parseInt(part, 10))) {
        return `Elemento ${parseInt(part, 10) + 1}`;
      }
      return part;
    });
  };

  const renderField = (key: string, value: any, parentPath: string = "") => {
    const fullPath = parentPath ? `${parentPath}.${key}` : key;
    const isObject =
      typeof value === "object" && value !== null && !Array.isArray(value);
    const isArrayOfObjects =
      Array.isArray(value) &&
      value.every((item) => typeof item === "object" && item !== null);

    // Si el valor es un array de objetos
    if (isArrayOfObjects) {
      return (
        <div key={fullPath} className="nested-section array-section">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4>{key.toUpperCase()}</h4>
            <button
              type="button"
              onClick={() => handleAddItem(fullPath)}
              className="add-button"
            >
              Añadir {key}
            </button>
          </div>
          {value.map((item, index) => (
            <div key={`${fullPath}-${index}`} className="nested-section-item">
              <h5 className="item-title">
                {/* Título dinámico: busca las propiedades 'name' o 'brand' */}
                {item.name || item.brand || `Elemento ${index + 1}`}
              </h5>
              <button
                type="button"
                onClick={() => handleRemoveItem(`${fullPath}.${index}`)}
                className="remove-button"
                style={{ position: "absolute", top: "10px", right: "10px" }}
              >
                Eliminar
              </button>
              {Object.entries(item).map(([subKey, subValue]) =>
                renderField(subKey, subValue, `${fullPath}.${index}`)
              )}
            </div>
          ))}
        </div>
      );
    }

    // Si el valor es un objeto
    if (isObject) {
      return (
        <div key={fullPath} className="nested-section object-section">
          <h4>{key.toUpperCase()}</h4>
          {Object.entries(value).map(([subKey, subValue]) =>
            renderField(subKey, subValue, fullPath)
          )}
        </div>
      );
    }

    // Si es un valor simple (string, number, boolean)
    return (
      <div key={fullPath} style={{ margin: "10px 0", textAlign: "left" }}>
        <label style={{ display: "block", fontWeight: "bold" }}>{key}:</label>
        <input
          type={typeof value === "number" ? "number" : "text"}
          value={value}
          onChange={(e) => handleInputChange(fullPath, e.target.value)}
        />
      </div>
    );
  };
  const handleSave = async () => {
    if (data) {
      const result = await saveFileContent(fileName, data);
      if (result) {
        setMessage("¡Datos guardados exitosamente!");
      } else {
        setMessage("Error al guardar los datos.");
      }
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data) return null;
  const breadcrumbs = getBreadcrumbs(fileName); // Llama a la función aquí

  return (
    <div>
      <h3>Editando el archivo: {fileName}</h3>
      {/* Este es el bloque de código que debes agregar */}
      {breadcrumbs.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            textAlign: "left",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "4px",
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={index}>
              <span style={{ fontWeight: "bold" }}>{crumb}</span>
              {index < breadcrumbs.length - 1 && (
                <span style={{ margin: "0 5px" }}>&gt;</span>
              )}
            </span>
          ))}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        {Object.entries(data).map(([key, value]) => renderField(key, value))}
        <button
          onClick={handleSave}
          style={{ padding: "10px 20px", marginTop: "20px", cursor: "pointer" }}
        >
          Guardar cambios
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DynamicForm;
