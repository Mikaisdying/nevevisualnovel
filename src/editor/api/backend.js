
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());


const manifestPath = path.join(__dirname, '../../../public/data/manifest.json');
const storylinePath = path.join(__dirname, '../../../public/data/storyline.json');

// Helper functions
const readJSON = (filePath, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('READ ERROR:', filePath, err); // Log file path and error
      return res.status(500).json({ error: 'Cannot read file', detail: err.message, path: filePath });
    }
    try {
      const json = JSON.parse(data || '{}');
      res.json(json);
    } catch (e) {
      console.error('PARSE ERROR:', filePath, e); // Log parse error
      res.status(500).json({ error: 'Invalid JSON format', detail: e.message, path: filePath });
    }
  });
};

const writeJSON = (filePath, content, res) => {
  fs.writeFile(filePath, JSON.stringify(content, null, 2), err => {
    if (err) {
      return res.status(500).json({ error: 'Cannot write file' });
    }
    res.json({ success: true });
  });
};

// Get manifest.json
app.get('/api/manifest', (req, res) => {
  readJSON(manifestPath, res);
});

// Update manifest.json
app.post('/api/manifest', (req, res) => {
  writeJSON(manifestPath, req.body, res);
});

// Get storyline.json
app.get('/api/storyline', (req, res) => {
  readJSON(storylinePath, res);
});

// Update storyline.json
app.post('/api/storyline', (req, res) => {
  writeJSON(storylinePath, req.body, res);
});

// API: List all JSON files in public/assets
app.get('/api/files', (req, res) => {
  const dir = path.join(__dirname, '../../public/assets');
  console.log('Reading directory:', dir);
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Cannot read directory' });
    res.json(files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')));
  });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
