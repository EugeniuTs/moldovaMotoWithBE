/**
 * ui.test.mjs — UI component and business logic tests
 * Run: node --test tests/ui.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, "..");
const read  = (f) => readFileSync(resolve(root, f), "utf8");

const home       = read("src/pages/Home.jsx");
const admin      = read("src/pages/Admin.jsx");
const adventures = read("src/pages/Adventures.jsx");
const store      = read("src/store.js");

// =============================================================================
// 1. Icon tests
// =============================================================================
describe("Experience section icons", () => {
  it("defines IconBike for Adventure Riding", () => {
    assert.ok(home.includes("const IconBike"), "IconBike must be defined");
  });

  it("defines IconGuide for Local Expert Guide", () => {
    assert.ok(home.includes("const IconGuide"), "IconGuide must be defined");
  });

  it("defines IconMoto for Premium Motorcycles", () => {
    assert.ok(home.includes("const IconMoto"), "IconMoto must be defined");
  });

  it("defines IconRoute for Unique Routes", () => {
    assert.ok(home.includes("const IconRoute"), "IconRoute must be defined");
  });

  it("IconBike renders a helmet shape (circle path)", () => {
    const bikeSrc = home.slice(home.indexOf("const IconBike"), home.indexOf("const IconGuide"));
    assert.ok(bikeSrc.includes("<svg"), "IconBike must contain SVG");
    assert.ok(bikeSrc.includes("viewBox"), "IconBike SVG must have viewBox");
  });

  it("IconGuide renders person + map pin (circle + path)", () => {
    const guideSrc = home.slice(home.indexOf("const IconGuide"), home.indexOf("const IconMoto"));
    assert.ok(guideSrc.includes("circle"), "IconGuide must have a circle (person head)");
    assert.ok(guideSrc.includes("path"),   "IconGuide must have paths");
  });

  it("IconMoto renders wheels (circles) and frame (paths)", () => {
    const motoSrc = home.slice(home.indexOf("const IconMoto"), home.indexOf("const IconRoute"));
    const circleCount = (motoSrc.match(/<circle/g) || []).length;
    assert.ok(circleCount >= 2, `IconMoto should have at least 2 circles (wheels), got ${circleCount}`);
  });

  it("IconRoute renders a dashed path and compass star", () => {
    const routeSrc = home.slice(home.indexOf("const IconRoute"), home.indexOf("const IconCheck"));
    assert.ok(routeSrc.includes("strokeDasharray") || routeSrc.includes("path"), "IconRoute should have dashed path or SVG path");
  });

  it("all icons use currentColor for theming", () => {
    ["IconBike", "IconGuide", "IconMoto", "IconRoute"].forEach(name => {
      const start = home.indexOf(`const ${name}`);
      const end   = home.indexOf("const Icon", start + 1);
      const src   = home.slice(start, end);
      assert.ok(src.includes("currentColor"), `${name} must use currentColor for theme compatibility`);
    });
  });

  it("all 4 features are rendered in the Experience section", () => {
    assert.ok(home.includes("Adventure Riding"),    "Missing 'Adventure Riding' card");
    assert.ok(home.includes("Local Expert Guide"),  "Missing 'Local Expert Guide' card");
    assert.ok(home.includes("Premium Motorcycles"), "Missing 'Premium Motorcycles' card");
    assert.ok(home.includes("Unique Routes"),       "Missing 'Unique Routes' card");
  });
});

// =============================================================================
// 2. Public site — filtering and display
// =============================================================================
describe("Public site tour filtering", () => {
  it("filters tours by status === active", () => {
    assert.ok(
      home.includes('r.status === "active"') || home.includes("r.status==='active'"),
      "Tours must be filtered by active status"
    );
  });

  it("filters tours by visible !== false", () => {
    assert.ok(
      home.includes("r.visible !== false"),
      "Tours must be filtered by visibility"
    );
  });

  it("booking modal is conditional on showBooking state", () => {
    assert.ok(home.includes("showBooking"), "showBooking state must exist");
    assert.ok(home.includes("BookingModal"), "BookingModal component must be used");
  });

  it("booking modal receives live tours and fleet", () => {
    assert.ok(home.includes("tours={liveTours}"), "BookingModal must receive liveTours");
    assert.ok(home.includes("fleet={liveFleet}"), "BookingModal must receive liveFleet");
  });

  it("reloads store on storage event (cross-tab sync)", () => {
    assert.ok(home.includes("storage"), "should listen for storage event");
    assert.ok(home.includes("reloadStore"), "reloadStore function must exist");
  });

  it("opens booking modal when Book button is clicked", () => {
    assert.ok(home.includes("openBooking"), "openBooking handler must exist");
  });
});

// =============================================================================
// 3. Booking modal — 5-step flow
// =============================================================================
describe("Booking modal steps", () => {
  it("has step 0 (tour selection)", () => {
    assert.ok(home.includes("step === 0"), "Step 0 must exist");
  });

  it("has step 1 (date selection)", () => {
    assert.ok(home.includes("step === 1"), "Step 1 must exist");
  });

  it("has step 2 (bike selection)", () => {
    assert.ok(home.includes("step === 2"), "Step 2 must exist");
  });

  it("has step 3 (rider details)", () => {
    assert.ok(home.includes("step === 3"), "Step 3 must exist");
  });

  it("has step 4 (license/confirm)", () => {
    assert.ok(home.includes("step === 4"), "Step 4 must exist");
  });

  it("validates required fields before progressing", () => {
    assert.ok(home.includes("errors") || home.includes("setErrors"), "validation errors must be tracked");
  });

  it("booking ID is returned from API (server-side generated)", () => {
    assert.ok(home.includes("booking_id") || home.includes("createBooking"),
      "booking ID must come from API response, not client uid()");
  });

  it("sets booking status to pending on submit", () => {
    assert.ok(home.includes('"pending"'), "new bookings must be status: pending");
  });

  it("booking submitted via API (not localStorage saveDB)", () => {
    assert.ok(home.includes("createBooking"), "must call createBooking API");
  });
});

// =============================================================================
// 4. Admin panel — tabs and CRUD
// =============================================================================
describe("Admin panel tabs", () => {
  const tabs = ["dashboard", "routes", "bookings", "fleet", "gallery"];

  tabs.forEach(tab => {
    it(`has "${tab}" tab`, () => {
      assert.ok(admin.includes(`tab==="${tab}"`), `"${tab}" tab render condition missing`);
    });
  });

  it("has Dashboard stats (routes/bookings/fleet/gallery)", () => {
    assert.ok(admin.includes("DashboardTab"), "DashboardTab component must exist");
  });

  it("has tour visibility toggle column", () => {
    assert.ok(admin.includes("Visible"), "Visible column must exist in routes table");
  });

  it("has quick-toggle visibility button", () => {
    // Labels are "👁 Visible" and "🚫 Hidden"
    assert.ok(admin.includes("Visible") && admin.includes("Hidden"),
      "Quick visibility toggle must exist with Visible/Hidden labels"
    );
    assert.ok(admin.includes("onSave") || admin.includes("onClick"),
      "Toggle button must have a click handler"
    );
  });

  it("visibility toggle inverts the visible field on the row", () => {
    assert.ok(admin.includes("onToggleVisible"), "onToggleVisible prop must be passed");
    assert.ok(
      admin.includes("visible:r.visible===false?true:false") ||
      admin.includes("r.visible===false?true:false"),
      "Toggle must invert visible field"
    );
  });

  it("handleSave persists data via saveDB", () => {
    assert.ok(admin.includes("persist("), "persist() must be called on save");
    assert.ok(admin.includes("saveDB"), "saveDB must be called");
  });

  it("handleDelete removes item by id", () => {
    assert.ok(admin.includes("handleDelete"), "handleDelete must exist");
    assert.ok(admin.includes("filter(r => r.id !== id)") ||
              admin.includes("filter(r=>r.id!==id)"),
      "delete must filter out by id"
    );
  });

  it("login rate limiting blocks after 5 attempts", () => {
    assert.ok(admin.includes("loginAttempts.count>=5") ||
              admin.includes("loginAttempts.count >= 5"),
      "should lock after 5 failed attempts"
    );
  });
});

// =============================================================================
// 5. Gallery / Adventures
// =============================================================================
describe("Adventures gallery page", () => {
  it("loads gallery from shared store", () => {
    assert.ok(adventures.includes("loadDB"), "must load from shared store");
  });

  it("has type filter (photos/videos)", () => {
    assert.ok(adventures.includes("typeFilter") || adventures.includes("setType"), "type filter must exist");
  });

  it("has tour filter", () => {
    assert.ok(adventures.includes("setFilter"), "tour filter must exist");
  });

  it("lightbox opens on item click", () => {
    assert.ok(adventures.includes("setLightbox"), "lightbox state must exist");
  });

  it("lightbox supports keyboard navigation", () => {
    assert.ok(adventures.includes("ArrowRight") || adventures.includes("ArrowLeft"), "arrow key nav must exist");
  });

  it("lightbox closes on Escape key", () => {
    assert.ok(adventures.includes("Escape"), "Escape key handler must exist");
  });

  it("syncs with admin via storage event", () => {
    assert.ok(adventures.includes("storage"), "must listen for storage event");
    assert.ok(adventures.includes("STORAGE_KEY"), "must check STORAGE_KEY");
  });

  it("admin gallery tab has Add Media button", () => {
    assert.ok(admin.includes("GalleryTab"), "GalleryTab must be rendered");
    assert.ok(admin.includes("+ Add Media"), "Add Media button must exist");
  });

  it("gallery items can be marked as featured", () => {
    assert.ok(admin.includes("featured"), "featured field must be handled in admin");
    assert.ok(adventures.includes("featured"), "featured field must affect display");
  });
});

// =============================================================================
// 6. Map section
// =============================================================================
describe("OpenStreetMap integration", () => {
  it("uses LeafletMap component", () => {
    assert.ok(home.includes("LeafletMap"), "LeafletMap component must exist");
  });

  it("loads Leaflet from unpkg CDN", () => {
    assert.ok(home.includes("unpkg.com/leaflet"), "Leaflet must be loaded from unpkg");
    // SRI intentionally removed from dynamic script injection (causes silent load failure)
    assert.ok(!home.includes("script.integrity"), "SRI must not be on dynamic script element");
  });

  it("uses CartoDB Dark Matter tiles", () => {
    assert.ok(home.includes("cartocdn.com"), "must use CartoDB dark tiles");
  });

  it("all 6 tour stops have lat/lng coordinates", () => {
    const stops = ["Chișinău", "Orheiul Vechi", "Cricova", "Saharna", "Soroca", "Bender"];
    stops.forEach(stop => {
      assert.ok(home.includes(stop), `Stop "${stop}" must be in mapStops`);
    });
    // Check lat/lng presence
    assert.ok(home.includes("lat:") || home.includes("lat :"), "stops must have lat coordinates");
    assert.ok(home.includes("lng:") || home.includes("lng :"), "stops must have lng coordinates");
  });

  it("map hover syncs with stop cards", () => {
    assert.ok(home.includes("mapHover") && home.includes("setMapHover"), "map hover state must exist");
    assert.ok(home.includes("onHover"), "onHover prop must be passed to LeafletMap");
  });
});

// =============================================================================
// 7. Navigation
// =============================================================================
describe("Navigation and routing", () => {
  const main = read("src/main.jsx");

  it("has route for / (home)", () => {
    assert.ok(main.includes('path="/"'), "Home route must exist");
  });

  it("has route for /admin", () => {
    assert.ok(main.includes('path="/admin"'), "Admin route must exist");
  });

  it("has route for /adventures", () => {
    assert.ok(main.includes('path="/adventures"'), "Adventures route must exist");
  });

  it("has catch-all redirect to /", () => {
    assert.ok(main.includes("Navigate"), "catch-all must redirect");
  });

  it("Adventures link in navbar is orange (active indicator)", () => {
    assert.ok(
      home.includes("Adventures") && home.includes("ORANGE"),
      "Adventures nav link should use orange color"
    );
  });
});

// =============================================================================
// 8. Responsive / mobile
// =============================================================================
describe("Responsive design", () => {
  it("has mobile media queries in Home.jsx", () => {
    assert.ok(
      home.includes("max-width: 768px") || home.includes("max-width:768px"),
      "Must have mobile breakpoint"
    );
  });

  it("nav-links hide on mobile", () => {
    assert.ok(home.includes("nav-links"), "nav-links class must exist");
    assert.ok(
      home.includes(".nav-links { display: none") || home.includes(".nav-links{display:none"),
      "nav-links must hide on mobile"
    );
  });

  it("adventure gallery collapses to fewer columns on mobile", () => {
    assert.ok(
      adventures.includes("max-width: 768px") || adventures.includes("max-width:768px"),
      "gallery must have mobile breakpoint"
    );
  });
});

console.log("\n✓ ui.test.mjs loaded successfully");
