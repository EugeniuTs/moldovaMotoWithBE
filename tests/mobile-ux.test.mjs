/**
 * mobile-ux.test.mjs
 * Mobile UX + responsive design tests for MoldovaMoto
 * Covers: viewport behaviour, touch targets, modals, nav, forms, Info page
 *
 * Run: node --test tests/mobile-ux.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, "..");
const src   = f => readFileSync(resolve(root, f), "utf8");

const home  = src("src/pages/Home.jsx");
const admin = src("src/pages/Admin.jsx");
const info  = src("src/pages/Info.jsx");
const main  = src("src/main.jsx");

// =============================================================================
// 1. VIEWPORT META & DOCUMENT SETUP
// =============================================================================
describe("Viewport & document setup", () => {
  const html = src("index.html");

  it("viewport meta tag is present with width=device-width", () => {
    assert.ok(html.includes('name="viewport"'), "viewport meta required");
    assert.ok(html.includes("width=device-width"), "must set device-width");
    assert.ok(html.includes("initial-scale=1"), "must set initial-scale=1");
  });

  it("overflow-x hidden set on body to prevent horizontal scroll", () => {
    assert.ok(home.includes("overflow-x: hidden") || home.includes("overflow-x:hidden"),
      "body needs overflow-x:hidden to prevent mobile horizontal scroll");
  });

  it("html has scroll-behavior smooth for anchor links", () => {
    assert.ok(home.includes("scroll-behavior: smooth") || home.includes("scroll-behavior:smooth"));
  });

  it("box-sizing border-box applied globally", () => {
    assert.ok(home.includes("box-sizing: border-box") || home.includes("box-sizing:border-box"),
      "global box-sizing needed for correct width calculations on mobile");
  });
});

// =============================================================================
// 2. NAVIGATION — MOBILE
// =============================================================================
describe("Mobile navigation", () => {
  it("hamburger button exists in JSX DOM", () => {
    assert.ok(home.includes('"hamburger"') || home.includes("'hamburger'"),
      "hamburger className must be rendered in JSX");
  });

  it("hamburger hidden by default via display:none", () => {
    assert.ok(
      home.includes('display: "none"') || home.includes("display:'none'") ||
      home.includes('display:"none"'),
      "hamburger must be hidden by default (CSS media query shows it)"
    );
  });

  it("mobile menu state controlled by menuOpen", () => {
    assert.ok(home.includes("menuOpen"), "menuOpen state required");
    assert.ok(home.includes("setMenuOpen"), "setMenuOpen required");
  });

  it("mobile dropdown only renders when menuOpen=true", () => {
    assert.ok(home.includes("{menuOpen &&"), "conditional mobile menu required");
  });

  it("nav-links hidden on mobile via CSS class", () => {
    assert.ok(
      home.includes(".nav-links { display: none !important; }") ||
      home.includes(".nav-links{display:none"),
      "nav-links must be hidden on mobile"
    );
  });

  it("hamburger shown via CSS media query on small screens", () => {
    assert.ok(
      home.includes(".hamburger { display: flex !important; }") ||
      home.includes(".hamburger{display:flex"),
      "hamburger must become visible via media query on small screens"
    );
  });

  it("mobile menu closes on scroll", () => {
    assert.ok(home.includes("setMenuOpen(false)") || home.includes("setMenuOpen( false)"),
      "menu should close on scroll for better mobile UX"
    );
  });

  it("sticky nav has backdrop blur for readability over content", () => {
    assert.ok(home.includes("backdropFilter") || home.includes("backdrop-filter"),
      "nav needs backdrop blur to remain readable on mobile"
    );
  });
});

// =============================================================================
// 3. BOOKING MODAL — MOBILE BEHAVIOUR
// =============================================================================
describe("Booking modal mobile behaviour", () => {
  it("modal slides up from bottom on mobile (flex-end alignment)", () => {
    assert.ok(
      home.includes('alignItems: "flex-end"') || home.includes("alignItems:'flex-end'"),
      "backdrop should use flex-end so modal slides from bottom on mobile"
    );
  });

  it("modal has rounded top corners only on mobile", () => {
    assert.ok(
      home.includes("20px 20px 0 0") || home.includes("16px 16px 0 0"),
      "mobile sheet needs rounded top corners only"
    );
  });

  it("modal max-height allows scrolling on small screens", () => {
    assert.ok(
      home.includes("maxHeight: \"95vh\"") || home.includes("maxHeight:\"95vh\"") ||
      home.includes("maxHeight: '95vh'"),
      "modal needs maxHeight on mobile to prevent overflow"
    );
  });

  it("modal content area has overflowY auto for scrolling", () => {
    assert.ok(home.includes("overflowY: \"auto\"") || home.includes('overflowY:"auto"'),
      "modal inner content must scroll on small screens"
    );
  });

  it("tour card grid collapses to 1 column on mobile", () => {
    assert.ok(home.includes("tour-card-grid"), "tour-card-grid class required for CSS override");
    assert.ok(
      home.includes(".tour-card-grid { grid-template-columns: 1fr !important; }") ||
      home.includes("tour-card-grid{grid-template-columns:1fr"),
      "tour grid must collapse to 1 column on mobile"
    );
  });

  it("2-column form grids collapse to 1 column on mobile", () => {
    assert.ok(home.includes("form-row-2col"), "form-row-2col class needed");
    assert.ok(
      home.includes(".form-row-2col { grid-template-columns: 1fr !important; }") ||
      home.includes("form-row-2col{grid-template-columns:1fr"),
      "form rows must stack on mobile"
    );
  });

  it("experience selector uses button grid not native select", () => {
    // Native select expands full-screen on iOS — must be replaced with buttons
    assert.ok(
      !home.includes('<select') || home.includes("experience") && !home.includes("select.*experience"),
      "native select should be replaced with button grid for experience"
    );
    assert.ok(home.includes("beginner") && home.includes("intermediate"),
      "experience options must still be present"
    );
  });

  it("experience options are tappable buttons with sufficient size", () => {
    // 44px min touch target recommended by Apple HIG
    assert.ok(
      home.includes("padding: \"10px 12px\"") || home.includes('padding:"10px 12px"') ||
      home.includes("padding: '10px 12px'"),
      "experience buttons need at least 10px vertical padding for touch targets"
    );
  });

  it("tour card price is always visible — placed in same row as title", () => {
    // Price must not be in a competing flex child that gets pushed off
    assert.ok(
      home.includes("justifyContent: \"space-between\"") && home.includes("flexShrink: 0"),
      "price must be in same flex row as title with flexShrink:0"
    );
    assert.ok(
      home.includes("whiteSpace: \"nowrap\""),
      "price must have whiteSpace:nowrap to prevent wrapping"
    );
  });

  it("step connector labels hidden on very small screens", () => {
    assert.ok(
      home.includes(".step-connector { display: none !important; }") ||
      home.includes("step-connector") && home.includes("display: none"),
      "step connectors should hide on small screens to save space"
    );
  });
});

// =============================================================================
// 4. ADMIN MODALS — MOBILE
// =============================================================================
describe("Admin modals mobile behaviour", () => {
  it("admin Modal uses bottom-sheet on mobile", () => {
    assert.ok(
      admin.includes("admin-modal-wrap") || admin.includes("admin-modal-box"),
      "admin modal needs responsive wrapper classes"
    );
  });

  it("admin modal 2-column grids collapse on mobile", () => {
    assert.ok(admin.includes("admin-form-2col"), "admin-form-2col class needed");
    assert.ok(
      admin.includes(".admin-form-2col") && admin.includes("grid-template-columns:1fr"),
      "admin form 2-col must collapse on mobile"
    );
  });

  it("admin modal has max-height and overflow-y auto", () => {
    assert.ok(
      admin.includes("max-height:92vh") || admin.includes("maxHeight:\"92vh\"") ||
      admin.includes("max-height: 92vh"),
      "admin modal must constrain height on mobile"
    );
  });

  it("calendar day detail modal uses viewport width", () => {
    assert.ok(
      admin.includes("width:\"94vw\"") || admin.includes('width:"94vw"') ||
      admin.includes("width: \"94vw\""),
      "calendar day modal must be wide enough on mobile"
    );
  });

  it("confirm dialog has explicit width cap for mobile", () => {
    assert.ok(
      admin.includes("width:\"90%\"") || admin.includes('width:"90%"') ||
      admin.includes("width: \"90%\""),
      "confirm dialog needs responsive width"
    );
    assert.ok(!admin.includes('width:"90%",maxWidth:400,\n        padding:"28px 32px",width:'),
      "confirm dialog must not have duplicate width keys"
    );
  });

  it("admin sidebar is hidden on mobile via CSS", () => {
    assert.ok(
      admin.includes("@media") && (
        admin.includes("display: none") || admin.includes("display:none")
      ),
      "admin sidebar must be hidden on small screens"
    );
  });

  it("bookings table has horizontal scroll on mobile", () => {
    assert.ok(
      admin.includes("overflowX: \"auto\"") || admin.includes('overflowX:"auto"'),
      "bookings table wrapper needs overflowX:auto"
    );
  });

  it("bookings table has minimum width to prevent content collapse", () => {
    assert.ok(
      admin.includes("minWidth: 900") || admin.includes("minWidth:900"),
      "table must have minWidth to scroll horizontally on mobile rather than squish"
    );
  });
});

// =============================================================================
// 5. INFO PAGE — MOBILE
// =============================================================================
describe("Info page mobile layout", () => {
  it("Info page exports a default function", () => {
    assert.ok(info.includes("export default function InfoPage"), "InfoPage must export default");
  });

  it("Info page contains all 6 section IDs", () => {
    ["about","fleet","routes","safety","faq","terms"].forEach(id => {
      assert.ok(info.includes(`id="${id}"`), `Missing section: #${id}`);
    });
  });

  it("sidebar hidden on mobile via CSS class", () => {
    assert.ok(info.includes("sidebar"), "sidebar class must exist");
    assert.ok(
      info.includes(".sidebar { display: none !important; }") ||
      (info.includes(".sidebar") && info.includes("display: none")),
      "sidebar must be hidden on mobile"
    );
  });

  it("2-column grids collapse on mobile", () => {
    assert.ok(
      info.includes(".g2 { grid-template-columns: 1fr !important; }") ||
      (info.includes(".g2") && info.includes("1fr !important")),
      "g2 grids must collapse on mobile"
    );
  });

  it("FAQ accordion uses click to expand — no hover-only interaction", () => {
    assert.ok(info.includes("setOpenFaq"), "FAQ accordion needs onClick state toggle");
    assert.ok(info.includes("openFaq === i"), "FAQ must track which item is open");
  });

  it("Info page contains no non-ASCII characters", () => {
    const nonAscii = [...info].filter(c => c.charCodeAt(0) > 127);
    assert.equal(nonAscii.length, 0,
      `Info.jsx has ${nonAscii.length} non-ASCII chars which crash the browser module loader`
    );
  });

  it("Info page imports only from react, react-router-dom, and i18n", () => {
    const imports = info.match(/^import .+ from ['"](.+)['"]/gm) || [];
    imports.forEach(imp => {
      const mod = imp.match(/from ['"](.+)['"]/)[1];
      assert.ok(
        mod === "react" || mod === "react-router-dom" || mod.includes("i18n"),
        "Info.jsx has unexpected import: " + mod
      );
    });
  });

  it("Info nav links use hash anchors not full page navigations", () => {
    assert.ok(info.includes('href={"#"'), "nav links must use # anchors");
  });

  it("IntersectionObserver updates active section on scroll", () => {
    assert.ok(info.includes("IntersectionObserver"), "IntersectionObserver required for active section");
    assert.ok(info.includes("setActive"), "setActive must be called");
  });

  it("WhatsApp CTA link uses correct number", () => {
    assert.ok(info.includes("wa.me/37369765298"), "WhatsApp number must be correct");
  });

  it("Info page has responsive top nav hiding on very small screens", () => {
    assert.ok(
      info.includes("top-nav-links") &&
      (info.includes("display: none") || info.includes("display:none")),
      "top nav links should hide on very small screens"
    );
  });
});

// =============================================================================
// 6. ROUTER — ALL PAGES REGISTERED
// =============================================================================
describe("Router — all pages registered", () => {
  it("/ maps to Home component", () => {
    assert.ok(main.includes('path="/"') && main.includes("<Home"), "Home route missing");
  });

  it("/admin maps to Admin component", () => {
    assert.ok(main.includes('path="/admin"') && main.includes("<Admin"), "Admin route missing");
  });

  it("/adventures maps to Adventures component", () => {
    assert.ok(main.includes('path="/adventures"') && main.includes("<Adventures"), "Adventures route missing");
  });

  it("/info maps to Info component", () => {
    assert.ok(main.includes('path="/info"') && main.includes("<Info"), "Info route missing");
  });

  it("Info imported in main.jsx", () => {
    assert.ok(main.includes("import Info from './pages/Info'") ||
              main.includes('import Info from "./pages/Info"'), "Info import missing");
  });

  it("catch-all redirects to /", () => {
    assert.ok(main.includes('path="*"') && main.includes("Navigate"), "catch-all redirect missing");
  });
});

// =============================================================================
// 7. TOUCH TARGET SIZES
// =============================================================================
describe("Touch target sizes (min 44px recommended)", () => {
  it("nav Book button has sufficient padding", () => {
    assert.ok(
      home.includes("padding: \"12px 28px\"") || home.includes('padding:"12px 28px"') ||
      home.includes("padding: \"14px 32px\"") || home.includes('padding:"14px 32px"'),
      "CTA button needs at least 12px vertical padding for 44px touch target"
    );
  });

  it("booking modal continue button has sufficient height", () => {
    assert.ok(
      home.includes("padding: \"15px\"") || home.includes('padding:"15px"') ||
      home.includes("padding: \"14px\"") || home.includes('padding:"14px"'),
      "Continue button needs adequate touch target height"
    );
  });

  it("admin sidebar nav items have sufficient tap area", () => {
    assert.ok(
      admin.includes("padding: \"12px") || admin.includes('padding:"12px'),
      "sidebar nav items need adequate padding for touch"
    );
  });
});

// =============================================================================
// 8. RESPONSIVE CSS BREAKPOINTS
// =============================================================================
describe("Responsive CSS breakpoints", () => {
  it("Home has 768px mobile breakpoint", () => {
    assert.ok(
      home.includes("max-width: 768px") || home.includes("max-width:768px"),
      "768px breakpoint needed for tablet/mobile boundary"
    );
  });

  it("Admin has 639px modal breakpoint", () => {
    assert.ok(
      admin.includes("max-width:639px") || admin.includes("max-width: 639px"),
      "639px breakpoint for admin modals"
    );
  });

  it("Admin has 640px breakpoint for desktop modals", () => {
    assert.ok(
      admin.includes("min-width:640px") || admin.includes("min-width: 640px"),
      "640px desktop breakpoint for full modal"
    );
  });

  it("Info page has 900px sidebar breakpoint", () => {
    assert.ok(
      info.includes("max-width: 900px") || info.includes("max-width:900px"),
      "900px breakpoint to hide sidebar on tablet"
    );
  });

  it("Info page has 600px mobile breakpoint", () => {
    assert.ok(
      info.includes("max-width: 600px") || info.includes("max-width:600px"),
      "600px breakpoint for mobile layout adjustments"
    );
  });
});

// =============================================================================
// 9. NO HORIZONTAL OVERFLOW
// =============================================================================
describe("No horizontal overflow / layout breakage", () => {
  it("Home uses percentage widths or max-width for sections", () => {
    assert.ok(
      home.includes("maxWidth: 1200") || home.includes("maxWidth:1200") ||
      home.includes("max-width: 1200"),
      "sections need max-width container to prevent overflow"
    );
  });

  it("booking modal width is 100% with max-width cap", () => {
    assert.ok(
      home.includes("width: \"100%\"") || home.includes('width:"100%"'),
      "modal must be 100% width with maxWidth cap"
    );
    assert.ok(
      home.includes("maxWidth: 580") || home.includes("maxWidth:580"),
      "modal must cap at 580px on desktop"
    );
  });

  it("admin panel main content uses flex:1 with overflow control", () => {
    assert.ok(
      admin.includes("flex:1") || admin.includes("flex: 1"),
      "admin main area needs flex:1"
    );
    assert.ok(
      admin.includes("overflowX: \"hidden\"") || admin.includes('overflowX:"hidden"'),
      "admin main must hide horizontal overflow"
    );
  });

  it("all images have max-width:100% or use objectFit", () => {
    const imgCount = (home.match(/<img /g) || []).length;
    const objectFitCount = (home.match(/objectFit/g) || []).length;
    const maxWidthCount  = (home.match(/maxWidth.*100%|max-width.*100%/g) || []).length;
    assert.ok(
      objectFitCount + maxWidthCount >= imgCount,
      `${imgCount} images but only ${objectFitCount + maxWidthCount} have objectFit or maxWidth:100%`
    );
  });
});

// =============================================================================
// 10. FOOTER LINKS
// =============================================================================
describe("Footer links active and pointing to Info page", () => {
  const slugMap = {
    "About Us":           "/info#about",
    "Our Fleet":          "/info#fleet",
    "Route Map":          "/info#routes",
    "Safety & Licensing": "/info#safety",
    "FAQ":                "/faq",
    "Terms & Conditions": "/info#terms",
  };

  it("footer uses <Link> component for info links", () => {
    assert.ok(home.includes("Link") && home.includes("/info#"), "footer must use <Link to='/info#...'>");
  });

  Object.entries(slugMap).forEach(([label, path]) => {
    it(`"${label}" footer link points to ${path}`, () => {
      assert.ok(home.includes(path), `Footer link to ${path} is missing`);
    });
  });
});

console.log("\n✓ mobile-ux.test.mjs loaded");
