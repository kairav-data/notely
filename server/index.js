import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

// Loads the local, git-ignored server/.env file without adding another dependency.
const serverDir = dirname(fileURLToPath(import.meta.url));
const envFile = resolve(serverDir, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

const clientDist = resolve(serverDir, "../client/dist");
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "notely";
const AUTH_SECRET = process.env.AUTH_SECRET || "";
const scrypt = promisify(scryptCallback);

const client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 4000 });
let notes, users;

async function connect() {
  await client.connect();
  const db = client.db(DB_NAME);
  notes = db.collection("notes");
  users = db.collection("users");
  await notes.createIndex({ updatedAt: -1 });
  await notes.createIndex({ ownerId: 1, updatedAt: -1 });
  await users.createIndex({ email: 1 }, { unique: true });
  console.log(`✓ Connected to MongoDB (db: ${DB_NAME})`);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "16mb" }));

// Guard: fail clearly if the DB isn't connected yet.
app.use("/api", (req, res, next) => {
  if (!notes || !users) return res.status(503).json({ error: "Database not connected yet." });
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

const publicUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  phone: user.phone || "",
  company: user.company || "",
  jobTitle: user.jobTitle || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt || user.createdAt,
});

const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)).toString("hex");
  return `${salt}:${hash}`;
};

const passwordMatches = async (password, stored) => {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
};

const signToken = (user) => {
  const payload = Buffer.from(JSON.stringify({ sub: user._id.toString(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifyToken = (token) => {
  const [payload, signature] = (token || "").split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return parsed.exp > Date.now() && oid(parsed.sub) ? parsed : null;
  } catch { return null; }
};

const requireAuth = async (req, res, next) => {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Please sign in to continue." });
  const user = await users.findOne({ _id: new ObjectId(payload.sub) });
  if (!user) return res.status(401).json({ error: "Your session is no longer valid." });
  req.user = user;
  next();
};

const credentials = (body) => {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  return { email, password };
};

const profileDetails = (body) => {
  const text = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : "";
  const firstName = text(body?.firstName, 80);
  const lastName = text(body?.lastName, 80);
  const phone = text(body?.phone, 30);
  const company = text(body?.company, 120);
  const jobTitle = text(body?.jobTitle, 120);
  if (firstName.length < 2) return { error: "Enter your first name." };
  if (lastName.length < 2) return { error: "Enter your last name." };
  if (phone && !/^\+?[0-9()\-\s]{7,30}$/.test(phone)) return { error: "Enter a valid phone number." };
  return { firstName, lastName, phone, company, jobTitle };
};

app.post("/api/auth/register", async (req, res) => {
  const input = credentials(req.body);
  if (input.error) return res.status(400).json({ error: input.error });
  const profile = profileDetails(req.body);
  if (profile.error) return res.status(400).json({ error: profile.error });
  try {
    const now = new Date();
    const user = {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      ...profile,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await users.insertOne(user);
    const created = { ...user, _id: insertedId };
    res.status(201).json({ user: publicUser(created), token: signToken(created) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ error: "An account with that email already exists." });
    throw error;
  }
});

app.post("/api/auth/login", async (req, res) => {
  const input = credentials(req.body);
  if (input.error) return res.status(400).json({ error: input.error });
  const user = await users.findOne({ email: input.email });
  if (!user || !(await passwordMatches(input.password, user.passwordHash))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  res.json({ user: publicUser(user), token: signToken(user) });
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  const notesCount = await notes.countDocuments({ ownerId: req.user._id });
  res.json({ user: { ...publicUser(req.user), notesCount } });
});

app.put("/api/auth/profile", requireAuth, async (req, res) => {
  const profile = profileDetails(req.body);
  if (profile.error) return res.status(400).json({ error: profile.error });
  const set = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    company: profile.company,
    jobTitle: profile.jobTitle,
    updatedAt: new Date(),
  };
  const result = await users.findOneAndUpdate(
    { _id: req.user._id },
    { $set: set },
    { returnDocument: "after" }
  );
  if (!result) return res.status(404).json({ error: "User not found." });
  const notesCount = await notes.countDocuments({ ownerId: req.user._id });
  res.json({ user: { ...publicUser(result), notesCount } });
});

// List notes (metadata only — no heavy content).
app.get("/api/notes", requireAuth, async (req, res) => {
  const list = await notes
    .find({ ownerId: req.user._id }, { projection: { title: 1, updatedAt: 1, createdAt: 1 } })
    .sort({ updatedAt: -1 })
    .toArray();
  res.json(list);
});

// Get one note (full content).
app.get("/api/notes/:id", requireAuth, async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ error: "Invalid id" });
  const note = await notes.findOne({ _id, ownerId: req.user._id });
  if (!note) return res.status(404).json({ error: "Not found" });
  res.json(note);
});

// Create a note.
app.post("/api/notes", requireAuth, async (req, res) => {
  const now = new Date();
  const doc = {
    title: (req.body?.title ?? "Untitled").toString().slice(0, 200),
    blocks: Array.isArray(req.body?.blocks) ? req.body.blocks : [],
    drawing: Array.isArray(req.body?.drawing) ? req.body.drawing : [],
    ownerId: req.user._id,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await notes.insertOne(doc);
  res.status(201).json({ ...doc, _id: insertedId });
});

// Update a note (title and/or content).
app.put("/api/notes/:id", requireAuth, async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ error: "Invalid id" });
  const set = { updatedAt: new Date() };
  if (typeof req.body?.title === "string") set.title = req.body.title.slice(0, 200);
  if (req.body?.blocks !== undefined) set.blocks = req.body.blocks;
  if (req.body?.content !== undefined) set.content = req.body.content;
  if (req.body?.drawing !== undefined) set.drawing = req.body.drawing;
  const result = await notes.findOneAndUpdate(
    { _id, ownerId: req.user._id },
    { $set: set },
    { returnDocument: "after" }
  );
  if (!result) return res.status(404).json({ error: "Not found" });
  res.json(result);
});

// Delete a note.
app.delete("/api/notes/:id", requireAuth, async (req, res) => {
  const _id = oid(req.params.id);
  if (!_id) return res.status(400).json({ error: "Invalid id" });
  const { deletedCount } = await notes.deleteOne({ _id, ownerId: req.user._id });
  if (!deletedCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: !!notes }));

// On Render, Express serves the production Vite build and falls back to its
// entry point for client-side routes. Vite continues serving the client locally.
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(resolve(clientDist, "index.html")));
}

connect()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Notely API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("✗ Could not connect to MongoDB.\n", err.message);
    console.error("  Check MONGO_URI, database access, and network/DNS settings in server/.env.");
    process.exit(1);
  });
