import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "notely";

const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
let notes;

async function connect() {
  await client.connect();
  const db = client.db(DB_NAME);
  notes = db.collection("notes");
  await notes.createIndex({ updatedAt: -1 });
  console.log(`✓ Connected to MongoDB at ${MONGO_URI} (db: ${DB_NAME})`);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "16mb" }));

// Guard: fail clearly if the DB isn't connected yet.
app.use("/api", (req, res, next) => {
  if (!notes) return res.status(503).json({ error: "Database not connected yet. Is MongoDB running?" });
  next();
});

const oid = (id) => {
  try { return new ObjectId(id); } catch { return null; }
};

// Default empty document for a new note.
const emptyDoc = () => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

// List notes (metadata only — no heavy content).
app.get("/api/notes", async (_req, res) => {
  const list = await notes
    .find({}, { projection: { title: 1, updatedAt: 1, createdAt: 1 } })
    .sort({ updatedAt: -1 })
    .toArray();
  res.json(list);
});

// Get one note (full content).
app.get("/api/notes/:id", async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ error: "Invalid id" });
  const note = await notes.findOne({ _id });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

// Create a note.
app.post("/api/notes", async (req, res) => {
  const now = new Date();
  const doc = {
    title: (req.body?.title ?? "Untitled").toString().slice(0, 200),
    blocks: Array.isArray(req.body?.blocks) ? req.body.blocks : [],
    drawing: Array.isArray(req.body?.drawing) ? req.body.drawing : [],
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await notes.insertOne(doc);
  res.status(201).json({ ...doc, _id: insertedId });
});

// Update a note (title and/or content).
app.put("/api/notes/:id", async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ error: "Invalid id" });
  const set = { updatedAt: new Date() };
  if (typeof req.body?.title === "string") set.title = req.body.title.slice(0, 200);
  if (req.body?.blocks !== undefined) set.blocks = req.body.blocks;
  if (req.body?.content !== undefined) set.content = req.body.content;
  if (req.body?.drawing !== undefined) set.drawing = req.body.drawing;
  const result = await notes.findOneAndUpdate(
    { _id },
    { $set: set },
    { returnDocument: "after" }
  );
  if (!result) return res.status(404).json({ error: "Not found" });
  res.json(result);
});

// Delete a note.
app.delete("/api/notes/:id", async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ error: "Invalid id" });
  const { deletedCount } = await notes.deleteOne({ _id });
  if (!deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: !!notes }));

connect()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Notely API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("✗ Could not connect to MongoDB.\n", err.message);
    console.error("  Start it with:  Start-Service MongoDB   (or run mongod)");
    process.exit(1);
  });
