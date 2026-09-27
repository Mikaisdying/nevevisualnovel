import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

const manifestPath = path.join(__dirname, '../../../public/data/manifest.json');
const storylinePath = path.join(__dirname, '../../../public/data/storyline.json');
const assetRoot = path.join(__dirname, '../../../public/assets');

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

// ---- Asset browsing ----

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg)$/i;

function listBackgrounds() {
  const dir = path.join(assetRoot, 'bg');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .map((f) => {
      const id = path.parse(f).name;
      return { id, name: id, type: 'bg', url: `/assets/bg/${f}` };
    });
}

function listCharacters() {
  const dir = path.join(assetRoot, 'char');
  if (!fs.existsSync(dir)) return [];
  const assets = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const poseDir = path.join(dir, entry.name);
    for (const f of fs.readdirSync(poseDir).filter((f) => IMAGE_EXT.test(f))) {
      const poseId = path.parse(f).name;
      assets.push({
        id: `${entry.name}/${poseId}`,
        name: `${entry.name} · ${poseId}`,
        type: 'char',
        characterId: entry.name,
        url: `/assets/char/${entry.name}/${f}`,
      });
    }
  }
  return assets;
}

function listCg() {
  const dir = path.join(assetRoot, 'cg');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .map((f) => {
      const id = path.parse(f).name;
      return { id, name: id, type: 'cg', url: `/assets/cg/${f}` };
    });
}

function listAudio() {
  const dir = path.join(assetRoot, 'audio');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => AUDIO_EXT.test(f))
    .map((f) => {
      const id = path.parse(f).name;
      return { id, name: id, type: 'audio', url: `/assets/audio/${f}` };
    });
}

// List assets, optionally filtered by ?type=bg|char|audio
app.get('/api/assets', (req, res) => {
  try {
    const { type } = req.query;
    if (type === 'bg') return res.json(listBackgrounds());
    if (type === 'char') return res.json(listCharacters());
    if (type === 'cg') return res.json(listCg());
    if (type === 'audio') return res.json(listAudio());
    return res.json([...listBackgrounds(), ...listCharacters(), ...listCg(), ...listAudio()]);
  } catch (err) {
    console.error('LIST ASSETS ERROR:', err);
    res.status(500).json({ error: 'Cannot list assets', detail: err.message });
  }
});

function syncManifest(mutate) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(raw || '{}');
  mutate(manifest);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { type, characterId } = req.body;
      let dir;
      if (type === 'bg') {
        dir = path.join(assetRoot, 'bg');
      } else if (type === 'char') {
        if (!characterId) return cb(new Error('characterId is required for character uploads'));
        dir = path.join(assetRoot, 'char', characterId);
      } else if (type === 'cg') {
        dir = path.join(assetRoot, 'cg');
      } else if (type === 'audio') {
        dir = path.join(assetRoot, 'audio');
      } else {
        return cb(new Error('Invalid asset type'));
      }

      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Upload a new asset file; registers backgrounds/characters into manifest.json
app.post('/api/assets/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { type, characterId } = req.body;
  const id = path.parse(req.file.filename).name;

  try {
    if (type === 'bg') {
      syncManifest((manifest) => {
        manifest.backgrounds = manifest.backgrounds ?? [];
        if (!manifest.backgrounds.some((b) => b.id === id)) {
          manifest.backgrounds.push({ id, file: req.file.filename, name: id });
        }
      });
    } else if (type === 'char' && characterId) {
      syncManifest((manifest) => {
        manifest.characters = manifest.characters ?? [];
        let character = manifest.characters.find((c) => c.id === characterId);
        if (!character) {
          character = { id: characterId, name: characterId, poses: [] };
          manifest.characters.push(character);
        }
        if (!character.poses.includes(id)) character.poses.push(id);
      });
    } else if (type === 'cg') {
      syncManifest((manifest) => {
        manifest.cgs = manifest.cgs ?? [];
        if (!manifest.cgs.some((c) => c.id === id)) {
          manifest.cgs.push({ id, name: id });
        }
      });
    }
  } catch (err) {
    console.error('MANIFEST SYNC ERROR:', err);
  }

  const url =
    type === 'char'
      ? `/assets/char/${characterId}/${req.file.filename}`
      : `/assets/${type}/${req.file.filename}`;

  res.json({ success: true, file: { id, name: req.file.filename, url } });
});

// Surface upload/validation errors as JSON instead of Express's default HTML page
app.use((err, req, res, next) => {
  console.error('REQUEST ERROR:', err);
  res.status(400).json({ error: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[backend] Cổng ${PORT} đang bị một tiến trình khác dùng (có thể là một backend khác đang chạy).\n` +
        `Tắt tiến trình đó rồi chạy lại "npm run start".\n`,
    );
  } else {
    console.error('[backend] Không khởi động được API server:', err);
  }
  process.exit(1);
});
