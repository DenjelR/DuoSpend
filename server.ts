import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();

// CORS for cross-origin access and mobile PWA
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));

// File-backed storage for paired couple data
const DATA_DIR = path.join(__dirname, '.data');
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

const getStorageFile = (code: string) => {
  const safeCode = code.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'danko_simonka';
  return path.join(DATA_DIR, `couple_${safeCode}.json`);
};

// GET /api/sync/:code
app.get('/api/sync/:code', (req, res) => {
  const file = getStorageFile(req.params.code);
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const stats = fs.statSync(file);
      return res.json({
        success: true,
        data: JSON.parse(content),
        updatedAt: stats.mtime.toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Chyba čítania dát' });
    }
  }
  return res.json({
    success: false,
    data: null,
    message: 'Zatiaľ žiadne dáta pre tento párovací kód',
  });
});

// POST /api/sync/:code
app.post('/api/sync/:code', (req, res) => {
  const file = getStorageFile(req.params.code);
  try {
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({
      success: true,
      message: 'Uložené na serveri',
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Chyba zápisu: ' + err.message });
  }
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'DuoSpend Server API', time: new Date().toISOString() });
});

async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`DuoSpend server beží na http://0.0.0.0:${PORT}`);
  });
}

startServer();
