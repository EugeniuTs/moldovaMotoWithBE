"use strict";
/**
 * app.js — Express application factory (exported for testing)
 * The server start (listen) happens in index.js.
 */
const express   = require("express");
const cors      = require("cors");
const rateLimit = require("express-rate-limit");
const db        = require("./db");
const { validateBooking } = require("./validate");

const ADMIN_KEY = process.env.API_ADMIN_KEY || "dev-admin-key-change-in-prod";

const uid = () => "b" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

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
  if (key && key === ADMIN_KEY) return next();
  return res.status(401).json({ success: false, error: "Admin key required" });
}

const app = express();

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false }));

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",").map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
}));

const publicLimit = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100, // generous in test/dev
  message: { success: false, error: "Too many requests. Please try again later." },
  standardHeaders: true, legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

// Health check (public)
app.get("/api/health", (_req, res) =>
  res.json({ success: true, status: "ok", ts: new Date().toISOString() })
);

// POST /api/bookings — public, rate-limited
app.post("/api/bookings", publicLimit, (req, res) => {
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
  return res.status(201).json({
    success: true, booking_id: id, status: "pending",
    message: "Booking received. We will confirm within 24 hours.",
    booking: toClient(booking),
  });
});

// GET /api/bookings/stats/summary — admin
app.get("/api/bookings/stats/summary", adminAuth, (_req, res) => {
  const r = db.prepare(
    "SELECT COUNT(*) as total, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status='confirmed' THEN 1 ELSE 0 END) as confirmed, SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) as cancelled, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM bookings"
  ).get() || {};
  return res.json({ success: true, stats: r });
});

// GET /api/bookings — admin
app.get("/api/bookings", adminAuth, (req, res) => {
  const { status, type, search, from, to } = req.query;
  const limit  = Math.min(Number(req.query.limit) || 200, 500);
  const offset = Number(req.query.offset) || 0;
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
app.get("/api/bookings/:id", adminAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM bookings WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, error: "Booking not found" });
  return res.json({ success: true, booking: toClient(row) });
});

// PUT /api/bookings/:id — admin
app.put("/api/bookings/:id", adminAuth, (req, res) => {
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
app.delete("/api/bookings/:id", adminAuth, (req, res) => {
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
