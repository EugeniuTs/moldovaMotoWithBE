/**
 * api.test.mjs — Backend API tests for MoldovaMoto booking system
 * Spawns the server as a child process to avoid module cache issues.
 * Run: node --test tests/api.test.mjs
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http   from "node:http";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, "..");

// ── HTTP helpers ──────────────────────────────────────────────────────────────
const PORT       = 14399;
const ADMIN_KEY  = "test-admin-key-" + process.pid;

function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "127.0.0.1", port: PORT, path, method,
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": payload ? Buffer.byteLength(payload) : 0,
        ...headers,
      },
    };
    const r = http.request(options, res => {
      let data = "";
      res.on("data", c => { data += c; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}
const get  = (p, h={})    => req("GET",    p, null, h);
const post = (p, b, h={}) => req("POST",   p, b, h);
const put  = (p, b, h={}) => req("PUT",    p, b, h);
const del  = (p, h={})    => req("DELETE", p, null, h);
const adm  = () => ({ "x-admin-key": ADMIN_KEY });

// ── Server lifecycle ──────────────────────────────────────────────────────────
let proc;

before(async () => {
  const dataDir = "/tmp/mmoto-test-" + process.pid;
  proc = spawn(process.execPath, [resolve(root, "server/index.js")], {
    env: {
      ...process.env,
      API_PORT:      String(PORT),
      API_ADMIN_KEY: ADMIN_KEY,
      DATA_DIR:      dataDir,
      CORS_ORIGINS:  "http://localhost:3000",
      NODE_ENV:      "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  proc.stderr.on("data", d => {
    if (!String(d).includes("listening")) process.stderr.write("[API] " + d);
  });

  // Wait until server is ready (up to 10s)
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Server startup timeout")), 10000);
    const check = () => {
      http.get(`http://127.0.0.1:${PORT}/api/health`, res => {
        clearTimeout(timeout);
        resolve();
      }).on("error", () => setTimeout(check, 200));
    };
    check();
  });
});

after(() => {
  if (proc) proc.kill();
});

// =============================================================================
// 1. HEALTH
// =============================================================================
describe("API health", () => {
  it("GET /api/health returns 200 with ok status", async () => {
    const { status, body } = await get("/api/health");
    assert.equal(status, 200);
    assert.ok(body.success);
    assert.equal(body.status, "ok");
    assert.ok(body.ts);
  });

  it("Unknown route returns 404", async () => {
    const { status, body } = await get("/api/unknown");
    assert.equal(status, 404);
    assert.ok(!body.success);
  });
});

// =============================================================================
// 2. CREATE BOOKING — positive
// =============================================================================
describe("POST /api/bookings — positive", () => {
  it("Creates a guided tour booking", async () => {
    const { status, body } = await post("/api/bookings", {
      name: "Klaus Bauer", email: "k@bauer.de", tour: "3-Day Moldova Adventure",
      experience: "advanced", type: "guided", date: "2026-08-01",
      phone: "+49170123", country: "DE",
    });
    assert.equal(status, 201);
    assert.ok(body.success);
    assert.ok(body.booking_id, "must return booking_id");
    assert.equal(body.status, "pending");
    assert.ok(body.message.includes("24 hours"));
    assert.equal(body.booking.name, "Klaus Bauer");
    assert.equal(body.booking.status, "pending");
    assert.equal(body.booking.type, "guided");
  });

  it("Creates a rental booking with date range", async () => {
    const { status, body } = await post("/api/bookings", {
      name: "Sophie Laurent", email: "s@free.fr", tour: "Free Motorcycle Rental",
      experience: "intermediate", type: "rental",
      date: "2026-09-01", date_to: "2026-09-07", rental_days: 6,
      country: "FR",
    });
    assert.equal(status, 201);
    assert.equal(body.booking.type, "rental");
    assert.equal(body.booking.dateTo, "2026-09-07");
    assert.equal(body.booking.rentalDays, 6);
  });

  it("Two bookings get unique IDs", async () => {
    const r1 = await post("/api/bookings", { name:"A Rider", email:"a@a.com", tour:"Test Tour", experience:"beginner", type:"guided" });
    const r2 = await post("/api/bookings", { name:"B Rider", email:"b@b.com", tour:"Test Tour", experience:"beginner", type:"guided" });
    assert.notEqual(r1.body.booking_id, r2.body.booking_id);
    assert.ok(r1.body.booking_id.length > 8);
  });

  it("Optional fields (phone, country, bike) can be omitted", async () => {
    const { status, body } = await post("/api/bookings", {
      name: "Minimal Rider", email: "m@m.com",
      tour: "1-Day Wine Ride", experience: "beginner", type: "guided",
    });
    assert.equal(status, 201);
    assert.equal(body.booking.phone,   null);
    assert.equal(body.booking.country, null);
    assert.equal(body.booking.bike,    null);
  });

  it("Booking starts with status=pending", async () => {
    const { body } = await post("/api/bookings", { name:"Status Test", email:"st@st.com", tour:"Test Tour", experience:"beginner", type:"guided" });
    assert.equal(body.booking.status, "pending");
  });

  it("createdAt is today's date", async () => {
    const { body } = await post("/api/bookings", { name:"Date Test", email:"dt@dt.com", tour:"Test Tour", experience:"beginner", type:"guided" });
    assert.equal(body.booking.createdAt, new Date().toISOString().slice(0,10));
  });

  it("Strips HTML from name/tour (XSS protection)", async () => {
    const { status, body } = await post("/api/bookings", {
      name: "<script>xss</script>Klaus", email: "xss@x.com",
      tour: "<b>Moldova</b> Tour", experience: "beginner", type: "guided",
    });
    assert.equal(status, 201);
    assert.ok(!body.booking.name.includes("<script>"));
    assert.ok(!body.booking.tour.includes("<b>"));
    assert.ok(body.booking.name.includes("Klaus"));
  });
});

// =============================================================================
// 3. CREATE BOOKING — validation errors
// =============================================================================
describe("POST /api/bookings — validation", () => {
  it("422 when name missing",      async () => { const {status,body}=await post("/api/bookings",{email:"x@x.com",tour:"Test Tour",experience:"beginner",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.name); });
  it("422 when name too short",    async () => { const {status,body}=await post("/api/bookings",{name:"X",email:"x@x.com",tour:"Test Tour",experience:"beginner",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.name); });
  it("422 when email missing",     async () => { const {status,body}=await post("/api/bookings",{name:"Test",tour:"Test Tour",experience:"beginner",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.email); });
  it("422 when email has no @",    async () => { const {status,body}=await post("/api/bookings",{name:"Test",email:"notanemail",tour:"Test Tour",experience:"beginner",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.email); });
  it("422 when tour missing",      async () => { const {status,body}=await post("/api/bookings",{name:"Test",email:"t@t.com",experience:"beginner",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.tour); });
  it("422 when experience missing",async () => { const {status,body}=await post("/api/bookings",{name:"Test",email:"t@t.com",tour:"Test Tour",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.experience); });
  it("422 when experience invalid",async () => { const {status,body}=await post("/api/bookings",{name:"Test",email:"t@t.com",tour:"Test Tour",experience:"ninja",type:"guided"}); assert.equal(status,422); assert.ok(body.errors.experience); });

  it("422 when rental has no start date", async () => {
    const { status, body } = await post("/api/bookings", { name:"T",email:"t@t.com",tour:"Test Tour",experience:"beginner",type:"rental" });
    assert.equal(status, 422); assert.ok(body.errors.date);
  });

  it("422 when rental end date before start", async () => {
    const { status, body } = await post("/api/bookings", { name:"T",email:"t@t.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2026-10-10",date_to:"2026-10-05" });
    assert.equal(status, 422); assert.ok(body.errors.date_to);
  });

  it("422 when rental end date equals start", async () => {
    const { status, body } = await post("/api/bookings", { name:"T",email:"t@t.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2026-10-10",date_to:"2026-10-10" });
    assert.equal(status, 422); assert.ok(body.errors.date_to);
  });

  it("Returns multiple errors when multiple fields invalid", async () => {
    const { status, body } = await post("/api/bookings", { name:"", email:"bad", tour:"" });
    assert.equal(status, 422);
    assert.ok(Object.keys(body.errors).length >= 3);
  });
});

// =============================================================================
// 4. BIKE DOUBLE-BOOKING
// =============================================================================
describe("Bike double-booking prevention", () => {
  const bike = "CFMOTO-TEST-" + process.pid;

  it("409 when bike already booked for overlapping dates", async () => {
    await post("/api/bookings", { name:"Rider1",email:"r1@r.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2027-03-01",date_to:"2027-03-07",bike });
    const { status, body } = await post("/api/bookings", { name:"Rider2",email:"r2@r.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2027-03-05",date_to:"2027-03-10",bike });
    assert.equal(status, 409);
    assert.ok(body.errors.bike);
  });

  it("201 for same bike on adjacent non-overlapping dates", async () => {
    const b2 = "CFMOTO-ADJ-" + process.pid;
    await post("/api/bookings", { name:"RiderA",email:"ra@r.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2027-04-01",date_to:"2027-04-05",bike:b2 });
    const { status } = await post("/api/bookings", { name:"RiderB",email:"rb@r.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2027-04-06",date_to:"2027-04-10",bike:b2 });
    assert.equal(status, 201);
  });

  it("Cancelled booking does NOT block bike", async () => {
    const b3 = "CFMOTO-CXL-" + process.pid;
    const { body: created } = await post("/api/bookings", { name:"Rider3",email:"r3@r.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2027-05-01",date_to:"2027-05-05",bike:b3 });
    await put("/api/bookings/" + created.booking_id, { status:"cancelled" }, adm());
    const { status } = await post("/api/bookings", { name:"Rider4",email:"r4@r.com",tour:"Test Tour",experience:"beginner",type:"rental",date:"2027-05-01",date_to:"2027-05-05",bike:b3 });
    assert.equal(status, 201);
  });
});

// =============================================================================
// 5. LIST BOOKINGS — admin
// =============================================================================
describe("GET /api/bookings — admin", () => {
  it("401 without admin key",       async () => { assert.equal((await get("/api/bookings")).status, 401); });
  it("401 with wrong key",          async () => { assert.equal((await get("/api/bookings",{"x-admin-key":"wrong"})).status, 401); });

  it("200 with valid admin key", async () => {
    const { status, body } = await get("/api/bookings", adm());
    assert.equal(status, 200);
    assert.ok(body.success);
    assert.ok(Array.isArray(body.bookings));
    assert.ok(typeof body.total === "number");
  });

  it("Filters by status=pending", async () => {
    const { body } = await get("/api/bookings?status=pending", adm());
    body.bookings.forEach(b => assert.equal(b.status, "pending"));
  });

  it("Filters by type=rental", async () => {
    const { body } = await get("/api/bookings?type=rental", adm());
    body.bookings.forEach(b => assert.equal(b.type, "rental"));
  });

  it("Searches by name (unique string)", async () => {
    const tag = "UniqueNameXYZ" + process.pid;
    await post("/api/bookings", { name:tag, email:"u@u.com", tour:"Test Tour", experience:"beginner", type:"guided" });
    const { body } = await get("/api/bookings?search=" + tag, adm());
    assert.ok(body.bookings.some(b => b.name === tag));
  });
});

// =============================================================================
// 6. GET SINGLE BOOKING — admin
// =============================================================================
describe("GET /api/bookings/:id — admin", () => {
  it("Returns booking by ID", async () => {
    const { body: created } = await post("/api/bookings", { name:"Get Test",email:"g@g.com",tour:"Test Tour",experience:"beginner",type:"guided" });
    const { status, body } = await get("/api/bookings/" + created.booking_id, adm());
    assert.equal(status, 200);
    assert.equal(body.booking.name, "Get Test");
  });

  it("404 for non-existent ID", async () => {
    const { status } = await get("/api/bookings/b_does_not_exist_xyz", adm());
    assert.equal(status, 404);
  });
});

// =============================================================================
// 7. UPDATE BOOKING — admin
// =============================================================================
describe("PUT /api/bookings/:id — admin", () => {
  let id;
  before(async () => {
    const { body } = await post("/api/bookings", { name:"Update Test",email:"u@u.com",tour:"Test Tour",experience:"beginner",type:"guided" });
    id = body.booking_id;
  });

  it("Confirms booking (pending -> confirmed)", async () => {
    const { status, body } = await put("/api/bookings/" + id, { status:"confirmed" }, adm());
    assert.equal(status, 200);
    assert.equal(body.booking.status, "confirmed");
  });

  it("Cancels booking (-> cancelled)", async () => {
    const { body } = await put("/api/bookings/" + id, { status:"cancelled" }, adm());
    assert.equal(body.booking.status, "cancelled");
  });

  it("Completes booking (-> completed)", async () => {
    const { body } = await put("/api/bookings/" + id, { status:"completed" }, adm());
    assert.equal(body.booking.status, "completed");
  });

  it("Updates bike assignment", async () => {
    const { body } = await put("/api/bookings/" + id, { bike:"CFMOTO 800MT #3" }, adm());
    assert.equal(body.booking.bike, "CFMOTO 800MT #3");
  });

  it("Updates notes field", async () => {
    const { body } = await put("/api/bookings/" + id, { notes:"VIP customer" }, adm());
    assert.equal(body.booking.notes, "VIP customer");
  });

  it("422 for invalid status value", async () => {
    const { status } = await put("/api/bookings/" + id, { status:"flying" }, adm());
    assert.equal(status, 422);
  });

  it("404 for non-existent ID", async () => {
    const { status } = await put("/api/bookings/ghost_xyz", { status:"confirmed" }, adm());
    assert.equal(status, 404);
  });

  it("401 without admin key", async () => {
    const { status } = await put("/api/bookings/" + id, { status:"confirmed" });
    assert.equal(status, 401);
  });

  it("updatedAt reflects the update time", async () => {
    const { body: b1 } = await get("/api/bookings/" + id, adm());
    await new Promise(r => setTimeout(r, 50));
    await put("/api/bookings/" + id, { notes:"updated again" }, adm());
    const { body: b2 } = await get("/api/bookings/" + id, adm());
    assert.ok(b2.booking.updatedAt >= b1.booking.updatedAt);
  });
});

// =============================================================================
// 8. DELETE BOOKING — admin
// =============================================================================
describe("DELETE /api/bookings/:id — admin", () => {
  it("Deletes a booking and it becomes 404", async () => {
    const { body: c } = await post("/api/bookings", { name:"Del Me",email:"d@d.com",tour:"Test Tour",experience:"beginner",type:"guided" });
    const { status, body } = await del("/api/bookings/" + c.booking_id, adm());
    assert.equal(status, 200);
    assert.equal(body.deleted, c.booking_id);
    assert.equal((await get("/api/bookings/" + c.booking_id, adm())).status, 404);
  });

  it("404 for non-existent booking", async () => {
    assert.equal((await del("/api/bookings/ghost_id_xyz", adm())).status, 404);
  });

  it("401 without admin key", async () => {
    const { body: c } = await post("/api/bookings", { name:"Auth Test",email:"at@at.com",tour:"Test Tour",experience:"beginner",type:"guided" });
    assert.equal((await del("/api/bookings/" + c.booking_id)).status, 401);
  });
});

// =============================================================================
// 9. STATS
// =============================================================================
describe("GET /api/bookings/stats/summary — admin", () => {
  it("Returns correct stats shape", async () => {
    const { status, body } = await get("/api/bookings/stats/summary", adm());
    assert.equal(status, 200);
    assert.ok(body.success);
    ["total","pending","confirmed","cancelled","completed"].forEach(k =>
      assert.ok(typeof body.stats[k] === "number", k + " must be number")
    );
  });

  it("total = sum of all statuses", async () => {
    const { body } = await get("/api/bookings/stats/summary", adm());
    const s = body.stats;
    assert.equal(s.total, s.pending + s.confirmed + s.cancelled + s.completed);
  });

  it("401 without admin key", async () => {
    assert.equal((await get("/api/bookings/stats/summary")).status, 401);
  });
});

// =============================================================================
// 10. PERSISTENCE — full round-trip
// =============================================================================
describe("Data persistence round-trip", () => {
  it("All fields persist and read back correctly", async () => {
    const payload = {
      name:"Full Fields", email:"ff@ff.com", tour:"5-Day Grand Moldova Tour",
      experience:"advanced", type:"rental", date:"2027-06-10", date_to:"2027-06-17",
      rental_days:7, phone:"+49301234", country:"DE", bike:"CFMOTO 800MT #2",
      departure_id:"dep-abc",
    };
    const { body: created } = await post("/api/bookings", payload);
    const { body } = await get("/api/bookings/" + created.booking_id, adm());
    const b = body.booking;
    assert.equal(b.name,        payload.name);
    assert.equal(b.email,       payload.email);
    assert.equal(b.tour,        payload.tour);
    assert.equal(b.type,        payload.type);
    assert.equal(b.date,        payload.date);
    assert.equal(b.dateTo,      payload.date_to);
    assert.equal(b.rentalDays,  payload.rental_days);
    assert.equal(b.phone,       payload.phone);
    assert.equal(b.country,     payload.country);
    assert.equal(b.bike,        payload.bike);
    assert.equal(b.departureId, payload.departure_id);
  });

  it("30 concurrent bookings all persist with unique IDs", async () => {
    const results = await Promise.all(
      Array.from({length:30}, (_,i) => post("/api/bookings", {
        name:`Concurrent ${i}`, email:`c${i}@c.com`,
        tour:"1-Day Wine Ride", experience:"beginner", type:"guided",
      }))
    );
    const ids = results.map(r => r.body.booking_id);
    assert.equal(new Set(ids).size, 30, "all IDs must be unique");
    results.forEach(r => assert.equal(r.status, 201));
  });
});

// =============================================================================
// 11. FRONTEND FILES — structure checks
// =============================================================================
describe("Frontend api.js structure", () => {
  const apiSrc = readFileSync(resolve(root, "src/api.js"), "utf8");
  it("exports createBooking",              () => assert.ok(apiSrc.includes("export async function createBooking")));
  it("exports fetchBookings",              () => assert.ok(apiSrc.includes("export async function fetchBookings")));
  it("exports updateBooking",              () => assert.ok(apiSrc.includes("export async function updateBooking")));
  it("exports deleteBooking",              () => assert.ok(apiSrc.includes("export async function deleteBooking")));
  it("exports healthCheck",                () => assert.ok(apiSrc.includes("export async function healthCheck")));
  it("uses VITE_API_URL env var",          () => assert.ok(apiSrc.includes("VITE_API_URL")));
  it("POSTs to /bookings endpoint",        () => assert.ok(apiSrc.includes("/bookings")));
  it("throws on API errors",               () => assert.ok(apiSrc.includes("throw")));
  it("exposes field-level errors",         () => assert.ok(apiSrc.includes("err.errors")));
  it("api.js has no localStorage",         () => assert.ok(!apiSrc.includes("localStorage")));
  it("api.js has no sessionStorage",       () => assert.ok(!apiSrc.includes("sessionStorage")));
});

describe("Home.jsx booking flow uses API", () => {
  const src = readFileSync(resolve(root, "src/pages/Home.jsx"), "utf8");
  it("imports createBooking from api.js",  () => assert.ok(src.includes("createBooking") && src.includes("../api.js")));
  it("submit() is async",                  () => assert.ok(src.includes("const submit = async")));
  it("calls createBooking(payload)",       () => assert.ok(src.includes("createBooking(payload)")));
  it("no longer calls saveDB for bookings",() => assert.ok(!src.includes("saveDB({ ...db, bookings:")));
  it("has submitting loading state",       () => assert.ok(src.includes("submitting") && src.includes("setSubmitting")));
  it("has apiError state",                 () => assert.ok(src.includes("apiError") && src.includes("setApiError")));
  it("has confirmedId state",              () => assert.ok(src.includes("confirmedId") && src.includes("setConfirmedId")));
  it("button shows submitting state via i18n",() => assert.ok(src.includes("t(\"book.s4.sending\")")));
  it("button disabled while submitting",   () => assert.ok(src.includes("disabled={submitting}")));
  it("shows booking ID in confirmation",   () => assert.ok(src.includes("book.done.bookingId") && src.includes("confirmedId")));
  it("jumps to step 3 on validation error",() => assert.ok(src.includes("setStep(3)")));
  it("shows API error banner",             () => assert.ok(src.includes("apiError &&")));
});

console.log("\n✓ api.test.mjs loaded");

// =============================================================================
// 12. FILE UPLOAD ENDPOINTS
// =============================================================================
describe("File upload — /api/uploads", () => {
  // Minimal valid PNG (1×1 pixel)
  const PNG = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108020000009053de00" +
    "0000" + "0c4944415478" + "9cc3f80f00000101000518d84e00000000" + "49454e44ae426082",
    "hex"
  );

  async function upload(buf, name, mime, key = ADMIN_KEY) {
    return new Promise((resolve, reject) => {
      const boundary = "----TestBoundary" + Date.now();
      const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${name}"\r\nContent-Type: ${mime}\r\n\r\n`),
        buf,
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);
      const options = {
        hostname: "127.0.0.1", port: PORT, path: "/api/uploads", method: "POST",
        headers: {
          "Content-Type":   `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
          "x-admin-key":    key,
        },
      };
      const r = http.request(options, res => {
        let data = "";
        res.on("data", c => { data += c; });
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      });
      r.on("error", reject);
      r.write(body);
      r.end();
    });
  }

  it("401 when no admin key", async () => {
    const { status } = await upload(PNG, "test.png", "image/png", "");
    assert.equal(status, 401);
  });

  it("Uploads a PNG and returns url + filename + size", async () => {
    const { status, body } = await upload(PNG, "ride.png", "image/png");
    assert.equal(status, 201);
    assert.ok(body.success);
    assert.ok(body.url.startsWith("/uploads/"), "url must start with /uploads/");
    assert.ok(body.filename, "must return filename");
    assert.ok(body.size > 0, "must return file size");
    assert.equal(body.mimetype, "image/png");
  });

  it("Uploaded file is accessible via GET /uploads/:filename", async () => {
    const { body: up } = await upload(PNG, "access.png", "image/png");
    const { status } = await get(up.url);
    assert.equal(status, 200, "uploaded file must be publicly accessible");
  });

  it("Filename is unique (timestamp + random hash)", async () => {
    const r1 = await upload(PNG, "same.png", "image/png");
    const r2 = await upload(PNG, "same.png", "image/png");
    assert.notEqual(r1.body.filename, r2.body.filename, "same filename must get unique server names");
  });

  it("GET /api/uploads lists uploaded files", async () => {
    await upload(PNG, "list.png", "image/png");
    const { status, body } = await get("/api/uploads", adm());
    assert.equal(status, 200);
    assert.ok(body.success);
    assert.ok(Array.isArray(body.files));
    assert.ok(body.files.length > 0);
    assert.ok(body.files[0].url.startsWith("/uploads/"));
    assert.ok(typeof body.files[0].size === "number");
  });

  it("GET /api/uploads returns 401 without key", async () => {
    assert.equal((await get("/api/uploads")).status, 401);
  });

  it("DELETE /api/uploads/:filename removes the file", async () => {
    const { body: up } = await upload(PNG, "del.png", "image/png");
    const { status, body } = await del(`/api/uploads/${up.filename}`, adm());
    assert.equal(status, 200);
    assert.ok(body.success);
    assert.equal(body.deleted, up.filename);
    // File should return 404 now
    const { status: getStatus } = await get(up.url);
    assert.equal(getStatus, 404, "deleted file must return 404");
  });

  it("DELETE non-existent file returns 404", async () => {
    const { status } = await del("/api/uploads/ghost_file.png", adm());
    assert.equal(status, 404);
  });

  it("DELETE /api/uploads/:filename returns 401 without key", async () => {
    const { body: up } = await upload(PNG, "auth.png", "image/png");
    const { status } = await del(`/api/uploads/${up.filename}`);
    assert.equal(status, 401);
  });
});
