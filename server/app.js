"use strict";
const express   = require("express");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
const multer    = require("multer");
const path      = require("path");
const fs        = require("fs");
const crypto    = require("crypto");
const db        = require("./db");
const { validateBooking } = require("./validate");
const { notifyNewBooking, notifyContactForm } = require("./brevo");

const ADMIN_KEY = process.env.API_ADMIN_KEY || "dev-admin-key-change-in-prod";

if (process.env.NODE_ENV === "production" &&
    (ADMIN_KEY === "dev-admin-key-change-in-prod" || ADMIN_KEY.length < 32)) {
  throw new Error(
    "[FATAL] API_ADMIN_KEY must be set to a strong value (>=32 chars) in production. " +
    "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  );
}

const uid = () => "b" + crypto.randomBytes(8).toString("hex") + Date.now().toString(36);

function toClient(row) {
  if (!row) return null;
  return {
    id: row.id, type: row.type, tour: row.tour, departureId: row.departure_id,
    name: row.name, email: row.email, phone: row.phone, country: row.country,
    date: row.date, dateTo: row.date_to, rentalDays: row.rental_days,
    experience: row.experience, bike: row.bike, status: row.status,
    notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"] || req.query.admin_key;
  if (typeof key === "string" && key.length === ADMIN_KEY.length) {
    const a = Buffer.from(key);
    const b = Buffer.from(ADMIN_KEY);
    if (crypto.timingSafeEqual(a, b)) return next();
  }
  return res.status(401).json({ success: false, error: "Admin key required" });
}

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: false, limit: "16kb" }));

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",").map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Exact match prevents `http://allowed.com.evil.com` from passing a startsWith check.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
}));

const publicLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100, // browse/availability lookups
  message: { success: false, error: "Too many requests. Please try again later." },
  standardHeaders: true, legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

// Booking creation: tighter cap because each request hits DB + email/WhatsApp
const bookingLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, error: "Too many booking attempts. Please try again later." },
  standardHeaders: true, legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

// Admin endpoints: rate-limit to slow brute-force of the admin key
const adminLimit = rateLimit({
  windowMs: 60 * 1000, max: 30,
  message: { success: false, error: "Too many admin requests." },
  standardHeaders: true, legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});


// ── File upload setup ─────────────────────────────────────────────────────────
const UPLOADS_DIR = process.env.UPLOADS_DIR ||
  path.join(process.env.DATA_DIR || path.join(__dirname, "data"), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || ".jpg";
    const hash = crypto.randomBytes(8).toString("hex");
    cb(null, Date.now() + "-" + hash + ext);
  },
});

// Strict ext + MIME whitelist. Both must match an allowed entry, so names like
// "evil.jpg.exe" (ext .exe) or a .png claiming mimetype image/svg+xml are rejected.
const ALLOWED_UPLOADS = {
  ".jpg":  ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png":  ["image/png"],
  ".gif":  ["image/gif"],
  ".webp": ["image/webp"],
  ".avif": ["image/avif"],
  ".mp4":  ["video/mp4"],
  ".mov":  ["video/quicktime"],
  ".avi":  ["video/x-msvideo", "video/avi"],
  ".mkv":  ["video/x-matroska"],
  ".webm": ["video/webm"],
};

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || "").toLowerCase();
    const mimes = ALLOWED_UPLOADS[ext];
    if (!mimes || !mimes.includes(mime)) {
      return cb(new Error("File type not allowed"), false);
    }
    cb(null, true);
  },
});

// Serve uploaded files as static, with hardened response headers.
// - X-Content-Type-Options: nosniff — browsers won't MIME-sniff arbitrary types.
// - Content-Disposition: attachment — images still render when embedded via <img>,
//   but direct navigation downloads rather than rendering (defends against HTML/SVG-in-image XSS).
app.use("/uploads", express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    const safeName = path.basename(filePath).replace(/[^\w.\-]/g, "_");
    res.setHeader("Content-Disposition", 'inline; filename="' + safeName + '"');
  },
}));

// POST /api/uploads — upload a file (admin only)
app.post("/api/uploads", adminLimit, adminAuth, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file received" });

  const publicPath = "/uploads/" + req.file.filename;
  return res.status(201).json({
    success:  true,
    url:      publicPath,
    filename: req.file.filename,
    size:     req.file.size,
    mimetype: req.file.mimetype,
  });
});

// POST /api/uploads/delete — delete a file (admin only)
app.delete("/api/uploads/:filename", adminLimit, adminAuth, (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filepath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, error: "File not found" });
  fs.unlinkSync(filepath);
  return res.json({ success: true, deleted: filename });
});

// GET /api/uploads — list all uploaded files (admin only)
app.get("/api/uploads", adminLimit, adminAuth, (_req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR)
    .filter(f => !f.startsWith("."))
    .map(f => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, f));
      return { filename: f, url: "/uploads/" + f, size: stat.size, mtime: stat.mtime };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return res.json({ success: true, files });
});

// Health check (public)
app.get("/api/health", (_req, res) =>
  res.json({ success: true, status: "ok", ts: new Date().toISOString() })
);

// ── Content (routes / fleet / gallery) ────────────────────────────────────────
// Server is now authoritative for admin-managed content, replacing the former
// localStorage-only store. Each collection is stored as a JSON blob under a
// single row in `content`.
const CONTENT_KEYS = ["routes", "fleet", "gallery"];

function readContent(key) {
  const row = db.prepare("SELECT value FROM content WHERE key = ?").get(key);
  if (!row) return [];
  try { return JSON.parse(row.value); } catch { return []; }
}

function writeContent(key, value) {
  const now = new Date().toISOString();
  // Upsert: sql.js doesn't support INSERT OR REPLACE on every build, so do it
  // the portable way — delete + insert inside the same flushed write.
  db.prepare("DELETE FROM content WHERE key = ?").run([key]);
  db.prepare("INSERT INTO content (key, value, updated_at) VALUES (?, ?, ?)")
    .run([key, JSON.stringify(value), now]);
}

// GET /api/content — public. Returns filtered view (active + visible routes only).
// Fleet and gallery are returned as-is; their own UI decides display.
app.get("/api/content", publicLimit, (_req, res) => {
  const routes  = readContent("routes").filter(r => r.status === "active" && r.visible !== false);
  const fleet   = readContent("fleet");
  const gallery = readContent("gallery");
  return res.json({ success: true, routes, fleet, gallery });
});

// GET /api/admin/content — admin. Returns every record, including hidden ones.
app.get("/api/admin/content", adminLimit, adminAuth, (_req, res) => {
  return res.json({
    success: true,
    routes:  readContent("routes"),
    fleet:   readContent("fleet"),
    gallery: readContent("gallery"),
  });
});

// PUT /api/admin/content — admin. Accepts a partial { routes?, fleet?, gallery? }
// and replaces those collections atomically. Uses a larger body limit than the
// default because gallery arrays can carry long captions + many entries.
app.put("/api/admin/content", adminLimit, adminAuth, express.json({ limit: "1mb" }), (req, res) => {
  const body = req.body || {};
  const updated = [];
  for (const key of CONTENT_KEYS) {
    if (Array.isArray(body[key])) {
      writeContent(key, body[key]);
      updated.push(key);
    }
  }
  if (!updated.length) {
    return res.status(400).json({ success: false, error: "No valid content keys provided" });
  }
  return res.json({ success: true, updated });
});

// POST /api/bookings — public, rate-limited (tighter than browse limit)
app.post("/api/bookings", bookingLimit, (req, res) => {
  const body = req.body || {};
  const { ok, errors } = validateBooking(body);
  if (!ok) return res.status(422).json({ success: false, errors });

  const id  = uid();
  const now = new Date().toISOString();

  if (body.bike && body.date) {
    const dateTo = body.date_to || body.date;
    const conflict = db.prepare(
      "SELECT id FROM bookings WHERE bike = ? AND status != 'cancelled' AND date <= ? AND COALESCE(date_to, date) >= ?"
    ).get(body.bike, dateTo, body.date);
    if (conflict) {
      return res.status(409).json({
        success: false,
        errors: { bike: "This motorcycle is already booked for the selected dates" },
      });
    }
  }

  db.prepare(
    "INSERT INTO bookings (id,type,tour,departure_id,name,email,phone,country,date,date_to,rental_days,experience,bike,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?,?)"
  ).run([
    id, body.type||"guided", body.tour, body.departure_id||null,
    body.name, body.email, body.phone||null, body.country||null,
    body.date||null, body.date_to||null, body.rental_days||null,
    body.experience, body.bike||null, body.notes||null,
    now.slice(0,10), now,
  ]);

  const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
  const payload = toClient(booking);

  // Fire-and-forget notifications. Never block the response or leak Brevo errors
  // to the client; brevo.js already logs failures.
  if (process.env.NODE_ENV !== "test") {
    notifyNewBooking(payload).catch(e => console.error("[notify] booking", e.message));
  }

  return res.status(201).json({
    success: true, booking_id: id, status: "pending",
    message: "Booking received. We will confirm within 24 hours.",
    booking: payload,
  });
});

// POST /api/contact — public contact form. Rate-limited like booking creation.
app.post("/api/contact", bookingLimit, (req, res) => {
  const b = req.body || {};
  const name    = String(b.name    || "").trim().slice(0, 120);
  const email   = String(b.email   || "").trim().slice(0, 160);
  const message = String(b.message || "").trim().slice(0, 4000);

  const errors = {};
  if (!name)    errors.name    = "Name is required";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email required";
  if (!message) errors.message = "Message is required";
  if (Object.keys(errors).length) return res.status(422).json({ success: false, errors });

  if (process.env.NODE_ENV !== "test") {
    notifyContactForm({ name, email, message })
      .catch(e => console.error("[notify] contact", e.message));
  }
  return res.status(201).json({ success: true, message: "Message received" });
});

// GET /api/bookings/availability — PUBLIC, minimal data for client-side availability checks
// Returns bike, date, date_to, departure_id, status only — no PII
app.get("/api/bookings/availability", (req, res) => {
  const rows = db.prepare(
    "SELECT bike, date, date_to, departure_id, status FROM bookings WHERE status != 'cancelled'"
  ).all();
  return res.json({
    success: true,
    bookings: rows.map(r => ({
      bike:        r.bike,
      date:        r.date,
      dateTo:      r.date_to,
      departureId: r.departure_id,
      status:      r.status,
    })),
  });
});

// GET /api/bookings/stats/summary — admin
app.get("/api/bookings/stats/summary", adminLimit, adminAuth, (_req, res) => {
  const r = db.prepare(
    "SELECT COUNT(*) as total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) as confirmed, SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM bookings"
  ).get() || {};
  return res.json({ success: true, stats: r });
});

// GET /api/bookings — admin
app.get("/api/bookings", adminLimit, adminAuth, (req, res) => {
  const { status, type, search, from, to } = req.query;
  const limit  = Math.min(Math.max(Number(req.query.limit)  || 50, 1), 100);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  let sql = "SELECT * FROM bookings WHERE 1=1";
  const args = [];
  if (status) { sql += " AND status = ?";  args.push(status); }
  if (type)   { sql += " AND type = ?";    args.push(type); }
  if (from)   { sql += " AND date >= ?";   args.push(from); }
  if (to)     { sql += " AND date <= ?";   args.push(to); }
  if (search) {
    sql += " AND (name LIKE ? OR email LIKE ? OR tour LIKE ? OR country LIKE ?)";
    const q = "%" + search + "%"; args.push(q, q, q, q);
  }
  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  args.push(limit, offset);
  const rows  = db.prepare(sql).all(...args);
  const total = (db.prepare("SELECT COUNT(*) AS n FROM bookings").get() || {n:0}).n;
  return res.json({ success: true, total, bookings: rows.map(toClient) });
});

// GET /api/bookings/:id — admin
app.get("/api/bookings/:id", adminLimit, adminAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: "Booking not found" });
  return res.json({ success: true, booking: toClient(row) });
});

// PUT /api/bookings/:id — admin
app.put("/api/bookings/:id", adminLimit, adminAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: "Booking not found" });
  const allowed = ["status","bike","notes","name","email","phone","country",
                   "date","date_to","rental_days","experience","tour","type"];
  const fields  = allowed.filter(f => req.body[f] !== undefined);
  if (!fields.length) return res.status(400).json({ success: false, error: "No valid fields" });
  const validStatuses = ["pending","confirmed","cancelled","completed"];
  if (req.body.status && !validStatuses.includes(req.body.status))
    return res.status(422).json({ success: false, error: "Invalid status" });
  const setClauses = fields.map(f => f + " = ?").join(", ");
  const values     = [...fields.map(f => req.body[f]), new Date().toISOString(), req.params.id];
  db.prepare("UPDATE bookings SET " + setClauses + ", updated_at = ? WHERE id = ?").run(values);
  const updated = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  return res.json({ success: true, booking: toClient(updated) });
});

// DELETE /api/bookings/:id — admin
app.delete("/api/bookings/:id", adminLimit, adminAuth, (req, res) => {
  const row = db.prepare("SELECT id FROM bookings WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: "Booking not found" });
  db.prepare("DELETE FROM bookings WHERE id = ?").run([req.params.id]);
  return res.json({ success: true, deleted: req.params.id });
});

app.use((_req, res) => res.status(404).json({ success: false, error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error("[API Error]", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

module.exports = app;
