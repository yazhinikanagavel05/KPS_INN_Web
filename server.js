import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '25mb' }));

const ROOT = process.cwd();
const DATA_DIR = path.resolve(ROOT, 'data');
const PUBLIC_DIR = path.resolve(ROOT, 'public');
const DIST_DIR = path.resolve(ROOT, 'dist');

// Serve uploaded files (e.g. /uploads/gallery/... or /uploads/hero/...) from the public folder
app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads')));

// Ensure data directory and files exist
function ensureDataFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, '[]');
  }
}

ensureDataFile('bookings.json');
ensureDataFile('gallery.json');
ensureDataFile('hero-slides.json');

// Helper: read JSON file
function readFile(filename) {
  const filepath = path.join(DATA_DIR, filename);
  const data = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(data);
}

// Helper: write JSON file
function writeFile(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

const IMAGE_DATA_RE = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

// Decode a base64 data URL and write it under public/uploads/<section>/.
// Returns { filename } or { error }.
function writeUpload(section, dataUrl, requestedName) {
  const match = IMAGE_DATA_RE.exec(dataUrl || '');
  if (!match) return { error: 'Unsupported image type. Please use JPG, PNG, or WebP.' };

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) return { error: 'Empty image file.' };
  if (buffer.length > MAX_IMAGE_BYTES) return { error: 'Image too large (max 8 MB).' };

  const ext = match[1] === 'image/png' ? 'png' : match[1] === 'image/webp' ? 'webp' : 'jpg';
  const base = requestedName ? path.basename(String(requestedName)).replace(/\.[^.]+$/, '') : 'image';
  const safe = base.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 60) || 'image';
  const filename = `${safe}-${Date.now()}.${ext}`;

  const dir = path.join(PUBLIC_DIR, 'uploads', section);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer);
  return { filename };
}

// Remove an uploaded file if it lives inside public/uploads/<section>.
function removeUpload(section, filename) {
  if (!filename) return;
  const sectionDir = path.resolve(path.join(PUBLIC_DIR, 'uploads', section));
  const target = path.resolve(sectionDir, path.basename(filename));
  if (!target.startsWith(sectionDir + path.sep)) return;
  try { fs.unlinkSync(target); } catch { /* already gone */ }
}

// --- Bookings API ---

// GET /api/bookings - get all bookings
app.get('/api/bookings', (req, res) => {
  res.json(readFile('bookings.json'));
});

// POST /api/bookings - create new booking
app.post('/api/bookings', (req, res) => {
  const booking = { ...(req.body || {}) };
  booking.id = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  booking.bookingDate = new Date().toISOString();
  booking.status = 'Pending';

  const bookings = readFile('bookings.json');
  bookings.push(booking);
  writeFile('bookings.json', bookings);
  res.status(201).json(booking);
});

// PATCH /api/bookings/:id - update booking status
app.patch('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const bookings = readFile('bookings.json');
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });

  if (status !== undefined) bookings[idx].status = status;
  writeFile('bookings.json', bookings);
  res.json(bookings[idx]);
});

// --- Gallery API ---

// GET /api/gallery - get all gallery images
app.get('/api/gallery', (req, res) => {
  res.json(readFile('gallery.json'));
});

// POST /api/gallery - add a new gallery image.
// Body: { title?, altText?, filename?, data? } where `data` is a base64 data URL.
app.post('/api/gallery', (req, res) => {
  const { title, altText, data, filename } = req.body || {};
  let savedFilename = filename;
  if (data) {
    const result = writeUpload('gallery', data, filename);
    if (result.error) return res.status(400).json({ error: result.error });
    savedFilename = result.filename;
  }
  if (!savedFilename) return res.status(400).json({ error: 'An image file is required.' });

  const gallery = readFile('gallery.json');
  const image = {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title || '',
    altText: altText || '',
    filename: savedFilename,
    createdAt: new Date().toISOString(),
  };
  gallery.push(image);
  writeFile('gallery.json', gallery);
  res.status(201).json(image);
});

// PATCH /api/gallery/:id - update title/altText or replace the image file.
app.patch('/api/gallery/:id', (req, res) => {
  const { id } = req.params;
  const { title, altText, data, filename } = req.body || {};

  const gallery = readFile('gallery.json');
  const idx = gallery.findIndex(img => img.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Image not found' });

  let savedFilename = filename;
  if (data) {
    const result = writeUpload('gallery', data, filename);
    if (result.error) return res.status(400).json({ error: result.error });
    savedFilename = result.filename;
  }

  if (title !== undefined) gallery[idx].title = title;
  if (altText !== undefined) gallery[idx].altText = altText;
  if (savedFilename) {
    const old = gallery[idx].filename;
    gallery[idx].filename = savedFilename;
    if (old && old !== savedFilename) removeUpload('gallery', old);
  }

  writeFile('gallery.json', gallery);
  res.json(gallery[idx]);
});

// DELETE /api/gallery/:id - remove image record and its file.
app.delete('/api/gallery/:id', (req, res) => {
  const { id } = req.params;

  const gallery = readFile('gallery.json');
  const target = gallery.find(img => img.id === id);
  if (!target) return res.status(404).json({ error: 'Image not found' });

  writeFile('gallery.json', gallery.filter(img => img.id !== id));
  removeUpload('gallery', target.filename);
  res.json({ success: true });
});

// --- Hero Slides API ---

// GET /api/hero-slides - get all hero slides (ordered)
app.get('/api/hero-slides', (req, res) => {
  const slides = readFile('hero-slides.json').sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  res.json(slides);
});

// POST /api/hero-slides - add a new hero slide.
// Body: { image?, data?, filename?, eyebrow?, title?, copy?, cta?, ctaTarget?, motion? }
app.post('/api/hero-slides', (req, res) => {
  const { image, data, filename, eyebrow, title, copy, cta, ctaTarget, motion } = req.body || {};
  let savedImage = image;
  if (data) {
    const result = writeUpload('hero', data, filename);
    if (result.error) return res.status(400).json({ error: result.error });
    savedImage = `/uploads/hero/${result.filename}`;
  }
  if (!savedImage) return res.status(400).json({ error: 'A hero image is required.' });

  const slides = readFile('hero-slides.json');
  const slide = {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    image: savedImage,
    eyebrow: eyebrow || '',
    title: title || '',
    copy: copy || '',
    cta: cta || 'Book Now',
    ctaTarget: ctaTarget || 'book',
    motion: motion || 'zoom',
    order: slides.length,
  };
  slides.push(slide);
  slides.forEach((s, i) => { s.order = i; });
  writeFile('hero-slides.json', slides);
  res.status(201).json(slide);
});

// PATCH /api/hero-slides/:id - update slide fields, image, or order.
app.patch('/api/hero-slides/:id', (req, res) => {
  const { id } = req.params;
  const { image, data, filename, eyebrow, title, copy, cta, ctaTarget, motion, order } = req.body || {};

  const slides = readFile('hero-slides.json');
  const idx = slides.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Slide not found' });

  let savedImage = image;
  if (data) {
    const result = writeUpload('hero', data, filename);
    if (result.error) return res.status(400).json({ error: result.error });
    savedImage = `/uploads/hero/${result.filename}`;
    const old = slides[idx].image;
    if (old && old.startsWith('/uploads/hero/')) removeUpload('hero', old.replace('/uploads/hero/', ''));
  }
  if (savedImage !== undefined && savedImage !== null) slides[idx].image = savedImage;
  if (eyebrow !== undefined) slides[idx].eyebrow = eyebrow;
  if (title !== undefined) slides[idx].title = title;
  if (copy !== undefined) slides[idx].copy = copy;
  if (cta !== undefined) slides[idx].cta = cta;
  if (ctaTarget !== undefined) slides[idx].ctaTarget = ctaTarget;
  if (motion !== undefined) slides[idx].motion = motion;
  if (order !== undefined && Number.isFinite(Number(order))) {
    slides[idx].order = Number(order);
  }

  writeFile('hero-slides.json', slides);
  res.json(slides[idx]);
});

// POST /api/hero-slides/reorder - set the full slide order from an array of ids.
app.post('/api/hero-slides/reorder', (req, res) => {
  const { order } = req.body || {};
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of slide ids' });

  const slides = readFile('hero-slides.json');
  const byId = new Map(slides.map(s => [s.id, s]));
  const reordered = order.map(id => byId.get(id)).filter(Boolean);
  slides.forEach(s => {
    if (!reordered.includes(s)) reordered.push(s);
  });
  if (reordered.length !== slides.length) return res.status(400).json({ error: 'order must include every slide id' });

  reordered.forEach((s, i) => { s.order = i; });
  writeFile('hero-slides.json', reordered);
  res.json(reordered);
});

// DELETE /api/hero-slides/:id - delete a hero slide (and its uploaded image).
app.delete('/api/hero-slides/:id', (req, res) => {
  const { id } = req.params;

  const slides = readFile('hero-slides.json');
  const target = slides.find(s => s.id === id);
  if (!target) return res.status(404).json({ error: 'Slide not found' });

  const rest = slides.filter(s => s.id !== id);
  rest.forEach((s, i) => { s.order = i; });
  writeFile('hero-slides.json', rest);

  if (target.image && target.image.startsWith('/uploads/hero/')) {
    removeUpload('hero', target.image.replace('/uploads/hero/', ''));
  }
  res.json({ success: true });
});

// --- Serve the built site (npm run build) with SPA fallback ---
// The Vite build uses base '/KPS_INN_Web/' (for GitHub Pages), so the built
// assets are referenced as /KPS_INN_Web/assets/... . We serve the dist folder
// at both that base path and the root so the site works locally as well.
const distIndex = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(distIndex)) {
  app.use('/KPS_INN_Web', express.static(DIST_DIR));
  app.use(express.static(DIST_DIR));

  const spaFallback = (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.sendFile(distIndex);
  };

  app.use((req, res) => spaFallback(req, res));
}

// --- Start server ---
app.listen(PORT, () => {
  console.log(`KPS INN Backend running at http://localhost:${PORT}`);
});
