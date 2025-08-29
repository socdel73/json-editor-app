import cors from 'cors'; // <-- Importa el paquete 'cors'
import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, '../data');

app.use(cors()); // <-- Usa el middleware CORS antes de las rutas
app.use(express.json());

// Asegura que el directorio de datos existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Endpoint para obtener la lista de archivos JSON
app.get('/api/files', (req: Request, res: Response) => {
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al leer el directorio.');
    }
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    res.json(jsonFiles);
  });
});

// Endpoint para leer un archivo JSON
app.get('/api/file/:fileName', (req: Request, res: Response) => {
  const { fileName } = req.params;
  const filePath = path.join(DATA_DIR, fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('Archivo no encontrado.');
      }
      console.error(err);
      return res.status(500).send('Error al leer el archivo.');
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error(parseErr);
      res.status(500).send('Error al analizar el archivo JSON.');
    }
  });
});

// Endpoint para guardar/editar un archivo JSON
app.post('/api/file/:fileName', (req: Request, res: Response) => {
  const { fileName } = req.params;
  const filePath = path.join(DATA_DIR, fileName);
  const dataToSave = JSON.stringify(req.body, null, 2);

  fs.writeFile(filePath, dataToSave, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al guardar el archivo.');
    }
    res.status(200).send('Archivo guardado exitosamente.');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
