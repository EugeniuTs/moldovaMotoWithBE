import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const OR = "#ff6b00";
const BG = "#0a0a0b";
const CARD = "#111113";
const SURF = "#16161a";
const BDR = "#252525";
const WH = "#f0f0f4";
const MU = "#72727a";
const DIM = "#44444c";

const NAV = [
  { id: "about",  label: "About Us" },
  { id: "fleet",  label: "Our Fleet" },
  { id: "routes", label: "Route Map" },
  { id: "safety", label: "Safety & Licensing" },
  { id: "faq",    label: "FAQ" },
  { id: "terms",  label: "Terms & Conditions" },
];

const FAQS = [
  { q: "Do I need a motorcycle license?",
    a: "Yes. A valid motorcycle license (Category A or A2) is required for all tours and rentals. We verify this at check-in." },
  { q: "Do you offer guided tours?",
    a: "Yes. We offer fully guided small-group tours with a local expert rider, as well as self-guided rentals for experienced riders who prefer to explore independently." },
  { q: "What is included in the rental?",
    a: "Every rental includes the motorcycle, helmet, gloves, phone/navigation mount, luggage system (top case or side panniers), and 24/7 roadside assistance." },
  { q: "Do I need travel insurance?",
    a: "We strongly recommend comprehensive travel insurance covering motorcycle riding. The motorcycle has basic third-party insurance included, but personal travel cover is your responsibility." },
  { q: "What happens in case of breakdown?",
    a: "We provide roadside assistance and a support vehicle on all guided tours. For rentals, we respond within 2 hours anywhere in Moldova." },
  { q: "Can beginners join the tours?",
    a: "Tours are designed for riders with at least 2 years of experience on bikes over 400cc. If you are a complete beginner, contact us and we will help you find the right option." },
  { q: "How many riders are in a group?",
    a: "Groups are capped at 6-8 riders to keep the experience personal. No crowded convoys - just a small group of passionate riders." },
  { q: "When is the best time to visit Moldova?",
    a: "April through October is the ideal riding season. Late May through September offers the best weather. September harvest season is our personal favourite." },
];

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         background: #0a0a0b; color: #f0f0f4; }
  a { color: #ff6b00; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .info-link { color: #72727a; text-decoration: none; transition: color 0.2s; display: block;
               padding: 8px 0 8px 14px; font-size: 13px; margin-bottom: 4px; border-left: 2px solid #252525; }
  .info-link:hover { color: #f0f0f4 !important; text-decoration: none; }
  .info-link.active { color: #f0f0f4 !important; font-weight: 700; border-left-color: #ff6b00 !important; }
  .check-li { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0;
               font-size: 14px; color: #72727a; border-bottom: 1px solid #252525; }
  .check-li:last-child { border-bottom: none; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #ff6b00;
         flex-shrink: 0; margin-top: 6px; }
  .pill { display: inline-flex; align-items: center;
          background: rgba(255,107,0,0.08); border: 1px solid rgba(255,107,0,0.2);
          border-radius: 20px; padding: 5px 14px; font-size: 12px; color: #ff6b00; font-weight: 700;
          margin: 4px; }
  .cta { background: #ff6b00; color: #fff; border: none; border-radius: 12px;
         padding: 14px 32px; font-size: 15px; font-weight: 800; cursor: pointer;
         font-family: inherit; text-decoration: none; display: inline-block;
         transition: transform 0.15s, box-shadow 0.15s; }
  .cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,107,0,0.35);
               text-decoration: none; }
  .cta-ghost { background: transparent; color: #f0f0f4; border: 1.5px solid #252525;
               border-radius: 12px; padding: 13px 28px; font-size: 15px; font-weight: 700;
               cursor: pointer; font-family: inherit; text-decoration: none; display: inline-block; }
  .card { background: #16161a; border: 1px solid #252525; border-radius: 16px; padding: 24px; }
  .faq-btn { width: 100%; background: transparent; border: none; color: #f0f0f4;
             font-family: inherit; font-size: 15px; font-weight: 700; text-align: left;
             padding: 18px 24px; cursor: pointer; display: flex; justify-content: space-between;
             align-items: center; gap: 12px; }
  .faq-btn:hover { color: #ff6b00; }
  .faq-ans { color: #72727a; line-height: 1.7; font-size: 14px; padding: 0 24px 18px; }
  .tag { font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
         color: #ff6b00; margin-bottom: 12px; }
  .h2 { font-size: clamp(26px, 5vw, 44px); font-weight: 900; letter-spacing: -0.025em;
        line-height: 1.05; margin-bottom: 20px; }
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .hr { border: none; border-top: 1px solid #252525; margin: 80px 0; }
  .section-tag { background: rgba(255,107,0,0.1); border: 1px solid rgba(255,107,0,0.25);
                 border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 800;
                 color: #ff6b00; display: inline-block; margin-bottom: 14px; }
  @media (max-width: 900px) {
    .sidebar { display: none !important; }
    .page-wrap { flex-direction: column !important; }
    .g2 { grid-template-columns: 1fr !important; }
    .g3 { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 600px) {
    .g3 { grid-template-columns: 1fr !important; }
    .top-nav-links { display: none !important; }
    .section-pad { padding: 60px 5% !important; }
  }
`;

function Checks({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((item, i) => (
        <li key={i} className="check-li">
          <span className="dot" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Sec({ id, children }) {
  return (
    <section id={id} style={{ scrollMarginTop: 80 }}>
      {children}
    </section>
  );
}

export default function InfoPage() {
  const [active, setActive] = useState("about");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const els = NAV.map(n => document.getElementById(n.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  const s = {
    wrap:    { maxWidth: 1200, margin: "0 auto", padding: "0 5%" },
    section: { padding: "80px 0" },
    lead:    { fontSize: 16, color: MU, lineHeight: 1.75, maxWidth: 600, marginBottom: 40 },
  };

  return (
    <>
      <style>{css}</style>

      {/* Top nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,11,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid " + BDR }}>
        <div style={{ ...s.wrap, display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 64, gap: 16 }}>
          <Link to="/" style={{ color: WH, fontWeight: 800, fontSize: 14,
            flexShrink: 0, textDecoration: "none" }}>
            &larr; MoldovaMoto
          </Link>
          <div className="top-nav-links" style={{ display: "flex", gap: 20, overflow: "auto" }}>
            {NAV.map(n => (
              <a key={n.id} href={"#" + n.id} style={{
                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.08em", textDecoration: "none", whiteSpace: "nowrap",
                color: active === n.id ? OR : MU, transition: "color 0.2s" }}>
                {n.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Page layout */}
      <div style={{ ...s.wrap, paddingBottom: 120 }}>
        <div className="page-wrap" style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>

          {/* Sidebar */}
          <aside className="sidebar" style={{ width: 200, flexShrink: 0 }}>
            <div style={{ position: "sticky", top: 80, paddingTop: 60 }}>
              {NAV.map(n => (
                <a key={n.id} href={"#" + n.id}
                  className={"info-link" + (active === n.id ? " active" : "")}
                  style={{ borderLeftColor: active === n.id ? OR : BDR }}>
                  {n.label}
                </a>
              ))}
              <div style={{ marginTop: 32, padding: "18px 16px",
                background: "rgba(255,107,0,0.07)",
                border: "1px solid rgba(255,107,0,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: OR, marginBottom: 8 }}>
                  Ready to ride?
                </div>
                <Link to="/" className="cta"
                  style={{ padding: "10px 16px", fontSize: 12, borderRadius: 8,
                    display: "block", textAlign: "center" }}>
                  Book a Tour
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* ---- ABOUT ---- */}
            <Sec id="about">
              <div style={{ paddingTop: 40 }}>
                <span className="section-tag">Our Story</span>
                <h1 className="h2">The Last Authentic<br />
                  <span style={{ color: OR }}>Roads of Europe</span>
                </h1>
                <p style={s.lead}>
                  Moldova Moto Tours was created for riders who want to discover one of the last
                  genuinely untouched regions of Europe - not a postcard version of it, but the real thing.
                </p>

                {/* Stats */}
                <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 48 }}>
                  {[["300+","Riders Guided"],["4.9","Average Rating"],["6","Iconic Stops"],["100%","Licensed Guides"]].map(([n, l]) => (
                    <div key={l}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: OR, lineHeight: 1 }}>{n}</div>
                      <div style={{ fontSize: 11, color: MU, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>

                <div className="g2" style={{ marginBottom: 32 }}>
                  <div className="card">
                    <div style={{ fontSize: 22, marginBottom: 10 }}>Map</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>What We Do</div>
                    <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      We organise motorcycle tours and rentals through Moldova's hidden roads,
                      authentic villages, vineyard landscapes, and wild river canyons.
                    </p>
                  </div>
                  <div className="card">
                    <div style={{ fontSize: 22, marginBottom: 10 }}>Goal</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>Our Mission</div>
                    <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      To show riders the Moldova that travel guides miss - the untouched roads,
                      real culture, genuine hospitality, and scenery that rivals anywhere in Europe.
                    </p>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 32 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Every Tour Includes</div>
                  <div>
                    {["Scenic routes personally tested by our team","Local cuisine and wine experiences",
                      "Historic monasteries and landmark stops","Authentic rural landscapes",
                      "Small groups - maximum 8 riders","CFMOTO 800MT Adventure motorcycles",
                      "24/7 roadside support"].map(item => (
                      <span key={item} className="pill">{item}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,107,0,0.08)",
                  border: "1px solid rgba(255,107,0,0.25)", borderRadius: 16, padding: "28px 32px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Our Promise</div>
                  <p style={{ color: MU, lineHeight: 1.7, margin: "0 0 20px", fontSize: 15 }}>
                    We don't run crowded bus tours. We ride. Every route has been personally tested
                    to find the perfect balance between adventure, safety, and unforgettable scenery.
                  </p>
                  <Link to="/" className="cta">Book Your Ride</Link>
                </div>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- FLEET ---- */}
            <Sec id="fleet">
              <span className="section-tag">Our Fleet</span>
              <h2 className="h2">Premium Bikes.<br />
                <span style={{ color: OR }}>Zero Compromises.</span>
              </h2>
              <p style={s.lead}>
                Every motorcycle is maintained to the highest standards and inspected before
                each rental or tour. We ride CFMOTO 800MT Adventure bikes.
              </p>

              <div className="g2" style={{ marginBottom: 24 }}>
                <div className="card">
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>
                    CFMOTO 800MT Adventure
                  </div>
                  <Checks items={[
                    "799cc parallel-twin, 95hp",
                    "Comfortable upright riding position",
                    "Long suspension travel for mixed roads",
                    "ABS, traction control, multiple ride modes",
                    "Heated grips, cruise control, USB-C charging",
                  ]} />
                </div>
                <div className="card">
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>
                    Always Included
                  </div>
                  <Checks items={[
                    "Full-face helmet",
                    "Riding gloves",
                    "Navigation mount / phone holder",
                    "Top case + side panniers",
                    "Basic riding gear (optional upgrade)",
                    "Third-party insurance",
                    "24/7 roadside assistance",
                  ]} />
                </div>
              </div>

              <div className="card" style={{ background: "rgba(255,107,0,0.04)",
                border: "1px solid rgba(255,107,0,0.15)" }}>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: OR, marginBottom: 6,
                      textTransform: "uppercase", letterSpacing: "0.08em" }}>Maintenance Standard</div>
                    <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      Professionally serviced every 3,000 km or 3 months. Inspected before each rental.
                      Full safety systems check every trip.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                    {[["3k km","Service interval"],["100%","Pre-trip check"],["2hr","Breakdown response"]].map(([n,l]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: OR }}>{n}</div>
                        <div style={{ fontSize: 10, color: MU, textTransform: "uppercase",
                          letterSpacing: "0.06em" }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- ROUTES ---- */}
            <Sec id="routes">
              <span className="section-tag">Routes</span>
              <h2 className="h2">Roads No GPS<br />
                <span style={{ color: OR }}>Will Ever Suggest</span>
              </h2>
              <p style={s.lead}>
                Moldova offers empty roads, dramatic scenery, world-class wine culture, and
                monastery landscapes - without the crowds or the price tag.
              </p>

              {[
                { name: "Wine Roads Tour", tag: "1 Day - 220 EUR",
                  desc: "Start in Chisinau and ride through Moldova's famous wine heartland. Descend into the legendary Cricova underground wine cellars - 120 km of subterranean galleries housing millions of bottles.",
                  items: ["Cricova underground wine cellars","Scenic vineyard roads","Traditional winery lunch","Expert local guide"] },
                { name: "Monasteries and History Tour", tag: "3 Days - 650 EUR",
                  desc: "A three-day journey to Orheiul Vechi - a 6th-century monastery carved into limestone cliffs - then north along the Dniester canyon to Saharna, an 18th-century monastery above a dramatic waterfall.",
                  items: ["Orheiul Vechi cliff monastery","Dniester river valley route","Saharna canyon","Village overnight stays","Full board included"] },
                { name: "The Grand Moldova Tour", tag: "5 Days - 1,050 EUR",
                  desc: "The full country traverse. Wine roads, cliff monasteries, a medieval Genoese fortress on the Ukrainian border, and a massive Ottoman citadel on the Dniester. Everything Moldova has to offer.",
                  items: ["All 6 iconic stops","Soroca medieval fortress","Bender Ottoman citadel","5 days of pure riding","Support vehicle throughout","All meals and accommodation"] },
              ].map(route => (
                <div key={route.name} className="card"
                  style={{ marginBottom: 16, transition: "border-color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,107,0,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BDR}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{route.name}</div>
                    <div style={{ background: "rgba(255,107,0,0.1)",
                      border: "1px solid rgba(255,107,0,0.25)", borderRadius: 8,
                      padding: "6px 14px", fontSize: 13, fontWeight: 800, color: OR,
                      flexShrink: 0 }}>{route.tag}</div>
                  </div>
                  <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>{route.desc}</p>
                  <div>{route.items.map(h => <span key={h} className="pill">{h}</span>)}</div>
                </div>
              ))}

              <div style={{ marginTop: 32, textAlign: "center", padding: 28,
                background: SURF, border: "1px solid " + BDR, borderRadius: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  Not sure which tour suits you?
                </div>
                <p style={{ color: MU, margin: "0 0 20px", fontSize: 14 }}>
                  Message us on WhatsApp and we will help you pick the perfect route.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="https://wa.me/37369765298" className="cta">Chat on WhatsApp</a>
                  <Link to="/" className="cta-ghost">Book Directly</Link>
                </div>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- SAFETY ---- */}
            <Sec id="safety">
              <span className="section-tag">Safety</span>
              <h2 className="h2">Your Safety.<br />
                <span style={{ color: OR }}>Our Responsibility.</span>
              </h2>
              <p style={s.lead}>
                We take safety seriously - not as a legal box to tick, but because we are riders
                too and we want you to come home with great stories.
              </p>

              <div className="g3" style={{ marginBottom: 24 }}>
                {[
                  { title: "License Requirements", items: [
                    "Valid motorcycle license (Category A or A2)",
                    "International permit for non-EU riders",
                    "Minimum 2 years riding experience",
                    "Experience on bikes over 500cc recommended",
                  ]},
                  { title: "Age Requirements", items: [
                    "Minimum age: 21 years old",
                    "Some bikes require 25+ years",
                    "Depends on motorcycle engine size",
                    "No upper age limit",
                  ]},
                  { title: "Mandatory Gear", items: [
                    "Full-face helmet (we provide)",
                    "Protective riding jacket",
                    "Riding gloves (we provide)",
                    "Long trousers or riding pants",
                    "Sturdy closed-toe shoes or boots",
                  ]},
                ].map(({ title, items }) => (
                  <div key={title} className="card">
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{title}</div>
                    <Checks items={items} />
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,107,0,0.06)",
                border: "1px solid rgba(255,107,0,0.2)", borderRadius: 12,
                padding: "20px 24px", marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                  What Happens If Something Goes Wrong
                </div>
                <div className="g2">
                  {[
                    { t: "Guided Tours", d: "A support vehicle follows every multi-day tour. Our guides carry first-aid kits and have emergency protocols for every route segment." },
                    { t: "Rentals", d: "24/7 roadside assistance. 2-hour response guarantee anywhere in Moldova. A replacement motorcycle can be dispatched for longer breakdowns." },
                  ].map(({ t, d }) => (
                    <div key={t}>
                      <div style={{ fontWeight: 700, color: OR, marginBottom: 6, fontSize: 13 }}>{t}</div>
                      <p style={{ color: MU, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Insurance Coverage</div>
                <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                  All motorcycles include mandatory third-party liability insurance. Additional
                  comprehensive coverage is available. We strongly recommend personal travel
                  insurance covering motorcycle touring.
                </p>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- FAQ ---- */}
            <Sec id="faq">
              <span className="section-tag">FAQ</span>
              <h2 className="h2">Questions.<br />
                <span style={{ color: OR }}>Answered.</span>
              </h2>
              <p style={s.lead}>
                Everything you need to know before booking. Still have questions? Message us directly.
              </p>

              <div style={{ border: "1px solid " + BDR, borderRadius: 16, overflow: "hidden" }}>
                {FAQS.map((item, i) => (
                  <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid " + BDR : "none",
                    background: openFaq === i ? "rgba(255,107,0,0.04)" : "transparent" }}>
                    <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{item.q}</span>
                      <span style={{ color: OR, fontSize: 20, flexShrink: 0,
                        transform: openFaq === i ? "rotate(45deg)" : "none",
                        transition: "transform 0.2s", display: "inline-block" }}>+</span>
                    </button>
                    {openFaq === i && <div className="faq-ans">{item.a}</div>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, padding: "24px 28px", background: SURF,
                border: "1px solid " + BDR, borderRadius: 16, display: "flex",
                alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>Still have a question?</div>
                  <div style={{ color: MU, fontSize: 14 }}>We reply on WhatsApp within 1 hour during business hours.</div>
                </div>
                <a href="https://wa.me/37369765298" className="cta" style={{ flexShrink: 0 }}>
                  Message Us
                </a>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- TERMS ---- */}
            <Sec id="terms">
              <span className="section-tag">Legal</span>
              <h2 className="h2">Terms and<br />
                <span style={{ color: OR }}>Conditions</span>
              </h2>
              <p style={s.lead}>
                The important stuff, written in plain English. By booking with us you agree to these terms.
              </p>

              {[
                { title: "Booking and Reservations",
                  body: "Reservations must be made in advance through our website or by direct contact. A deposit may be required. Full payment must be completed before the start of the rental or tour. We accept credit card, bank transfer, and online payment." },
                { title: "Cancellations and Refunds",
                  body: "More than 14 days before the tour: full refund of deposit. 7-14 days: 50% refund. Under 7 days: no refund. In case of force majeure we will offer a full rebooking at no extra cost." },
                { title: "Rider Responsibility",
                  body: "You are responsible for respecting local traffic laws, riding safely and sober, and returning the motorcycle in the same condition. Any damage caused by negligence or reckless riding will be charged to the renter at full repair cost." },
                { title: "Liability",
                  body: "Participants acknowledge that motorcycle riding carries inherent risks and agree to participate at their own responsibility. Moldova Moto Tours cannot be held liable for accidents resulting from rider negligence or violation of traffic laws." },
                { title: "Insurance",
                  body: "All rentals include mandatory third-party insurance as required by Moldovan law. Comprehensive coverage is the rider's responsibility unless an upgrade is purchased. We strongly recommend personal travel insurance covering motorcycle activities." },
              ].map(({ title, body }) => (
                <div key={title} style={{ marginBottom: 16, padding: "20px 24px",
                  background: SURF, border: "1px solid " + BDR, borderRadius: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: WH,
                    marginBottom: 8 }}>{title}</div>
                  <p style={{ color: MU, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{body}</p>
                </div>
              ))}

              <div style={{ marginTop: 12, padding: "14px 18px",
                background: "rgba(255,107,0,0.06)",
                border: "1px solid rgba(255,107,0,0.15)", borderRadius: 10,
                fontSize: 12, color: "#888", lineHeight: 1.7 }}>
                Last updated: April 2026. For full legal document contact{" "}
                <a href="mailto:eugeniutaralunga@gmail.com" style={{ color: OR }}>
                  eugeniutaralunga@gmail.com
                </a>.
              </div>
            </Sec>

            {/* ---- Final CTA ---- */}
            <div style={{ marginTop: 60, padding: "48px 40px",
              background: "linear-gradient(135deg, #ff6b00, #cc4400)",
              borderRadius: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>
                Ready to Ride Moldova?
              </div>
              <p style={{ color: "rgba(255,255,255,0.85)", margin: "0 0 28px",
                fontSize: 16, lineHeight: 1.7 }}>
                Limited spots available. Book early to secure your place on the road less travelled.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/" style={{ background: "#fff", color: OR, borderRadius: 12,
                  padding: "14px 32px", fontSize: 15, fontWeight: 800,
                  textDecoration: "none" }}>
                  Book Your Tour
                </Link>
                <a href="https://wa.me/37369765298"
                  style={{ background: "rgba(0,0,0,0.2)", color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12,
                    padding: "14px 28px", fontSize: 15, fontWeight: 700,
                    textDecoration: "none" }}>
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
