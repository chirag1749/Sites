import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Save family JSON endpoint
app.post('/api/save-family', (req, res) => {
  try {
    console.log('[DEV-SERVER] Received POST /api/save-family with', req.body.length || Object.keys(req.body).length, 'items');
    const familyJsonPath = path.join(__dirname, 'public/data/family.json');
    fs.writeFileSync(familyJsonPath, JSON.stringify(req.body, null, 2), 'utf-8');
    console.log('[DEV-SERVER] ✅ Saved family data to', familyJsonPath);
    res.json({ success: true, message: 'Family data saved to family.json' });
  } catch (err) {
    console.error('[DEV-SERVER] ❌ Error saving family data:', err);
    res.status(400).json({ success: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`[DEV-SERVER] ✅ API server running on http://localhost:${PORT}`);
});
