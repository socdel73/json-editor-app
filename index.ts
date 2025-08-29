import cors from 'cors';
import 'dotenv/config';
import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

const app = express();
app.use(cors());            // útil en dev (CRA a :3000 i API a :4001)
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.cwd(), process.env.DATA_DIR)
  : path.join(__dirname, '../data');

// Assegura que el directori de dades existeix
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// --- Router prefixat ---
const api = express.Router();

// Llista arxius .json
api.get('/files', async (_req: Request, res: Response) => {
  try {
    const files = await fsp.readdir(DATA_DIR);
    res.json(files.filter(f => f.endsWith('.json')));
  } catch (err: any) {
    console.error(err);
    res.status(500).send('Error al llegir el directori.');
  }
});

// Llegir un arxiu JSON
api.get('/file/:fileName', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(DATA_DIR, req.params.fileName);
    const raw = await fsp.readFile(filePath, 'utf8');
    const json = JSON.parse(raw);
    res.json(json);
  } catch (err: any) {
    if (err.code === 'ENOENT') return res.status(404).send('Arxiu no trobat.');
    console.error(err);
    res.status(500).send('Error al llegir/analisar el JSON.');
  }
});

// Desar/editar un arxiu JSON
api.post('/file/:fileName', async (req: Request, res: Response) => {
  try {
    const filePath = path.join(DATA_DIR, req.params.fileName);
    await fsp.writeFile(filePath, JSON.stringify(req.body, null, 2), 'utf8');
    res.status(200).send('Arxiu desat correctament.');
  } catch (err: any) {
    console.error(err);
    res.status(500).send('Error al desar l’arxiu.');
  }
});

// Muntar el prefix /editor/api
app.use('/editor/api', api);

app.listen(PORT, () => {
  console.log(`[json-editor] escoltant a http://localhost:${PORT}`);
  console.log(`[json-editor] DATA_DIR = ${DATA_DIR}`);
});
