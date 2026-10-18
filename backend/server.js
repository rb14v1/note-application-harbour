require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'notes';

// Origins allowed to call the API. Empty allows any origin.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: '', maxlength: 20000 },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

noteSchema.set('toJSON', {
  transform: (_doc, note) => ({
    id: note._id.toString(),
    title: note.title,
    content: note.content,
    archived: note.archived,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }),
});

const Note = mongoose.model('Note', noteSchema);

// Keeps trying until the database answers. The server stays up meanwhile, so the container passes its
// health check and the platform does not restart it while the database is still being reached.
async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not set; the notes API will answer 503 until it is.');
    return;
  }
  for (;;) {
    try {
      await mongoose.connect(MONGODB_URI, {
        dbName: MONGODB_DB,
        serverSelectionTimeoutMS: 10000,
        retryWrites: false,
      });
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection failed: ${err.message}. Retrying in 5 seconds.`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

const app = express();
app.use(cors(allowedOrigins.length > 0 ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' });
});

const notes = express.Router();

notes.use((_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'The database is not connected yet.' });
  }
  next();
});

notes.use('/:id', (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid note id.' });
  }
  next();
});

const asyncRoute = (handler) => (req, res, next) => handler(req, res).catch(next);

function readNoteBody(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content : '';
  return { title, content };
}

notes.get('/', asyncRoute(async (_req, res) => {
  res.json(await Note.find().sort({ createdAt: -1 }));
}));

notes.post('/', asyncRoute(async (req, res) => {
  const { title, content } = readNoteBody(req.body);
  if (!title) return res.status(400).json({ error: 'A title is required.' });
  res.status(201).json(await Note.create({ title, content }));
}));

notes.put('/:id', asyncRoute(async (req, res) => {
  const { title, content } = readNoteBody(req.body);
  if (!title) return res.status(400).json({ error: 'A title is required.' });
  const note = await Note.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.json(note);
}));

for (const [action, archived] of [['archive', true], ['unarchive', false]]) {
  notes.post(`/:id/${action}`, asyncRoute(async (req, res) => {
    const note = await Note.findByIdAndUpdate(req.params.id, { archived }, { new: true });
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    res.json(note);
  }));
}

notes.delete('/:id', asyncRoute(async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  res.status(204).end();
}));

app.use('/api/notes', notes);

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Notes API listening on port ${PORT}`);
  connectToDatabase();
});
