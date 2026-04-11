"use strict";
/**
 * db.js - SQLite wrapper using sql.js (pure JS, no native modules).
 * Keeps the DB in memory, flushes to disk after every write.
 */
const path = require("path");
const fs   = require("fs");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "moldovamoto.db");

const initSqlJs = require("sql.js");
let _db = null;

function flush() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initDB() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id           TEXT PRIMARY KEY,
      type         TEXT NOT NULL DEFAULT 'guided',
      tour         TEXT NOT NULL,
      departure_id TEXT,
      name         TEXT NOT NULL,
      email        TEXT NOT NULL,
      phone        TEXT,
      country      TEXT,
      date         TEXT,
      date_to      TEXT,
      rental_days  INTEGER,
      experience   TEXT,
      bike         TEXT,
      status       TEXT NOT NULL DEFAULT 'pending',
      notes        TEXT,
      created_at   TEXT NOT NULL,
      updated_at   TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_status  ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_date    ON bookings(date);
    CREATE INDEX IF NOT EXISTS idx_bookings_email   ON bookings(email);
    CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);
  `);

  flush();
  console.log("[DB] SQLite ready at " + DB_PATH);
  return _db;
}

/* Thin synchronous-style wrapper so routes stay readable */
const db = {
  name: DB_PATH,

  prepare(sql) {
    return {
      run(params) {
        _db.run(sql, params);
        flush();
        return {};
      },
      get(...args) {
        const stmt = _db.prepare(sql);
        const positional = args.map(v => (v === undefined ? null : v));
        if (positional.length) stmt.bind(positional);
        const result = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return result;
      },
      all(...args) {
        const results = [];
        const stmt = _db.prepare(sql);
        const positional = args.map(v => (v === undefined ? null : v));
        if (positional.length) stmt.bind(positional);
        while (stmt.step()) results.push(stmt.getAsObject());
        stmt.free();
        return results;
      },
    };
  },

  exec(sql) { _db.run(sql); flush(); },
};

db.dbReady = initDB();
module.exports = db;
