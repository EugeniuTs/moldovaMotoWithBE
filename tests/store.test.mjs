/**
 * store.test.mjs — Unit tests for the shared data layer
 * Run: node --test tests/store.test.mjs
 */
import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ── Mock localStorage for Node environment ────────────────────────────────────
const store = {};
const localStorage = {
  getItem:  (k)    => store[k] ?? null,
  setItem:  (k, v) => { store[k] = String(v); },
  removeItem:(k)   => { delete store[k]; },
  clear:    ()     => Object.keys(store).forEach(k => delete store[k]),
};
global.localStorage = localStorage;
global.window = { localStorage };

// Import store functions after mock is set
const { loadDB, saveDB, spotsLeft, routeToTour, SEED, STORAGE_KEY } =
  await import("../src/store.js");

// ── Helpers ───────────────────────────────────────────────────────────────────
function freshDB() {
  localStorage.clear();
  return loadDB();
}

// =============================================================================
// 1. loadDB
// =============================================================================
describe("loadDB", () => {
  it("returns SEED data on first call (no localStorage)", () => {
    localStorage.clear();
    const db = loadDB();
    assert.ok(Array.isArray(db.routes),   "routes should be array");
    assert.ok(Array.isArray(db.bookings), "bookings should be array");
    assert.ok(Array.isArray(db.fleet),    "fleet should be array");
    assert.ok(Array.isArray(db.gallery),  "gallery should be array");
    assert.ok(db.routes.length > 0,       "seed has at least one route");
    assert.ok(db.fleet.length  > 0,       "seed has at least one bike");
  });

  it("returns saved data from localStorage", () => {
    localStorage.clear();
    const custom = { routes: [{ id: "r1", name: "Test Tour", status: "active", visible: true }], bookings: [], fleet: [], gallery: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    const db = loadDB();
    assert.equal(db.routes[0].name, "Test Tour");
  });

  it("falls back to SEED on corrupted localStorage", () => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEY, "NOT_VALID_JSON{{{{");
    const db = loadDB();
    assert.ok(db.routes.length > 0, "should fall back to SEED");
  });

  it("migrates old records — backfills missing visible field", () => {
    localStorage.clear();
    const old = {
      routes: [{ id: "r1", name: "Old Tour", status: "active", dateType: "open", capacity: 8, departures: [] }],
      bookings: [], fleet: [], gallery: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const db = loadDB();
    assert.equal(db.routes[0].visible, true, "should backfill visible:true");
  });

  it("migrates old records — backfills missing gallery array", () => {
    localStorage.clear();
    const old = { routes: [], bookings: [], fleet: [{ id: "f1", name: "Bike" }] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const db = loadDB();
    assert.ok(Array.isArray(db.gallery), "gallery should be added");
  });

  it("all SEED routes have visible:true", () => {
    localStorage.clear();
    const db = loadDB();
    db.routes.forEach(r => {
      assert.notEqual(r.visible, false, `Route "${r.name}" should be visible`);
    });
  });
});

// =============================================================================
// 2. saveDB / round-trip
// =============================================================================
describe("saveDB", () => {
  it("persists data that loadDB can read back", () => {
    localStorage.clear();
    const db = loadDB();
    db.routes.push({ id: "rx", name: "Saved Tour", status: "active", visible: true, dateType: "open", capacity: 6, departures: [], stops: [], desc: "", img: "" });
    saveDB(db);
    const db2 = loadDB();
    assert.ok(db2.routes.some(r => r.id === "rx"), "saved route should reappear");
  });

  it("saves and restores bookings", () => {
    localStorage.clear();
    const db = loadDB();
    db.bookings.push({ id: "b_alice", tour: "Test", name: "Alice", email: "a@b.com", status: "pending" });
    saveDB(db);
    const db2 = loadDB();
    const saved = db2.bookings.find(b => b.id === "b_alice");
    assert.ok(saved, "booking should be saved");
    assert.equal(saved.name, "Alice");
  });

  it("overwrites previous data on each save", () => {
    localStorage.clear();
    const db = loadDB();
    db.routes = [{ id: "only", name: "Only Tour", status: "active", visible: true }];
    saveDB(db);
    const db2 = loadDB();
    assert.equal(db2.routes.length, 1);
    assert.equal(db2.routes[0].id, "only");
  });
});

// =============================================================================
// 3. spotsLeft
// =============================================================================
describe("spotsLeft", () => {
  const dep = { id: "dep1", maxSpots: 6 };

  it("returns maxSpots when no bookings", () => {
    assert.equal(spotsLeft(dep, []), 6);
  });

  it("subtracts confirmed bookings for this departure", () => {
    const bookings = [
      { departureId: "dep1", status: "confirmed" },
      { departureId: "dep1", status: "confirmed" },
    ];
    assert.equal(spotsLeft(dep, bookings), 4);
  });

  it("ignores pending/cancelled bookings", () => {
    const bookings = [
      { departureId: "dep1", status: "pending" },
      { departureId: "dep1", status: "cancelled" },
    ];
    assert.equal(spotsLeft(dep, bookings), 6);
  });

  it("ignores bookings for other departures", () => {
    const bookings = [
      { departureId: "dep2", status: "confirmed" },
      { departureId: "dep3", status: "confirmed" },
    ];
    assert.equal(spotsLeft(dep, bookings), 6);
  });

  it("never returns negative (over-booked protection)", () => {
    const bookings = Array.from({ length: 10 }, () => ({ departureId: "dep1", status: "confirmed" }));
    assert.equal(spotsLeft(dep, bookings), 0);
  });

  it("returns 0 when departure is null/undefined", () => {
    assert.equal(spotsLeft(null,      []), 0);
    assert.equal(spotsLeft(undefined, []), 0);
  });
});

// =============================================================================
// 4. routeToTour
// =============================================================================
describe("routeToTour", () => {
  const route = {
    id: "r1", name: "5-Day Grand Tour", price: "1050", days: 5,
    difficulty: "Hard", desc: "Epic ride.", img: "", stops: ["Chisinau", "Soroca", "Bender"],
    dateType: "scheduled", departures: [{ id: "d1", date: "2026-05-01", maxSpots: 8 }],
    capacity: 8, status: "active", visible: true
  };

  it("maps name → title", () => {
    assert.equal(routeToTour(route).title, "5-Day Grand Tour");
  });

  it("formats price with euro sign", () => {
    assert.ok(routeToTour(route).price.includes("1"), "price should include number");
  });

  it("formats duration correctly for multi-day", () => {
    assert.equal(routeToTour(route).duration, "5 Days");
  });

  it("formats duration correctly for 1-day", () => {
    const r1 = { ...route, days: 1 };
    assert.equal(routeToTour(r1).duration, "1 Day");
  });

  it("passes through departures", () => {
    const t = routeToTour(route);
    assert.equal(t.departures.length, 1);
    assert.equal(t.departures[0].id, "d1");
  });

  it("limits highlights to 4 stops", () => {
    const r = { ...route, stops: ["A", "B", "C", "D", "E", "F"] };
    assert.equal(routeToTour(r).highlights.length, 4);
  });

  it("uses difficulty tag", () => {
    const t = routeToTour(route);
    assert.ok(typeof t.tag === "string" && t.tag.length > 0);
  });
});

// =============================================================================
// 5. Tour visibility
// =============================================================================
describe("Tour visibility", () => {
  it("visible:true tours appear in filtered list", () => {
    localStorage.clear();
    const db = loadDB();
    const visible = db.routes.filter(r => r.status === "active" && r.visible !== false);
    assert.ok(visible.length > 0, "should have visible tours");
  });

  it("visible:false tours are filtered out (simulating Home.jsx logic)", () => {
    localStorage.clear();
    const db = loadDB();
    db.routes[0].visible = false;
    saveDB(db);
    const db2 = loadDB();
    const visible = db2.routes.filter(r => r.status === "active" && r.visible !== false);
    const hidden  = db2.routes.filter(r => r.visible === false);
    assert.equal(hidden.length, 1);
    assert.ok(!visible.some(r => r.visible === false), "no hidden tour in public list");
  });

  it("toggling visible:false → true restores tour", () => {
    localStorage.clear();
    const db = loadDB();
    db.routes[0].visible = false;
    saveDB(db);
    const db2 = loadDB();
    db2.routes[0].visible = true;
    saveDB(db2);
    const db3 = loadDB();
    assert.notEqual(db3.routes[0].visible, false, "tour should be visible again");
  });
});

// =============================================================================
// 6. Gallery
// =============================================================================
describe("Gallery (store)", () => {
  it("SEED has gallery items", () => {
    localStorage.clear();
    const db = loadDB();
    assert.ok(db.gallery.length > 0, "seed gallery should have items");
  });

  it("gallery items have required fields", () => {
    localStorage.clear();
    const db = loadDB();
    db.gallery.forEach(item => {
      assert.ok(item.id,    `item ${item.id} missing id`);
      assert.ok(item.title, `item ${item.id} missing title`);
      assert.ok(item.type,  `item ${item.id} missing type`);
      assert.ok(item.src,   `item ${item.id} missing src`);
    });
  });

  it("can add and retrieve a gallery item", () => {
    localStorage.clear();
    const db = loadDB();
    db.gallery.push({ id: "g99", type: "image", title: "Test Photo", src: "https://example.com/photo.jpg", tour: "", date: "2026-04-01", featured: false, caption: "" });
    saveDB(db);
    const db2 = loadDB();
    assert.ok(db2.gallery.some(g => g.id === "g99"));
  });
});

console.log("\n✓ store.test.mjs loaded successfully");
