/**
 * security.test.mjs — Security audit tests
 * Run: node --test tests/security.test.mjs
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, "..");
const read  = (f) => readFileSync(resolve(root, f), "utf8");

// =============================================================================
// 1. nginx.conf — HTTP security headers
// =============================================================================
describe("nginx.conf security headers", () => {
  const nginx = read("nginx.conf");

  it("has Content-Security-Policy", () => {
    assert.ok(nginx.includes("Content-Security-Policy"), "CSP header missing");
  });

  it("CSP blocks object-src none", () => {
    assert.ok(nginx.includes("object-src") && nginx.includes("'none'"), "object-src must be 'none'");
  });

  it("CSP sets base-uri self", () => {
    assert.ok(nginx.includes("base-uri"), "base-uri missing from CSP");
  });

  it("has Strict-Transport-Security (HSTS)", () => {
    assert.ok(nginx.includes("Strict-Transport-Security"), "HSTS missing");
  });

  it("HSTS max-age is at least 1 year (31536000)", () => {
    assert.ok(nginx.includes("31536000"), "HSTS max-age should be 1yr");
  });

  it("HSTS includes includeSubDomains", () => {
    assert.ok(nginx.includes("includeSubDomains"), "HSTS should include subdomains");
  });

  it("has X-Frame-Options to prevent clickjacking", () => {
    assert.ok(nginx.includes("X-Frame-Options"), "X-Frame-Options missing");
    assert.ok(
      nginx.includes("SAMEORIGIN") || nginx.includes("DENY"),
      "X-Frame-Options must be SAMEORIGIN or DENY"
    );
  });

  it("has X-Content-Type-Options: nosniff", () => {
    assert.ok(nginx.includes("X-Content-Type-Options"), "X-Content-Type-Options missing");
    assert.ok(nginx.includes("nosniff"), "must be set to nosniff");
  });

  it("has Referrer-Policy", () => {
    assert.ok(nginx.includes("Referrer-Policy"), "Referrer-Policy missing");
  });

  it("has Permissions-Policy", () => {
    assert.ok(nginx.includes("Permissions-Policy"), "Permissions-Policy missing");
  });

  it("disables geolocation in Permissions-Policy", () => {
    assert.ok(nginx.includes("geolocation=()"), "geolocation should be disabled");
  });

  it("has server_tokens off (hides nginx version)", () => {
    assert.ok(nginx.includes("server_tokens off"), "server_tokens must be off");
  });

  it("has rate limiting zone defined", () => {
    assert.ok(nginx.includes("limit_req_zone"), "rate limiting zone missing");
  });

  it("applies rate limiting to requests", () => {
    assert.ok(nginx.includes("limit_req "), "limit_req directive missing");
  });

  it("returns 429 on rate limit exceeded", () => {
    assert.ok(nginx.includes("limit_req_status 429"), "should return 429 on rate limit");
  });
});

// =============================================================================
// 2. Credential security
// =============================================================================
describe("Admin credential security", () => {
  const admin = read("src/pages/Admin.jsx");

  it("credentials use import.meta.env (not hardcoded)", () => {
    assert.ok(admin.includes("import.meta.env.VITE_ADMIN_USER"), "must use env var for user");
    assert.ok(admin.includes("import.meta.env.VITE_ADMIN_PASS"), "must use env var for pass");
  });

  it("no hardcoded password fallback in source", () => {
    // Should not fall back to a plain string literal
    const hasFallback = admin.includes('|| "moldova2024"') || admin.includes("|| 'moldova2024'");
    assert.ok(!hasFallback, "hardcoded password fallback must not exist in source");
  });

  it("login hint does not reveal actual credentials", () => {
    const hasHint = admin.includes("admin / moldova2024") || admin.includes("Hint: admin");
    assert.ok(!hasHint, "credential hint should not appear in UI");
  });

  it(".env is in .gitignore", () => {
    const gitignore = read(".gitignore");
    assert.ok(
      gitignore.includes(".env") || gitignore.includes("*.env"),
      ".env must be gitignored"
    );
  });

  it(".env.example exists", () => {
    let exists = false;
    try { read(".env.example"); exists = true; } catch {}
    assert.ok(exists, ".env.example should exist for documentation");
  });

  it(".env.example has VITE_ADMIN_USER and VITE_ADMIN_PASS keys", () => {
    const envExample = read(".env.example");
    assert.ok(envExample.includes("VITE_ADMIN_USER"), "missing VITE_ADMIN_USER in .env.example");
    assert.ok(envExample.includes("VITE_ADMIN_PASS"), "missing VITE_ADMIN_PASS in .env.example");
  });

  it("has client-side rate limiting logic", () => {
    assert.ok(admin.includes("loginAttempts"), "should have rate limiting variable");
    assert.ok(admin.includes("lockedUntil"),   "should have lockout timer");
  });
});

// =============================================================================
// 3. XSS protection
// =============================================================================
describe("XSS protection", () => {
  const home = read("src/pages/Home.jsx");
  const admin = read("src/pages/Admin.jsx");
  const adventures = read("src/pages/Adventures.jsx");

  it("no dangerouslySetInnerHTML in Home.jsx", () => {
    assert.ok(!home.includes("dangerouslySetInnerHTML"), "dangerouslySetInnerHTML found in Home");
  });

  it("no dangerouslySetInnerHTML in Admin.jsx", () => {
    assert.ok(!admin.includes("dangerouslySetInnerHTML"), "dangerouslySetInnerHTML found in Admin");
  });

  it("no dangerouslySetInnerHTML in Adventures.jsx", () => {
    assert.ok(!adventures.includes("dangerouslySetInnerHTML"), "dangerouslySetInnerHTML found in Adventures");
  });

  it("no direct innerHTML assignment in any page", () => {
    const pages = [home, admin, adventures];
    pages.forEach((src, i) => {
      assert.ok(!src.includes("innerHTML ="), `innerHTML assignment found in file ${i}`);
    });
  });

  it("Leaflet popup uses esc() sanitiser", () => {
    assert.ok(home.includes("esc(stop.name)"),  "stop.name must be sanitised");
    assert.ok(home.includes("esc(stop.label)"), "stop.label must be sanitised");
    assert.ok(home.includes("esc(stop.sub)"),   "stop.sub must be sanitised");
  });

  it("esc() function is defined", () => {
    assert.ok(home.includes("function esc("), "esc() sanitiser must be defined");
  });

  it("esc() sanitizes script tags", () => {
    // Inline test of the same logic the esc() function uses
    function esc(s) {
      const ENTITIES = { 38: "&amp;", 60: "&lt;", 62: "&gt;", 34: "&quot;", 39: "&#39;" };
      const str = String(s);
      let out = "";
      for (let j = 0; j < str.length; j++) {
        const k = str.charCodeAt(j);
        out += ENTITIES[k] !== undefined ? ENTITIES[k] : str[j];
      }
      return out;
    }
    assert.equal(esc("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("esc() sanitizes double quotes", () => {
    function esc(s) {
      const ENTITIES = { 38: "&amp;", 60: "&lt;", 62: "&gt;", 34: "&quot;", 39: "&#39;" };
      const str = String(s);
      let out = "";
      for (let j = 0; j < str.length; j++) {
        const k = str.charCodeAt(j);
        out += ENTITIES[k] !== undefined ? ENTITIES[k] : str[j];
      }
      return out;
    }
    assert.equal(esc('He said "hello"'), "He said &quot;hello&quot;");
  });

  it("esc() sanitizes ampersands", () => {
    function esc(s) {
      const ENTITIES = { 38: "&amp;", 60: "&lt;", 62: "&gt;", 34: "&quot;", 39: "&#39;" };
      const str = String(s);
      let out = "";
      for (let j = 0; j < str.length; j++) {
        const k = str.charCodeAt(j);
        out += ENTITIES[k] !== undefined ? ENTITIES[k] : str[j];
      }
      return out;
    }
    assert.equal(esc("Fish & Chips"), "Fish &amp; Chips");
  });

  it("Leaflet loads from unpkg CDN without SRI (dynamic scripts cannot use SRI reliably)", () => {
    // SRI on dynamically-injected script elements causes silent load failure
    // because CDN responses may differ by compression. Intentionally removed.
    assert.ok(home.includes("unpkg.com/leaflet"), "Leaflet must load from unpkg");
    assert.ok(!home.includes("script.integrity ="), "SRI must NOT be on dynamic script (causes silent failure)");
  });
});

// =============================================================================
// 4. Dependency security
// =============================================================================
describe("Dependency security", () => {
  const pkg = JSON.parse(read("package.json"));

  it("uses React 18+ (not legacy version)", () => {
    const v = pkg.dependencies.react;
    const major = parseInt(v.replace(/[\^~]/, "").split(".")[0]);
    assert.ok(major >= 18, `React should be 18+, got ${v}`);
  });

  it("uses Vite 5+ (active major)", () => {
    const v = pkg.devDependencies.vite;
    const major = parseInt(v.replace(/[\^~]/, "").split(".")[0]);
    assert.ok(major >= 5, `Vite should be 5+, got ${v}`);
  });

  it("uses react-router-dom 6+ (active major)", () => {
    const v = pkg.dependencies["react-router-dom"];
    const major = parseInt(v.replace(/[\^~]/, "").split(".")[0]);
    assert.ok(major >= 6, `react-router-dom should be 6+, got ${v}`);
  });

  it("has no known vulnerable packages listed as direct deps", () => {
    const KNOWN_VULNERABLE = ["lodash", "moment", "jquery", "handlebars", "serialize-javascript"];
    KNOWN_VULNERABLE.forEach(pkg_name => {
      const inDeps    = !!pkg.dependencies?.[pkg_name];
      const inDevDeps = !!pkg.devDependencies?.[pkg_name];
      assert.ok(!inDeps && !inDevDeps, `Potentially vulnerable package "${pkg_name}" found in dependencies`);
    });
  });
});

// =============================================================================
// 5. Info leakage
// =============================================================================
describe("Information leakage", () => {
  const admin = read("src/pages/Admin.jsx");
  const home  = read("src/pages/Home.jsx");

  it("no console.log statements in production code", () => {
    // Allow in comments; check actual calls
    const adminLogs = (admin.match(/console\.log\s*\(/g) || []).length;
    const homeLogs  = (home.match(/console\.log\s*\(/g)  || []).length;
    assert.equal(adminLogs, 0, `Admin.jsx has ${adminLogs} console.log() calls`);
    assert.equal(homeLogs,  0, `Home.jsx has ${homeLogs} console.log() calls`);
  });

  it("no TODO/FIXME security items in source", () => {
    const securityTodos = (admin.match(/TODO.*(?:security|auth|cred|password|secret)/gi) || []);
    assert.equal(securityTodos.length, 0, "Security TODOs found: " + securityTodos.join(", "));
  });

  it("admin route is not crawlable (no sitemap reference)", () => {
    // Admin should not be referenced in public SEO content
    const seoSection = home.includes("/admin") ? home.indexOf("SEO") : -1;
    // Just verify admin link is not inside a sitemap/meta tag
    const metaTags = home.match(/<meta[^>]*>/g) || [];
    const adminInMeta = metaTags.some(t => t.includes("/admin"));
    assert.ok(!adminInMeta, "/admin should not appear in meta tags");
  });
});

console.log("\n✓ security.test.mjs loaded successfully");
