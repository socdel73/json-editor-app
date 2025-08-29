const API_URL = 'http://localhost:3000/api/file';

// Función para obtener los datos de un archivo JSON
export const getFileContent = async (fileName: string) => {
  try {
    const response = await fetch(`${API_URL}/${fileName}`);
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el archivo:", error);
    return null;
  }
};

// Función para guardar los datos en un archivo JSON
export const saveFileContent = async (fileName: string, content: any) => {
  try {
    const response = await fetch(`${API_URL}/${fileName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(content),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const result = await response.text();
    return result;
  } catch (error) {
    console.error("Error al guardar el archivo:", error);
    return null;
  }
};
