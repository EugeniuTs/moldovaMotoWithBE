import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ORANGE = "#ff6b00";
const DARK   = "#0a0a0b";
const CARD   = "#111113";
const SURFACE= "#16161a";
const BORDER = "#252525";
const WHITE  = "#f0f0f4";
const MUTED  = "#72727a";

const NAV_LINKS = [
  { href: "#about",   label: "About Us" },
  { href: "#fleet",   label: "Our Fleet" },
  { href: "#routes",  label: "Route Map" },
  { href: "#safety",  label: "Safety & Licensing" },
  { href: "#faq",     label: "FAQ" },
  { href: "#terms",   label: "Terms & Conditions" },
];

const css = `
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Archivo", -apple-system, sans-serif; background: #0a0a0b; color: #f0f0f4; }
  a { color: #ff6b00; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .info-nav-link { transition: color 0.2s; }
  .info-nav-link:hover { color: #ff6b00 !important; }
  .info-nav-link.active-section { color: #ff6b00 !important; font-weight: 700; }
  .faq-item { border-bottom: 1px solid #252525; }
  .faq-q { width: 100%; background: transparent; border: none; color: #f0f0f4;
    font-family: inherit; font-size: 15px; font-weight: 700; text-align: left;
    padding: 18px 0; cursor: pointer; display: flex; justify-content: space-between;
    align-items: center; gap: 12px; }
  .faq-q:hover { color: #ff6b00; }
  .faq-a { color: #72727a; line-height: 1.7; font-size: 14px; padding-bottom: 18px; }
  .feature-pill { display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,107,0,0.08); border: 1px solid rgba(255,107,0,0.2);
    border-radius: 20px; padding: 5px 14px; font-size: 12px; color: #ff6b00; font-weight: 700; }
  .cta-orange { background: #ff6b00; color: #fff; border: none; border-radius: 12px;
    padding: 14px 32px; font-size: 15px; font-weight: 800; cursor: pointer;
    font-family: inherit; letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none;
    display: inline-block; transition: transform 0.15s, box-shadow 0.15s; }
  .cta-orange:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,107,0,0.35); text-decoration: none; }
  .section-tag { font-size: 11px; font-weight: 800; letter-spacing: 0.18em;
    text-transform: uppercase; color: #ff6b00; margin-bottom: 12px; }
  .section-h2 { font-size: clamp(28px, 5vw, 46px); font-weight: 900;
    letter-spacing: -0.025em; line-height: 1.05; margin: 0 0 20px; }
  .card-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .card-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .info-card { background: #16161a; border: 1px solid #252525; border-radius: 16px; padding: 24px; }
  .check-list { list-style: none; padding: 0; margin: 0; }
  .check-list li { display: flex; align-items: flex-start; gap: 10px;
    padding: 7px 0; font-size: 14px; color: #72727a; border-bottom: 1px solid #252525; }
  .check-list li:last-child { border-bottom: none; }
  .check-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff6b00;
    flex-shrink: 0; margin-top: 6px; }
  .section-divider { border: none; border-top: 1px solid #252525; margin: 80px 0; }
  .stat-row { display: flex; gap: 40px; flex-wrap: wrap; }
  .stat-num { font-size: 36px; font-weight: 900; color: #ff6b00; line-height: 1; }
  .stat-lbl { font-size: 12px; color: #72727a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
  .sidebar-nav { position: sticky; top: 80px; }
  .route-card { background: #16161a; border: 1px solid #252525; border-radius: 14px;
    padding: 22px 24px; margin-bottom: 16px; }
  .route-card:hover { border-color: rgba(255,107,0,0.3); }
  .requirement-box { background: rgba(255,107,0,0.06); border: 1px solid rgba(255,107,0,0.2);
    border-radius: 12px; padding: 16px 20px; }
  @media (max-width: 900px) {
    .page-layout { flex-direction: column !important; }
    .sidebar { display: none !important; }
    .card-grid-2 { grid-template-columns: 1fr !important; }
    .card-grid-3 { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 600px) {
    .card-grid-3 { grid-template-columns: 1fr !important; }
    .stat-row { gap: 24px; }
  }
`;

function Section({ id, children }) {
  return (
    <section id={id} style={{ paddingTop: 80, paddingBottom: 80, scrollMarginTop: 80 }}>
      {children}
    </section>
  );
}

function CheckList({ items }) {
  return (
    <ul className="check-list">
      {items.map((item, i) => (
        <li key={i}><span className="check-dot" /><span>{item}</span></li>
      ))}
    </ul>
  );
}

const FAQS = [
  { q: "Do I need a motorcycle license?", a: "Yes. A valid motorcycle license (Category A or A2 minimum) is required for all tours and rentals. We verify this at check-in." },
  { q: "Do you offer guided tours?", a: "Yes. We offer fully guided small-group tours with a local expert rider, as well as self-guided motorcycle rentals for experienced riders who prefer to explore independently." },
  { q: "What is included in the rental?", a: "Every rental includes the motorcycle, helmet, gloves, phone holder/navigation mount, luggage system (top case or side panniers), and 24/7 roadside assistance." },
  { q: "Do I need travel insurance?", a: "We strongly recommend comprehensive travel insurance that covers motorcycle riding. The motorcycle has basic third-party insurance included, but personal travel cover is your responsibility." },
  { q: "What happens in case of breakdown?", a: "We provide roadside assistance and a support vehicle on all guided tours. For rentals, we respond within 2 hours anywhere in Moldova." },
  { q: "Can beginners join the tours?", a: "Tours are designed for riders with previous motorcycle experience — minimum 2 years on bikes over 400cc. If you’re a complete beginner, get in touch and we’ll help you find the right option." },
  { q: "How many riders are in a group?", a: "Groups are capped at 6–8 riders to keep the experience personal. No crowded convoys — just a small group of passionate riders." },
  { q: "When is the best time to visit Moldova?", a: "April through October is the ideal riding season. Late May through September offers the best weather — warm days, dry roads, and the vineyards in full bloom. September harvest season is our personal favourite." },
];

export default function InfoPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    ["about","fleet","routes","safety","faq","terms"].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Scroll to hash on mount
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  return (
    <>
      <style>{css}</style>

      {/* ── Top nav bar ──────────────────────────────────────────────────────── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,11,0.95)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid " + BORDER }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%",
          display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <Link to="/" style={{ color: WHITE, fontWeight: 800, fontSize: 15, letterSpacing: "0.04em" }}>
            ← Back to MoldovaMoto
          </Link>
          <div style={{ display: "flex", gap: 24, overflow: "auto" }}>
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href}
                className={"info-nav-link" + (activeSection === href.slice(1) ? " active-section" : "")}
                style={{ fontSize: 12, fontWeight: 600, color: MUTED, whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: "0.08em", textDecoration: "none" }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Page layout ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%", paddingBottom: 120 }}>
        <div className="page-layout" style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <aside className="sidebar" style={{ width: 200, flexShrink: 0 }}>
            <div className="sidebar-nav" style={{ paddingTop: 60 }}>
              {NAV_LINKS.map(({ href, label }) => (
                <a key={href} href={href} style={{ display: "block", padding: "8px 0",
                  fontSize: 13, textDecoration: "none", borderLeft: "2px solid " + (activeSection === href.slice(1) ? ORANGE : BORDER),
                  paddingLeft: 14, marginBottom: 4, transition: "all 0.2s",
                  color: activeSection === href.slice(1) ? WHITE : MUTED,
                  fontWeight: activeSection === href.slice(1) ? 700 : 400 }}>
                  {label}
                </a>
              ))}
              <div style={{ marginTop: 32, padding: "18px 16px", background: "rgba(255,107,0,0.07)",
                border: "1px solid rgba(255,107,0,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE, marginBottom: 8 }}>Ready to ride?</div>
                <Link to="/" className="cta-orange" style={{ padding: "10px 16px", fontSize: 12, borderRadius: 8, display: "block", textAlign: "center" }}>
                  Book a Tour →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────────── */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ABOUT US */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Section id="about">
              <div style={{ paddingTop: 20 }}>
                <div className="section-tag">🏍️ Our Story</div>
                <h1 className="section-h2">The Last Authentic<br /><span style={{ color: ORANGE }}>Roads of Europe</span></h1>
                <p style={{ fontSize: 17, color: "#c0c0c8", lineHeight: 1.75, maxWidth: 660, marginBottom: 40 }}>
                  Moldova Moto Tours was created for riders who want to discover one of the last genuinely untouched regions of Europe — not a postcard version of it, but the real thing.
                </p>

                <div className="stat-row" style={{ marginBottom: 56 }}>
                  {[["300+","Riders Guided"],["4.9★","Average Rating"],["6","Iconic Stops"],["100%","Licensed Guides"]].map(([n,l]) => (
                    <div key={l}>
                      <div className="stat-num">{n}</div>
                      <div className="stat-lbl">{l}</div>
                    </div>
                  ))}
                </div>

                <div className="card-grid-2" style={{ marginBottom: 40 }}>
                  <div className="info-card">
                    <div style={{ fontSize: 24, marginBottom: 12 }}>🗺️</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>What We Do</div>
                    <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      We organise motorcycle tours and rentals through Moldova’s hidden roads, authentic villages, vineyard landscapes, and wild river canyons — experiences that most European travellers never find.
                    </p>
                  </div>
                  <div className="info-card">
                    <div style={{ fontSize: 24, marginBottom: 12 }}>🎯</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Our Mission</div>
                    <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      To show riders the Moldova that travel guides miss — the untouched roads, the real culture, the genuine hospitality, and the scenery that rivals anywhere in Europe at a fraction of the price.
                    </p>
                  </div>
                </div>

                <div className="info-card" style={{ marginBottom: 40 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Every Tour Includes</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {["Scenic riding routes personally tested by our team","Local cuisine & wine experiences","Historic monasteries and landmark stops","Authentic rural landscapes off the tourist trail","Small groups — maximum 8 riders","CFMOTO 800MT Adventure motorcycles included","24/7 roadside support"].map(item => (
                      <span key={item} className="feature-pill">{item}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "linear-gradient(135deg, rgba(255,107,0,0.1), rgba(255,107,0,0.04))",
                  border: "1px solid rgba(255,107,0,0.25)", borderRadius: 16, padding: "28px 32px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Our Promise</div>
                  <p style={{ color: MUTED, lineHeight: 1.7, margin: "0 0 20px", fontSize: 15 }}>
                    We don’t run crowded bus tours with a flag at the front. We ride. Every route has been personally tested by experienced riders to find the perfect balance between adventure, safety, and unforgettable scenery.
                  </p>
                  <Link to="/" className="cta-orange">Book Your Ride →</Link>
                </div>
              </div>
            </Section>

            <hr className="section-divider" />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* OUR FLEET */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Section id="fleet">
              <div className="section-tag">🏍️ Our Fleet</div>
              <h2 className="section-h2">Premium Bikes.<br /><span style={{ color: ORANGE }}>Zero Compromises.</span></h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, maxWidth: 600, marginBottom: 40 }}>
                Every motorcycle in our fleet is maintained to the highest standards and inspected before each rental or tour. We ride CFMOTO 800MT Adventure bikes — the sweet spot between touring comfort and off-road capability.
              </p>

              <div className="card-grid-2" style={{ marginBottom: 32 }}>
                <div className="info-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,107,0,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏔️</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>Adventure Motorcycles</div>
                      <div style={{ fontSize: 12, color: MUTED }}>CFMOTO 800MT Adventure</div>
                    </div>
                  </div>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
                    The perfect machine for Moldova’s mixed terrain — smooth vineyard roads, river valley twisties, and the occasional unpaved monastery track.
                  </p>
                  <CheckList items={["799cc parallel-twin, 95hp","Comfortable upright riding position","Long suspension travel for mixed roads","Modern electronics: ABS, traction control, ride modes","Heated grips · cruise control · USB-C charging"]} />
                </div>
                <div className="info-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,107,0,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>What’s Always Included</div>
                      <div style={{ fontSize: 12, color: MUTED }}>Every rental & tour</div>
                    </div>
                  </div>
                  <CheckList items={["Full-face helmet (Shoei / AGV)","Riding gloves","Navigation mount / phone holder","Top case + side panniers","Basic riding gear (optional upgrade)","Third-party insurance","24/7 roadside assistance"]} />
                </div>
              </div>

              <div className="info-card" style={{ background: "rgba(255,107,0,0.04)", border: "1px solid rgba(255,107,0,0.15)" }}>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ORANGE, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Maintenance Standard</div>
                    <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      Every bike is professionally serviced every 3,000 km or 3 months (whichever comes first), inspected by our mechanic before each rental, and equipped with a full safety systems check.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 20, flexShrink: 0 }}>
                    {[["3k km","Service interval"],["100%","Pre-trip inspected"],["2hr","Breakdown response"]].map(([n,l]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: ORANGE }}>{n}</div>
                        <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <hr className="section-divider" />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ROUTE MAP */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Section id="routes">
              <div className="section-tag">🗺️ Routes</div>
              <h2 className="section-h2">Roads No GPS<br /><span style={{ color: ORANGE }}>Will Ever Suggest</span></h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, maxWidth: 600, marginBottom: 40 }}>
                Moldova punches well above its weight for motorcycle touring. You get empty roads, dramatic scenery, world-class wine culture, and monastery landscapes rivalling Greece — without the crowds or the price tag.
              </p>

              {[
                {
                  name: "Wine Roads Tour", tag: "1 Day · €220", emoji: "🍷",
                  tagline: "From underground cities to open vineyard roads",
                  desc: "Start in Chișinău and ride south into Moldova’s famous wine heartland. Descend into the legendary Cricova underground wine cellars — 120 km of subterranean galleries housing millions of bottles. Then weave through open vineyard countryside back to the capital.",
                  highlights: ["Cricova underground wine cellars","Scenic vineyard roads","Traditional winery lunch","Expert local guide"]
                },
                {
                  name: "Monasteries & History Tour", tag: "3 Days · €650", emoji: "⛪",
                  tagline: "Cliff monasteries, canyon riding and river valley roads",
                  desc: "A three-day journey from Chișinău to Orheiul Vechi — a 6th-century monastery carved into the limestone cliffs above the Răut River — then north along the Dniester canyon to Saharna, an 18th-century monastery hidden above a dramatic waterfall.",
                  highlights: ["Orheiul Vechi cliff monastery","Dniester river valley route","Saharna canyon & waterfall","Village overnight stays","Full board included"]
                },
                {
                  name: "The Grand Moldova Tour", tag: "5 Days · €1,050", emoji: "🏆",
                  tagline: "The definitive Moldovan odyssey — north to south, all 6 stops",
                  desc: "The full country traverse. Wine roads, cliff monasteries, a medieval Genoese fortress on the Ukrainian border, and a massive Ottoman citadel on the Dniester. Everything Moldova has to offer, riding every road worth riding.",
                  highlights: ["All 6 iconic stops","Soroca medieval fortress","Bender Ottoman citadel","5 days of pure riding","Support vehicle throughout","All meals & accommodation"]
                },
              ].map(route => (
                <div key={route.name} className="route-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                    gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{route.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17 }}>{route.name}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{route.tagline}</div>
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                      borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 800, color: ORANGE, flexShrink: 0 }}>
                      {route.tag}
                    </div>
                  </div>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{route.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {route.highlights.map(h => <span key={h} className="feature-pill">{h}</span>)}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 32, textAlign: "center", padding: "28px", background: SURFACE,
                border: "1px solid " + BORDER, borderRadius: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Not sure which tour suits you?</div>
                <p style={{ color: MUTED, margin: "0 0 20px", fontSize: 14 }}>
                  Message us on WhatsApp and we’ll help you pick the perfect route based on your experience and schedule.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="https://wa.me/37369765298" className="cta-orange">Chat on WhatsApp</a>
                  <Link to="/" style={{ background: "transparent", border: "1.5px solid " + BORDER,
                    color: WHITE, borderRadius: 12, padding: "14px 28px", fontSize: 15, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" }}>
                    Book Directly →
                  </Link>
                </div>
              </div>
            </Section>

            <hr className="section-divider" />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SAFETY & LICENSING */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Section id="safety">
              <div className="section-tag">🛡️ Safety</div>
              <h2 className="section-h2">Your Safety.<br /><span style={{ color: ORANGE }}>Our Responsibility.</span></h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, maxWidth: 600, marginBottom: 40 }}>
                We take safety seriously — not as a legal box to tick, but because we’re riders too and we want you to come home with great stories, not great hospital bills.
              </p>

              <div className="card-grid-3" style={{ marginBottom: 32 }}>
                {[
                  { icon: "📋", title: "License Requirements", items: ["Valid motorcycle license (Category A or A2)", "International driving permit for non-EU riders", "Minimum 2 years riding experience", "Experience on bikes over 500cc recommended"] },
                  { icon: "👶", title: "Age Requirements", items: ["Minimum age: 21 years old", "Some bikes require 25+ years", "Depends on motorcycle engine size", "No upper age limit — all welcome"] },
                  { icon: "🪖", title: "Mandatory Gear", items: ["Full-face helmet (mandatory — we provide)", "Protective riding jacket", "Riding gloves (we provide)", "Long trousers / riding pants", "Sturdy closed-toe shoes or boots"] },
                ].map(({ icon, title, items }) => (
                  <div key={title} className="info-card">
                    <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{title}</div>
                    <CheckList items={items} />
                  </div>
                ))}
              </div>

              <div className="requirement-box" style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>🚑 What Happens If Something Goes Wrong</div>
                <div className="card-grid-2" style={{ marginTop: 12 }}>
                  {[
                    { t: "Guided Tours", d: "A dedicated support vehicle follows every multi-day tour. Our guides carry first-aid kits and have emergency protocols for every route segment." },
                    { t: "Rentals", d: "24/7 roadside assistance. We guarantee a 2-hour response window anywhere in Moldova. A replacement motorcycle can be dispatched for longer breakdowns." },
                  ].map(({ t, d }) => (
                    <div key={t}>
                      <div style={{ fontWeight: 700, color: ORANGE, marginBottom: 6, fontSize: 13 }}>{t}</div>
                      <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-card">
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>🔒 Insurance Coverage</div>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7, marginBottom: 12 }}>
                  All motorcycles include mandatory third-party liability insurance. Additional comprehensive coverage options are available for extra peace of mind.
                </p>
                <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  We strongly recommend that all riders carry personal travel insurance that covers motorcycle touring. This protects you for medical costs, trip cancellation, and personal belongings.
                </p>
              </div>
            </Section>

            <hr className="section-divider" />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FAQ */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Section id="faq">
              <div className="section-tag">❓ FAQ</div>
              <h2 className="section-h2">Questions.<br /><span style={{ color: ORANGE }}>Answered.</span></h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, maxWidth: 600, marginBottom: 40 }}>
                Everything you need to know before booking. Still have questions? Message us directly.
              </p>

              <div style={{ border: "1px solid " + BORDER, borderRadius: 16, overflow: "hidden" }}>
                {FAQS.map((item, i) => (
                  <div key={i} className="faq-item" style={{ padding: "0 24px",
                    background: openFaq === i ? "rgba(255,107,0,0.04)" : "transparent",
                    transition: "background 0.2s" }}>
                    <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{item.q}</span>
                      <span style={{ color: ORANGE, fontSize: 20, flexShrink: 0, lineHeight: 1,
                        transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                    </button>
                    {openFaq === i && <div className="faq-a">{item.a}</div>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 32, padding: "24px 28px", background: SURFACE,
                border: "1px solid " + BORDER, borderRadius: 16, display: "flex",
                alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Still have a question?</div>
                  <div style={{ color: MUTED, fontSize: 14 }}>We reply on WhatsApp within 1 hour during business hours.</div>
                </div>
                <a href="https://wa.me/37369765298" className="cta-orange" style={{ flexShrink: 0 }}>
                  Message Us
                </a>
              </div>
            </Section>

            <hr className="section-divider" />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TERMS */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <Section id="terms">
              <div className="section-tag">📄 Legal</div>
              <h2 className="section-h2">Terms &<br /><span style={{ color: ORANGE }}>Conditions</span></h2>
              <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.75, maxWidth: 600, marginBottom: 40 }}>
                The important stuff. By booking with us you agree to the following terms. We’ve written these in plain English.
              </p>

              {[
                {
                  icon: "📅", title: "Booking & Reservations",
                  body: "Reservations must be made in advance through our website or by direct contact. A deposit may be required to confirm your booking. Full payment must be completed before the start of the rental or tour. We accept credit card, bank transfer, and online payment."
                },
                {
                  icon: "🔄", title: "Cancellations & Refunds",
                  body: "Cancellations more than 14 days before the tour date: full refund of deposit. 7–14 days: 50% refund. Under 7 days: no refund. In case of force majeure (extreme weather, political events) we will offer a full rebooking at no extra cost."
                },
                {
                  icon: "🏍️", title: "Rider Responsibility",
                  body: "You are responsible for respecting local traffic laws, riding safely and sober, and returning the motorcycle in the same condition you received it. Any damage caused by negligence, reckless riding, or riding under the influence will be charged to the renter at full repair cost."
                },
                {
                  icon: "⚖️", title: "Liability",
                  body: "Participants acknowledge that motorcycle riding carries inherent risks and agree to participate at their own responsibility. Moldova Moto Tours cannot be held liable for accidents resulting from rider negligence, violation of traffic laws, or failure to follow guide instructions during tours."
                },
                {
                  icon: "🔒", title: "Insurance",
                  body: "All rentals include mandatory third-party insurance as required by Moldovan law. Comprehensive coverage is the rider’s responsibility unless an upgrade package is purchased. We strongly recommend personal travel insurance covering motorcycle activities."
                },
              ].map(({ icon, title, body }) => (
                <div key={title} style={{ marginBottom: 20, padding: "20px 24px",
                  background: SURFACE, border: "1px solid " + BORDER, borderRadius: 14 }}>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: WHITE }}>{title}</span>
                  </div>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{body}</p>
                </div>
              ))}

              <div style={{ marginTop: 16, padding: "16px 20px", background: "rgba(255,107,0,0.06)",
                border: "1px solid rgba(255,107,0,0.15)", borderRadius: 12, fontSize: 12, color: "#888", lineHeight: 1.7 }}>
                Last updated: April 2026. For the full legal document or specific contractual queries, contact us at{" "}
                <a href="mailto:eugeniutaralunga@gmail.com" style={{ color: ORANGE }}>eugeniutaralunga@gmail.com</a>.
              </div>
            </Section>

            {/* ── Final CTA ─────────────────────────────────────────────────── */}
            <div style={{ marginTop: 60, padding: "48px 40px", background: "linear-gradient(135deg, #ff6b00, #cc4400)",
              borderRadius: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>Ready to Ride Moldova?</div>
              <p style={{ color: "rgba(255,255,255,0.85)", margin: "0 0 28px", fontSize: 16, lineHeight: 1.7 }}>
                Limited spots available. Book early to secure your place on the road less travelled.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/" style={{ background: "#fff", color: ORANGE, borderRadius: 12,
                  padding: "14px 32px", fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
                  Book Your Tour →
                </Link>
                <a href="https://wa.me/37369765298" style={{ background: "rgba(0,0,0,0.2)",
                  color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12,
                  padding: "14px 28px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                  WhatsApp Us
                </a>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
