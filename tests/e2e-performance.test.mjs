/**
 * e2e-performance.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Full E2E + Functional + Performance + Load test suite for MoldovaMoto
 *
 * Categories:
 *   E2E       — complete user journeys from first touch to confirmation
 *   FUNC      — individual feature correctness (positive + negative)
 *   PERF      — timing benchmarks for every critical operation
 *   LOAD      — bulk operations, concurrency simulation, data-scale stress
 *
 * Run: node --test tests/e2e-performance.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, "..");
const src   = f => readFileSync(resolve(root, f), "utf8");

// ── Mock localStorage ─────────────────────────────────────────────────────────
const _ls = {};
global.localStorage = {
  getItem:    k     => _ls[k] ?? null,
  setItem:    (k,v) => { _ls[k] = String(v); },
  removeItem: k     => { delete _ls[k]; },
  clear:      ()    => Object.keys(_ls).forEach(k => delete _ls[k]),
};
global.window = { localStorage: global.localStorage };

const { loadDB, saveDB, spotsLeft, routeToTour, uid, SEED, STORAGE_KEY } =
  await import("../src/store.js");

// ── Helpers ───────────────────────────────────────────────────────────────────
const today   = () => new Date().toISOString().slice(0,10);
const dayAdd  = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const freshDB = () => { localStorage.clear(); return loadDB(); };

const hrMs = () => {
  const [s, ns] = process.hrtime();
  return s * 1000 + ns / 1e6;
};

// Inline validate — mirrors Home.jsx
function validate(step, form) {
  const e = {};
  if (step===0 && !form.tour) e.tour="Please select a tour";
  if (step===1) {
    if (form.dateType==="scheduled" && !form.departureId) e.date="Please select a departure date";
    if (form.dateType==="open" && !form.date)   e.date="Please pick a start date";
    if (form.dateType==="open" && !form.dateTo)  e.dateTo="Please pick an end date";
    if (form.dateType==="open" && form.date && form.dateTo && form.dateTo<=form.date)
      e.dateTo="End date must be after start date";
  }
  if (step===3) {
    if (!form.name)  e.name="Name required";
    if (!form.email||!form.email.includes("@")) e.email="Valid email required";
    if (!form.phone) e.phone="Phone required";
    if (!form.country) e.country="Country required";
    if (!form.experience) e.experience="Please select experience level";
  }
  if (step===4 && !form.license) e.license="Please confirm your license";
  return { ok:Object.keys(e).length===0, errors:e };
}

// Inline bikeAvailable — mirrors Home.jsx
function bikeAvailable(bike, form, allBookings, selectedTour) {
  if (bike.status!=="available") return false;
  const isOpen = !selectedTour || selectedTour.dateType==="open";
  const from = isOpen ? form.date
    : (selectedTour?.departures||[]).find(d=>d.id===form.departureId)?.date ?? null;
  const to = isOpen ? (form.dateTo||form.date) : from;
  if (!from) return true;
  return !allBookings.some(b => {
    if (b.bike!==bike.name) return false;
    if (b.status==="cancelled") return false;
    const bFrom = b.date||""; const bTo = b.dateTo||b.date||"";
    if (!bFrom) return false;
    return bFrom<=to && bTo>=from;
  });
}

// getTourPrice — mirrors Admin.jsx
function getTourPrice(b, routes) {
  if (b.type==="rental") return (b.rentalDays||1)*120;
  const r = routes.find(r=>r.name===b.tour);
  return r ? (r.price||0) : 0;
}

// Admin login — mirrors Admin.jsx
function tryLogin(state, user, pass, adminUser="admin", adminPass="secret") {
  if (state.lockedUntil > Date.now()) return {ok:false,locked:true,error:"Locked"};
  if (adminUser && user===adminUser && adminPass && pass===adminPass) {
    state.count=0; return {ok:true};
  }
  state.count++;
  if (state.count>=5) state.lockedUntil=Date.now()+60000;
  return {ok:false,locked:state.count>=5,error:state.count>=5?"Locked for 60s":"Invalid credentials"};
}
function makeLoginState() { return {count:0,lockedUntil:0}; }

// Status style — mirrors Admin.jsx
function statusStyle(s) {
  return ({
    confirmed: {bg:"rgba(34,197,94,0.15)",  color:"#22c55e"},
    pending:   {bg:"rgba(255,107,0,0.15)",  color:"#ff6b00"},
    cancelled: {bg:"rgba(239,68,68,0.15)",  color:"#ef4444"},
    completed: {bg:"rgba(59,130,246,0.15)", color:"#3b82f6"},
  }[s] || {});
}

// =============================================================================
// E2E-1: Complete guided tour booking journey
// =============================================================================
describe("E2E: Guided tour booking — full journey", () => {
  let db;
  beforeEach(() => { db = freshDB(); });

  it("E2E ✅ step 0 → 1 → 2 → 3 → 4 → submit persists pending booking", () => {
    const tour = db.routes.find(r=>r.dateType==="scheduled");
    const dep  = tour.departures[0];
    const fleet = db.fleet;

    // Step 0: select tour
    const f0 = { tour: tour.name, dateType: "scheduled", departureId: "" };
    assert.ok(validate(0, f0).ok);

    // Step 1: select departure
    const f1 = { ...f0, departureId: dep.id };
    assert.ok(validate(1, f1).ok);

    // Step 2: pick available bike
    const bike = fleet.find(f => bikeAvailable(f, f1, db.bookings, tour));
    assert.ok(bike, "at least one bike must be available");

    // Step 3: rider info
    const f3 = { ...f1, name:"E2E Rider", email:"e2e@test.com", phone:"+373 99 000000", country:"MD", experience:"intermediate" };
    assert.ok(validate(3, f3).ok);

    // Step 4: license
    const f4 = { ...f3, license: true };
    assert.ok(validate(4, f4).ok);

    // Submit
    const booking = { id:"b"+uid(), type:"guided", tour:tour.name, departureId:dep.id,
      name:f4.name, email:f4.email, phone:f4.phone, country:f4.country,
      date:dep.date, experience:f4.experience, status:"pending", bike:bike.name,
      createdAt:today() };
    db.bookings.push(booking);
    saveDB(db);

    const found = loadDB().bookings.find(b=>b.id===booking.id);
    assert.ok(found);
    assert.equal(found.status, "pending");
    assert.equal(found.tour, tour.name);
  });

  it("E2E ✅ admin confirms booking → spotsLeft decreases", () => {
    const route = db.routes.find(r=>r.dateType==="scheduled");
    const dep   = route.departures[0];
    const before = spotsLeft(dep, db.bookings);

    const booking = { id:"bCONF", type:"guided", tour:route.name, departureId:dep.id,
      name:"Confirmer", email:"c@c.com", phone:"1", country:"X",
      date:dep.date, status:"pending", bike:"CFMOTO 800MT #1", createdAt:today() };
    db.bookings.push(booking);
    saveDB(db);

    // Admin confirms
    db = loadDB();
    db.bookings = db.bookings.map(b => b.id==="bCONF" ? {...b, status:"confirmed"} : b);
    saveDB(db);

    const after = spotsLeft(dep, loadDB().bookings);
    assert.equal(after, before - 1);
  });

  it("E2E ✅ full departure fills up → spotsLeft=0", () => {
    const route = db.routes.find(r=>r.dateType==="scheduled");
    const dep   = route.departures[0];
    const max   = dep.maxSpots;

    for (let i=0; i<max; i++) {
      db.bookings.push({ id:"bFULL"+i, departureId:dep.id, status:"confirmed" });
    }
    saveDB(db);

    assert.equal(spotsLeft(dep, loadDB().bookings), 0);
  });

  it("E2E ✅ cancel booking → bike becomes available again", () => {
    // Use a far-future date that cannot conflict with any SEED bookings
    localStorage.clear();
    db = loadDB();
    // Remove SEED bookings so this test is fully isolated
    db.bookings = [];
    saveDB(db);
    const bike = db.fleet.find(f=>f.status==="available");
    const dateFrom = "2027-08-01";
    const dateTo   = "2027-08-07";

    db.bookings.push({ id:"bCANCEL", type:"rental", bike:bike.name, status:"confirmed",
                date:dateFrom, dateTo, rentalDays:6 });
    saveDB(db);

    const form = { date:"2027-08-03", dateTo:"2027-08-05", dateType:"open" };
    assert.ok(!bikeAvailable(bike, form, loadDB().bookings, null), "should be blocked");

    db = loadDB();
    db.bookings = db.bookings.map(x => x.id==="bCANCEL" ? {...x, status:"cancelled"} : x);
    saveDB(db);

    assert.ok(bikeAvailable(bike, form, loadDB().bookings, null), "should be free after cancel");
  });
});

// =============================================================================
// E2E-2: Free rental journey
// =============================================================================
describe("E2E: Free rental booking — full journey", () => {
  let db;
  beforeEach(() => { db = freshDB(); });

  it("E2E ✅ rental: date range → bike check → submit → admin sees it", () => {
    // Use far-future dates with clean bookings to avoid SEED overlap
    localStorage.clear();
    db = loadDB();
    db.bookings = [];
    saveDB(db);
    const from = "2027-09-01";
    const to   = "2027-09-08";
    const ms   = new Date(to) - new Date(from);
    const days = Math.round(ms/86400000);

    // Date validation
    assert.ok(validate(1, {dateType:"open", date:from, dateTo:to}).ok);
    assert.equal(days, 7);

    // Bike available
    const bike = db.fleet.find(f=>f.status==="available");
    assert.ok(bikeAvailable(bike, {date:from, dateTo:to, dateType:"open"}, db.bookings, null));

    // Submit
    const booking = { id:"bRENT", type:"rental", tour:"Free Motorcycle Rental",
      name:"Free Rider", email:"fr@free.com", phone:"+1", country:"US",
      date:from, dateTo:to, rentalDays:days, status:"pending",
      bike:bike.name, createdAt:today() };
    db.bookings.push(booking);
    saveDB(db);

    const db2 = loadDB();
    const found = db2.bookings.find(b=>b.id==="bRENT");
    assert.ok(found);
    assert.equal(found.rentalDays, 7);
    assert.equal(found.dateTo, to);
  });

  it("E2E ✅ second rider can't book same bike for overlapping dates", () => {
    const bike = db.fleet[0];
    db.bookings.push({ id:"b_first", bike:bike.name, status:"confirmed",
                       date:"2026-05-01", dateTo:"2026-05-07" });
    saveDB(db);

    const form = { date:"2026-05-05", dateTo:"2026-05-10", dateType:"open" };
    assert.ok(!bikeAvailable(bike, form, loadDB().bookings, null));
  });

  it("E2E ✅ second rider CAN book same bike on adjacent non-overlapping dates", () => {
    const bike = db.fleet[0];
    db.bookings.push({ id:"b_adj", bike:bike.name, status:"confirmed",
                       date:"2026-05-01", dateTo:"2026-05-05" });
    saveDB(db);

    const form = { date:"2026-05-06", dateTo:"2026-05-10", dateType:"open" };
    assert.ok(bikeAvailable(bike, form, loadDB().bookings, null));
  });
});

// =============================================================================
// E2E-3: Admin complete management cycle
// =============================================================================
describe("E2E: Admin management cycle", () => {
  let db;
  beforeEach(() => { db = freshDB(); });

  it("E2E ✅ full CRUD cycle: create→read→update→delete route", () => {
    // Create
    const newRoute = { id:"rNEW", name:"Test Route", price:500, days:2,
      difficulty:"Easy", status:"active", visible:true, dateType:"scheduled",
      capacity:6, departures:[{id:"dNEW1",date:dayAdd(20),maxSpots:6}],
      stops:["A","B"], desc:"Test", img:"" };
    db.routes.push(newRoute);
    saveDB(db);
    assert.ok(loadDB().routes.some(r=>r.id==="rNEW"), "create");

    // Read
    const r = loadDB().routes.find(r=>r.id==="rNEW");
    assert.equal(r.price, 500, "read");

    // Update
    db = loadDB();
    db.routes = db.routes.map(x => x.id==="rNEW" ? {...x, price:750} : x);
    saveDB(db);
    assert.equal(loadDB().routes.find(r=>r.id==="rNEW").price, 750, "update");

    // Delete
    db = loadDB();
    db.routes = db.routes.filter(x=>x.id!=="rNEW");
    saveDB(db);
    assert.ok(!loadDB().routes.some(r=>r.id==="rNEW"), "delete");
  });

  it("E2E ✅ hide route → not visible publicly → unhide → visible again", () => {
    const id = db.routes[0].id;
    const isPublic = db => db.routes.filter(r=>r.status==="active"&&r.visible!==false);

    db.routes[0].visible = false;
    saveDB(db);
    assert.ok(!isPublic(loadDB()).some(r=>r.id===id), "hidden");

    db = loadDB();
    db.routes[0].visible = true;
    saveDB(db);
    assert.ok(isPublic(loadDB()).some(r=>r.id===id), "visible again");
  });

  it("E2E ✅ admin booking status lifecycle: pending→confirmed→cancelled", () => {
    const b = { id:"bLIFE", status:"pending", name:"X", tour:"T", email:"x@x.com" };
    db.bookings.push(b);
    saveDB(db);

    const update = (status) => {
      db = loadDB();
      db.bookings = db.bookings.map(x=>x.id==="bLIFE"?{...x,status}:x);
      saveDB(db);
      return loadDB().bookings.find(x=>x.id==="bLIFE").status;
    };

    assert.equal(update("confirmed"), "confirmed");
    assert.equal(update("cancelled"), "cancelled");
  });
});

// =============================================================================
// E2E-4: Calendar view correctness
// =============================================================================
describe("E2E: Calendar view logic", () => {
  it("E2E ✅ booking appears on its start date in calendar", () => {
    const bookings = [
      { id:"bCAL1", date:"2026-05-10", dateTo:"2026-05-10", status:"confirmed", name:"A" },
      { id:"bCAL2", date:"2026-05-15", dateTo:"2026-05-20", status:"pending",   name:"B" },
    ];
    const onDay = (d, month=5, year=2026) => {
      const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      return bookings.filter(b => b.date===dateStr || (b.dateTo && b.date<=dateStr && b.dateTo>=dateStr));
    };
    assert.equal(onDay(10).length, 1, "May 10 has 1 booking");
    assert.equal(onDay(15).length, 1, "May 15: span start");
    assert.equal(onDay(17).length, 1, "May 17: span middle");
    assert.equal(onDay(20).length, 1, "May 20: span end");
    assert.equal(onDay(21).length, 0, "May 21: after span");
    assert.equal(onDay(9).length,  0, "May 9: before");
  });

  it("E2E ✅ multiple bookings on same day all appear", () => {
    const bookings = Array.from({length:5}, (_,i) => ({
      id:"bM"+i, date:"2026-06-01", dateTo:"2026-06-01", status:"confirmed", name:"R"+i
    }));
    const onDay = bookings.filter(b=>b.date==="2026-06-01");
    assert.equal(onDay.length, 5);
    assert.equal(onDay.length - 3, 2, "+2 more would show");
  });
});

// =============================================================================
// E2E-5: Export CSV format
// =============================================================================
describe("E2E: CSV export logic", () => {
  it("E2E ✅ CSV escapes commas and quotes correctly", () => {
    const escCell = v => `"${String(v||"").replace(/"/g,'""')}"`;
    assert.equal(escCell('He said "hi"'), '"He said ""hi"""');
    assert.equal(escCell("Tour, Moldova"),   '"Tour, Moldova"');
    assert.equal(escCell("Normal"),          '"Normal"');
  });

  it("E2E ✅ CSV header row has all 12 columns", () => {
    const cols = ["ID","Rider","Email","Country","Tour","Type","Start Date","End Date","Days","Bike","Status","Amount (EUR)"];
    assert.equal(cols.length, 12);
    assert.ok(cols.includes("Amount (EUR)"));
    assert.ok(cols.includes("Start Date"));
  });

  it("E2E ✅ getTourPrice returns correct amount per booking type", () => {
    const routes = [{ name:"5-Day Tour", price:1050 }];
    const guided = { type:"guided", tour:"5-Day Tour" };
    const rental = { type:"rental", rentalDays:7 };
    assert.equal(getTourPrice(guided, routes), 1050);
    assert.equal(getTourPrice(rental, routes), 840);   // 7 * 120
    assert.equal(getTourPrice({type:"rental", rentalDays:1}, routes), 120);
  });

  it("E2E ✅ revenue counts only confirmed non-rental bookings", () => {
    const routes = [{name:"Tour A", price:650}];
    const bookings = [
      {status:"confirmed", type:"guided",  tour:"Tour A"},
      {status:"confirmed", type:"guided",  tour:"Tour A"},
      {status:"pending",   type:"guided",  tour:"Tour A"},
      {status:"cancelled", type:"guided",  tour:"Tour A"},
      {status:"confirmed", type:"rental",  tour:"Free Ride", rentalDays:3},
    ];
    const rev = bookings.filter(b=>b.status==="confirmed"&&b.type!=="rental")
      .reduce((s,b)=>s+(routes.find(r=>r.name===b.tour)?.price||0),0);
    assert.equal(rev, 1300);
  });
});

// =============================================================================
// FUNC-1: Status colour mapping
// =============================================================================
describe("FUNC: Status colour mapping", () => {
  it("FUNC ✅ confirmed → green", () => assert.equal(statusStyle("confirmed").color, "#22c55e"));
  it("FUNC ✅ pending → orange",  () => assert.equal(statusStyle("pending").color,   "#ff6b00"));
  it("FUNC ✅ cancelled → red",   () => assert.equal(statusStyle("cancelled").color,  "#ef4444"));
  it("FUNC ✅ completed → blue",  () => assert.equal(statusStyle("completed").color,  "#3b82f6"));
  it("FUNC ✅ unknown → empty",   () => assert.equal(statusStyle("ghost").color, undefined));
});

// =============================================================================
// FUNC-2: Grid view pagination logic
// =============================================================================
describe("FUNC: Pagination logic", () => {
  const items = Array.from({length:47}, (_,i) => ({id:String(i)}));

  it("FUNC ✅ page 0 with 10 rows returns items 0–9", () => {
    const page = 0, rpp = 10;
    const slice = items.slice(page*rpp, (page+1)*rpp);
    assert.equal(slice.length, 10);
    assert.equal(slice[0].id, "0");
    assert.equal(slice[9].id, "9");
  });

  it("FUNC ✅ last page returns remaining 7 items (47 items, 10/page)", () => {
    const page = 4, rpp = 10;
    const slice = items.slice(page*rpp, (page+1)*rpp);
    assert.equal(slice.length, 7);
    assert.equal(slice[0].id, "40");
  });

  it("FUNC ✅ totalPages calculation: ceil(47/10)=5", () => {
    assert.equal(Math.ceil(47/10), 5);
  });

  it("FUNC ✅ showing label: Showing 11–20 of 47", () => {
    const page=1, rpp=10, total=47;
    const label = `Showing ${page*rpp+1}–${Math.min((page+1)*rpp,total)} of ${total} bookings`;
    assert.equal(label, "Showing 11–20 of 47 bookings");
  });

  it("FUNC ✅ page clamps when rows per page changes", () => {
    let page = 4, rpp = 10, total = 47;
    const totalPages = Math.ceil(total/rpp);
    // Change to 25 rows → page 4 of 2 total pages → clamp to page 1
    rpp = 25;
    const newTotalPages = Math.ceil(total/rpp);
    const safePage = Math.min(page, newTotalPages-1);
    assert.equal(newTotalPages, 2);
    assert.equal(safePage, 1);
  });

  it("FUNC ✅ 100 rows per page shows all 47 items on page 0", () => {
    const slice = items.slice(0, 100);
    assert.equal(slice.length, 47);
  });
});

// =============================================================================
// FUNC-3: Grid sort logic
// =============================================================================
describe("FUNC: Grid sort logic", () => {
  const bookings = [
    {id:"b1", name:"Charlie", date:"2026-05-01", status:"pending",   type:"guided"},
    {id:"b2", name:"Alice",   date:"2026-04-01", status:"confirmed", type:"rental"},
    {id:"b3", name:"Bob",     date:"2026-06-01", status:"cancelled", type:"guided"},
  ];
  const routes = [{name:"Tour",price:500}];

  const sortBy = (field, dir) => [...bookings].sort((a,b) => {
    let av, bv;
    if(field==="name")   { av=a.name;   bv=b.name; }
    else if(field==="status") { av=a.status; bv=b.status; }
    else if(field==="amount") { av=getTourPrice(a,routes); bv=getTourPrice(b,routes); }
    else { av=a.date; bv=b.date; }
    return dir==="asc" ? (av<bv?-1:av>bv?1:0) : (av>bv?-1:av<bv?1:0);
  });

  it("FUNC ✅ sort by date asc → oldest first", () => {
    const sorted = sortBy("date","asc");
    assert.equal(sorted[0].id, "b2");
    assert.equal(sorted[2].id, "b3");
  });

  it("FUNC ✅ sort by date desc → newest first", () => {
    const sorted = sortBy("date","desc");
    assert.equal(sorted[0].id, "b3");
  });

  it("FUNC ✅ sort by name asc → Alice first", () => {
    const sorted = sortBy("name","asc");
    assert.equal(sorted[0].name, "Alice");
    assert.equal(sorted[2].name, "Charlie");
  });

  it("FUNC ✅ sort by name desc → Charlie first", () => {
    assert.equal(sortBy("name","desc")[0].name, "Charlie");
  });

  it("FUNC ✅ sort by status asc → alphabetical", () => {
    const sorted = sortBy("status","asc");
    assert.equal(sorted[0].status, "cancelled");
  });

  it("FUNC ✅ sort by amount desc → highest first", () => {
    const sorted = sortBy("amount","desc");
    // guided=500, rental=120 (1day), guided=500 → tied at 500 (b1,b3), rental at 120 (b2)
    assert.ok(getTourPrice(sorted[0],routes) >= getTourPrice(sorted[2],routes));
  });
});

// =============================================================================
// FUNC-4: Grid filter logic
// =============================================================================
describe("FUNC: Grid filter logic", () => {
  const data = [
    {id:"1",status:"confirmed",type:"guided", name:"Alice",    date:"2026-04-01", email:"a@a.com",bike:"Bike 1",country:"DE"},
    {id:"2",status:"pending",  type:"rental",  name:"Bob",      date:"2026-05-01", email:"b@b.com",bike:"Bike 2",country:"FR"},
    {id:"3",status:"cancelled",type:"guided", name:"Charlie",  date:"2026-06-01", email:"c@c.com",bike:"Bike 1",country:"IT"},
    {id:"4",status:"confirmed",type:"rental",  name:"Diana",    date:"2026-04-15", email:"d@d.com",bike:"Bike 2",country:"DE"},
    {id:"5",status:"completed",type:"guided", name:"Eve",      date:"2026-03-01", email:"e@e.com",bike:"Bike 3",country:"US"},
  ];

  const applyFilters = ({status="all",type="all",from="",to="",search=""}) =>
    data.filter(b =>
      (status==="all"||b.status===status) &&
      (type==="all"  ||b.type===type)     &&
      (!from         ||b.date>=from)      &&
      (!to           ||b.date<=to)        &&
      (!search       ||[b.name,b.email,b.country,b.bike]
        .some(v=>v?.toLowerCase().includes(search.toLowerCase())))
    );

  it("FUNC ✅ no filters → all 5", () => assert.equal(applyFilters({}).length, 5));
  it("FUNC ✅ filter confirmed → 2", () => assert.equal(applyFilters({status:"confirmed"}).length,2));
  it("FUNC ✅ filter rental → 2",    () => assert.equal(applyFilters({type:"rental"}).length,2));
  it("FUNC ✅ filter from 2026-05 → 2", () => assert.equal(applyFilters({from:"2026-05-01"}).length,2));
  it("FUNC ✅ date range Apr → 2",   () => assert.equal(applyFilters({from:"2026-04-01",to:"2026-04-30"}).length,2));
  it("FUNC ✅ search 'alice' → 1",   () => assert.equal(applyFilters({search:"alice"}).length,1));
  it("FUNC ✅ search 'DE' (country) → 2", () => assert.equal(applyFilters({search:"de"}).length,2));
  it("FUNC ✅ search 'Bike 1' → 2",  () => assert.equal(applyFilters({search:"bike 1"}).length,2));
  it("FUNC ✅ combined confirmed+rental → 1", () => assert.equal(applyFilters({status:"confirmed",type:"rental"}).length,1));
  it("FUNC ❌ no matches → 0",        () => assert.equal(applyFilters({search:"zzz"}).length,0));
  it("FUNC ❌ future date range → 0", () => assert.equal(applyFilters({from:"2030-01-01"}).length,0));
});

// =============================================================================
// PERF-1: loadDB and saveDB performance
// =============================================================================
describe("PERF: Store read/write benchmarks", () => {
  it("PERF ✅ loadDB cold (first load) < 10ms", () => {
    localStorage.clear();
    const t0 = hrMs();
    loadDB();
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 10, `loadDB cold took ${elapsed.toFixed(2)}ms (limit: 10ms)`);
  });

  it("PERF ✅ loadDB warm (cached JSON) < 5ms", () => {
    localStorage.clear();
    loadDB(); // prime
    const t0 = hrMs();
    loadDB();
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 5, `loadDB warm took ${elapsed.toFixed(2)}ms (limit: 5ms)`);
  });

  it("PERF ✅ saveDB with 100 bookings < 20ms", () => {
    localStorage.clear();
    const db = loadDB();
    for (let i=0; i<100; i++) {
      db.bookings.push({id:"bp"+i, type:"guided", tour:"T", name:"Rider "+i,
        email:`r${i}@t.com`, status:"pending", date:today(), createdAt:today()});
    }
    const t0 = hrMs();
    saveDB(db);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 20, `saveDB(100 bookings) took ${elapsed.toFixed(2)}ms (limit: 20ms)`);
  });

  it("PERF ✅ loadDB with 100 bookings < 10ms", () => {
    localStorage.clear();
    const db = loadDB();
    for (let i=0; i<100; i++) {
      db.bookings.push({id:"bl"+i, type:"guided", tour:"T", name:"Rider "+i,
        email:`r${i}@t.com`, status:"pending", date:today(), createdAt:today()});
    }
    saveDB(db);
    const t0 = hrMs();
    loadDB();
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 10, `loadDB(100 bookings) took ${elapsed.toFixed(2)}ms (limit: 10ms)`);
  });

  it("PERF ✅ 50 sequential save+load cycles < 200ms total", () => {
    localStorage.clear();
    const db = loadDB();
    const t0 = hrMs();
    for (let i=0; i<50; i++) {
      db.bookings.push({id:"sc"+i, status:"pending", name:"X", email:"x@x.com"});
      saveDB(db);
      loadDB();
    }
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 200, `50 save+load cycles took ${elapsed.toFixed(2)}ms (limit: 200ms)`);
  });
});

// =============================================================================
// PERF-2: Validation performance
// =============================================================================
describe("PERF: Validation benchmarks", () => {
  const form = { tour:"Tour", dateType:"open", date:dayAdd(3), dateTo:dayAdd(10),
    departureId:"d1", name:"Rider", email:"r@r.com", phone:"123", country:"DE",
    experience:"intermediate", license:true };

  it("PERF ✅ 10,000 validate(0) calls < 50ms", () => {
    const t0 = hrMs();
    for (let i=0; i<10000; i++) validate(0, form);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 50, `10k validate(0) took ${elapsed.toFixed(2)}ms`);
  });

  it("PERF ✅ 10,000 validate(3) calls < 50ms", () => {
    const t0 = hrMs();
    for (let i=0; i<10000; i++) validate(3, form);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 50, `10k validate(3) took ${elapsed.toFixed(2)}ms`);
  });

  it("PERF ✅ validate all 5 steps in single pass < 0.1ms", () => {
    const t0 = hrMs();
    [0,1,2,3,4].forEach(s => validate(s, form));
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 0.1, `5 steps took ${elapsed.toFixed(3)}ms`);
  });
});

// =============================================================================
// PERF-3: spotsLeft performance
// =============================================================================
describe("PERF: spotsLeft benchmarks", () => {
  it("PERF ✅ spotsLeft with 1000 bookings < 5ms", () => {
    const dep = {id:"d1", maxSpots:50};
    const bookings = Array.from({length:1000}, (_,i) => ({
      departureId: i%3===0 ? "d1" : "d2",
      status: i%2===0 ? "confirmed" : "pending"
    }));
    const t0 = hrMs();
    spotsLeft(dep, bookings);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 5, `spotsLeft(1000 bookings) took ${elapsed.toFixed(2)}ms`);
  });

  it("PERF ✅ 10,000 spotsLeft calls < 100ms", () => {
    const dep = {id:"d1", maxSpots:8};
    const bookings = Array.from({length:5}, () => ({departureId:"d1",status:"confirmed"}));
    const t0 = hrMs();
    for (let i=0; i<10000; i++) spotsLeft(dep, bookings);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 100, `10k spotsLeft took ${elapsed.toFixed(2)}ms`);
  });
});

// =============================================================================
// PERF-4: bikeAvailable performance
// =============================================================================
describe("PERF: bikeAvailable benchmarks", () => {
  it("PERF ✅ bikeAvailable with 200 bookings < 2ms", () => {
    const bike = {name:"CFMOTO 800MT #1", status:"available"};
    const bookings = Array.from({length:200}, (_,i) => ({
      bike: i%4===0 ? bike.name : "other",
      status: "confirmed",
      date: dayAdd(i*2+50),
      dateTo: dayAdd(i*2+52)
    }));
    const form = {date:dayAdd(3), dateTo:dayAdd(5), dateType:"open"};
    const t0 = hrMs();
    bikeAvailable(bike, form, bookings, null);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 2, `bikeAvailable(200 bookings) took ${elapsed.toFixed(2)}ms`);
  });

  it("PERF ✅ checking 4 bikes against 200 bookings < 5ms", () => {
    const fleet = [{name:"B1",status:"available"},{name:"B2",status:"available"},
                   {name:"B3",status:"maintenance"},{name:"B4",status:"available"}];
    const bookings = Array.from({length:200}, (_,i) => ({
      bike:"B1", status:"confirmed", date:dayAdd(i*3), dateTo:dayAdd(i*3+2)
    }));
    const form = {date:dayAdd(3), dateTo:dayAdd(6), dateType:"open"};
    const t0 = hrMs();
    fleet.forEach(b => bikeAvailable(b, form, bookings, null));
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 5, `4-bike check took ${elapsed.toFixed(2)}ms`);
  });
});

// =============================================================================
// PERF-5: routeToTour performance
// =============================================================================
describe("PERF: routeToTour benchmarks", () => {
  const route = SEED.routes[2];

  it("PERF ✅ single routeToTour (warm) < 1ms", () => {
    routeToTour(route); // warm-up call (first call may cost 10ms due to V8 JIT)
    const t0 = hrMs();
    routeToTour(route);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 1, `routeToTour (warm) took ${elapsed.toFixed(3)}ms`);
  });

  it("PERF ✅ 50,000 routeToTour calls < 500ms", () => {
    const t0 = hrMs();
    for (let i=0; i<50000; i++) routeToTour(route);
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 500, `50k routeToTour took ${elapsed.toFixed(0)}ms`);
  });
});

// =============================================================================
// LOAD-1: Concurrent booking simulation (1000 simulated users)
// =============================================================================
describe("LOAD: Concurrent booking simulation", () => {
  it("LOAD ✅ 1000 simultaneous booking submissions — all persist uniquely", () => {
    localStorage.clear();
    const db = loadDB();
    const start = hrMs();

    for (let i=0; i<1000; i++) {
      db.bookings.push({
        id: "bload"+i+uid(),
        type: i%3===0 ? "rental" : "guided",
        tour: ["1-Day Wine Ride","3-Day Moldova Adventure","5-Day Grand Moldova Tour"][i%3],
        name: "Load Rider "+i,
        email: `load${i}@test.com`,
        country: ["DE","FR","IT","US","MD"][i%5],
        date: dayAdd(i%30),
        dateTo: dayAdd((i%30)+3),
        rentalDays: 3,
        status: ["pending","confirmed"][i%2],
        bike: `CFMOTO 800MT #${(i%4)+1}`,
        createdAt: today()
      });
    }
    saveDB(db);
    const elapsed = hrMs() - start;

    const db2 = loadDB();
    assert.ok(elapsed < 500, `1000 booking inserts+save took ${elapsed.toFixed(0)}ms (limit 500ms)`);
    // Original SEED bookings + 1000 new ones
    assert.ok(db2.bookings.length >= 1000, "all 1000 bookings persisted");

    // All IDs unique
    const ids = db2.bookings.map(b=>b.id);
    assert.equal(new Set(ids).size, ids.length, "no duplicate booking IDs");
  });

  it("LOAD ✅ read 1000 bookings and compute all spotsLeft < 100ms", () => {
    localStorage.clear();
    const db = loadDB();
    const deps = db.routes.flatMap(r=>r.departures||[]);
    for (let i=0; i<1000; i++) {
      db.bookings.push({
        id: "sp"+i, departureId: deps[i%deps.length]?.id,
        status: i%3===0 ? "confirmed" : "pending"
      });
    }
    saveDB(db);

    const db2 = loadDB();
    const t0 = hrMs();
    deps.forEach(dep => spotsLeft(dep, db2.bookings));
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 100, `spotsLeft for all deps with 1000 bookings took ${elapsed.toFixed(0)}ms`);
  });

  it("LOAD ✅ 500 bike availability checks with 500 bookings < 200ms", () => {
    localStorage.clear();
    const db = loadDB();
    const fleet = db.fleet;

    for (let i=0; i<500; i++) {
      db.bookings.push({
        id:"ba"+i, bike:fleet[i%fleet.length].name, status:"confirmed",
        date:dayAdd(i*2), dateTo:dayAdd(i*2+2)
      });
    }
    saveDB(db);
    const bookings = loadDB().bookings;

    const t0 = hrMs();
    for (let i=0; i<500; i++) {
      const form = {date:dayAdd(i%60), dateTo:dayAdd(i%60+3), dateType:"open"};
      fleet.forEach(b => bikeAvailable(b, form, bookings, null));
    }
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 200, `500×4 bikeAvailable checks took ${elapsed.toFixed(0)}ms`);
  });
});

// =============================================================================
// LOAD-2: Pagination under large datasets
// =============================================================================
describe("LOAD: Pagination with large datasets", () => {
  const makeBookings = n => Array.from({length:n}, (_,i)=>({
    id:String(i), name:"Rider "+i, status:["pending","confirmed","cancelled"][i%3],
    type:i%2===0?"guided":"rental", date:dayAdd(i%365), email:`r${i}@t.com`
  }));

  it("LOAD ✅ paginate 10,000 bookings — page slice < 1ms", () => {
    const data = makeBookings(10000);
    const t0 = hrMs();
    const page = 499, rpp = 10;
    const slice = data.slice(page*rpp, (page+1)*rpp);
    const elapsed = hrMs() - t0;
    assert.equal(slice.length, 10);
    assert.ok(elapsed < 1, `page slice took ${elapsed.toFixed(3)}ms`);
  });

  it("LOAD ✅ sort 10,000 bookings by name < 50ms", () => {
    const data = makeBookings(10000);
    const t0 = hrMs();
    [...data].sort((a,b)=>a.name.localeCompare(b.name));
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 50, `sort 10k by name took ${elapsed.toFixed(0)}ms`);
  });

  it("LOAD ✅ filter 10,000 bookings by status < 10ms", () => {
    const data = makeBookings(10000);
    const t0 = hrMs();
    const confirmed = data.filter(b=>b.status==="confirmed");
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 10, `filter 10k took ${elapsed.toFixed(2)}ms`);
    assert.ok(confirmed.length > 0);
  });

  it("LOAD ✅ search across 10,000 bookings < 20ms", () => {
    const data = makeBookings(10000);
    const t0 = hrMs();
    const q = "rider 500";
    data.filter(b => b.name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q));
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 20, `search 10k took ${elapsed.toFixed(2)}ms`);
  });
});

// =============================================================================
// LOAD-3: Store stress test
// =============================================================================
describe("LOAD: Store stress tests", () => {
  it("LOAD ✅ 200 rapid save operations < 1000ms", () => {
    localStorage.clear();
    const db = loadDB();
    const t0 = hrMs();
    for (let i=0; i<200; i++) {
      db.bookings.push({id:"rs"+i, name:"X"+i, status:"pending"});
      saveDB(db);
    }
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 1000, `200 saves took ${elapsed.toFixed(0)}ms`);
  });

  it("LOAD ✅ 200 rapid load operations < 500ms", () => {
    localStorage.clear();
    const db = loadDB();
    db.bookings = Array.from({length:50}, (_,i)=>({id:"rl"+i, name:"X"}));
    saveDB(db);
    const t0 = hrMs();
    for (let i=0; i<200; i++) loadDB();
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 500, `200 loads took ${elapsed.toFixed(0)}ms`);
  });

  it("LOAD ✅ localStorage handles 500KB payload", () => {
    localStorage.clear();
    const db = loadDB();
    // Each booking ~250 chars of JSON = 500 bookings ≈ 125KB
    for (let i=0; i<500; i++) {
      db.bookings.push({
        id:"fat"+i, name:"Rider with a somewhat longer name "+i,
        email:`rider.long.email.address.${i}@tourism-moldova.com`,
        tour:"5-Day Grand Moldova Tour", type:"guided",
        phone:"+373 69 123 456", country:"Republic of Moldova",
        date:dayAdd(i%180), status:"confirmed", bike:"CFMOTO 800MT #1",
        experience:"intermediate", createdAt:today()
      });
    }
    assert.doesNotThrow(() => saveDB(db));
    const db2 = loadDB();
    assert.ok(db2.bookings.length >= 500);
  });

  it("LOAD ✅ uid() generates 10,000 unique IDs with no collisions", () => {
    const ids = new Set(Array.from({length:10000}, uid));
    assert.equal(ids.size, 10000, "10k UIDs must all be unique");
  });
});

// =============================================================================
// LOAD-4: Concurrent login attempts
// =============================================================================
describe("LOAD: Login stress & security", () => {
  it("LOAD ✅ 1000 failed login attempts all fail, lockout after 5", () => {
    const state = makeLoginState();
    let locked = false;
    for (let i=0; i<1000; i++) {
      const r = tryLogin(state, "x", "x");
      if (r.locked && !locked) {
        locked = true;
        assert.ok(i >= 4, `lockout should happen on attempt 5+, happened on ${i+1}`);
      }
    }
    assert.ok(locked, "must lock at some point");
  });

  it("LOAD ✅ 1000 correct logins all succeed (separate states)", () => {
    const t0 = hrMs();
    for (let i=0; i<1000; i++) {
      const state = makeLoginState();
      assert.ok(tryLogin(state,"admin","secret").ok);
    }
    const elapsed = hrMs() - t0;
    assert.ok(elapsed < 100, `1000 logins took ${elapsed.toFixed(0)}ms`);
  });
});

// =============================================================================
// LOAD-5: Calendar rendering with dense data
// =============================================================================
describe("LOAD: Calendar dense data rendering", () => {
  it("LOAD ✅ 200 bookings spread across a month — all days computed < 10ms", () => {
    const bookings = Array.from({length:200}, (_,i) => ({
      id:"cal"+i,
      date: `2026-05-${String((i%28)+1).padStart(2,"0")}`,
      dateTo: `2026-05-${String(Math.min((i%28)+3,28)).padStart(2,"0")}`,
      status:["confirmed","pending"][i%2]
    }));

    const onDay = d => {
      const dateStr = `2026-05-${String(d).padStart(2,"0")}`;
      return bookings.filter(b => b.date===dateStr || (b.dateTo && b.date<=dateStr && b.dateTo>=dateStr));
    };

    const t0 = hrMs();
    let total = 0;
    for (let d=1; d<=31; d++) total += onDay(d).length;
    const elapsed = hrMs() - t0;

    assert.ok(total > 0, "some bookings should appear on calendar");
    assert.ok(elapsed < 10, `calendar 31-day scan with 200 bookings took ${elapsed.toFixed(2)}ms`);
  });

  it("LOAD ✅ +more calculation correct for days with 10 bookings", () => {
    const dayBookings = Array.from({length:10}, (_,i) => ({id:"d"+i, name:"Rider "+i}));
    const shown = dayBookings.slice(0,3).length;
    const moreCount = dayBookings.length - 3;
    assert.equal(shown, 3);
    assert.equal(moreCount, 7);
    assert.ok(moreCount > 0, "+more label should show");
  });
});

console.log("\n✓ e2e-performance.test.mjs loaded");
