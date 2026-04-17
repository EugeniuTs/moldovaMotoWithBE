import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLang, setLang } from "../i18n.js";

const OR = "#ff6b00";
const BG = "#0a0a0b";
const CARD = "#111113";
const SURF = "#16161a";
const BDR = "#252525";
const WH = "#f0f0f4";
const MU = "#72727a";
const DIM = "#44444c";

const NAV = [
  { id: "about",  labelKey: "info.nav.about" },
  { id: "fleet",  labelKey: "info.nav.fleet" },
  { id: "routes", labelKey: "info.nav.routes" },
  { id: "safety", labelKey: "info.nav.safety" },
  { id: "faq",    labelKey: "info.nav.faq" },
  { id: "terms",  labelKey: "info.nav.terms" },
];

const FAQS_EN = [
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
  const { lang, t } = useLang();
  const FAQS = Array.from({length:8},(_,i)=>({q:t("faq.q"+(i+1)),a:t("faq.a"+(i+1))}));

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
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            {["en","de"].map(l => (
              <button key={l} onClick={()=>setLang(l)}
                style={{background:lang===l?"rgba(255,107,0,0.15)":"transparent",
                  border:lang===l?"1px solid rgba(255,107,0,0.5)":"1px solid rgba(255,255,255,0.12)",
                  borderRadius:6,padding:"4px 9px",fontSize:11,fontWeight:700,
                  color:lang===l?OR:"#888",cursor:"pointer",fontFamily:"inherit",
                  textTransform:"uppercase",letterSpacing:"0.06em"}}>
                {l}
              </button>
            ))}
          </div>
          <div className="top-nav-links" style={{ display: "flex", gap: 20, overflow: "auto" }}>
            {NAV.map(n => (
              <a key={n.id} href={"#" + n.id} style={{
                fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                letterSpacing: "0.08em", textDecoration: "none", whiteSpace: "nowrap",
                color: active === n.id ? OR : MU, transition: "color 0.2s" }}>
                {t(n.labelKey)}
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
                  {t(n.labelKey)}
                </a>
              ))}
              <div style={{ marginTop: 32, padding: "18px 16px",
                background: "rgba(255,107,0,0.07)",
                border: "1px solid rgba(255,107,0,0.2)", borderRadius: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: OR, marginBottom: 8 }}>
                  {t("info.ready")}
                </div>
                <Link to="/" className="cta"
                  style={{ padding: "10px 16px", fontSize: 12, borderRadius: 8,
                    display: "block", textAlign: "center" }}>
                  {t("info.book")}
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* ---- ABOUT ---- */}
            <Sec id="about">
              <div style={{ paddingTop: 40 }}>
                <span className="section-tag">{t("info.about.tag")}</span>
                <h1 className="h2">{t("info.about.h1a")}<br />
                  <span style={{ color: OR }}>{t("info.about.h1b")}</span>
                </h1>
                <p style={s.lead}>{t("info.about.lead")}</p>

                {/* Stats */}
                <div style={{ display: "flex", gap: 40, flexWrap: "wrap", marginBottom: 48 }}>
                  {[["300+",t("info.stat.riders")],["4.9",t("info.stat.rating")],["6",t("info.stat.stops")],["100%",t("info.stat.guides")]].map(([n, l]) => (
                    <div key={l}>
                      <div style={{ fontSize: 36, fontWeight: 900, color: OR, lineHeight: 1 }}>{n}</div>
                      <div style={{ fontSize: 11, color: MU, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>

                <div className="g2" style={{ marginBottom: 32 }}>
                  <div className="card">
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{t("info.about.do.icon")}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{t("info.about.do.title")}</div>
                    <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{t("info.about.do.body")}</p>
                  </div>
                  <div className="card">
                    <div style={{ fontSize: 22, marginBottom: 10 }}>{t("info.about.mission.icon")}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{t("info.about.mission.title")}</div>
                    <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{t("info.about.mission.body")}</p>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 32 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>{t("info.about.included")}</div>
                  <div>
                    {[0,1,2,3,4,5,6].map(i => (
                      <span key={i} className="pill">{t("info.incl."+i)}</span>
                    ))}
                  </div>
                </div>

                <div style={{ background: "rgba(255,107,0,0.08)",
                  border: "1px solid rgba(255,107,0,0.25)", borderRadius: 16, padding: "28px 32px" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{t("info.about.promise.title")}</div>
                  <p style={{ color: MU, lineHeight: 1.7, margin: "0 0 20px", fontSize: 15 }}>{t("info.about.promise.body")}</p>
                  <Link to="/" className="cta">{t("info.about.bookcta")}</Link>
                </div>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- FLEET ---- */}
            <Sec id="fleet">
              <span className="section-tag">{t("info.fleet.tag")}</span>
              <h2 className="h2">{t("info.fleet.h2a")}<br />
                <span style={{ color: OR }}>{t("info.fleet.h2b")}</span>
              </h2>
              <p style={s.lead}>{t("info.fleet.lead")}</p>

              <div className="g2" style={{ marginBottom: 24 }}>
                <div className="card">
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{t("info.fleet.specs")}</div>
                  <Checks items={[0,1,2,3,4].map(i => t("info.fleet.spec."+i))} />
                </div>
                <div className="card">
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>{t("info.fleet.incl")}</div>
                  <Checks items={[0,1,2,3,4,5,6].map(i => t("info.fleet.incl."+i))} />
                </div>
              </div>

              <div className="card" style={{ background: "rgba(255,107,0,0.04)",
                border: "1px solid rgba(255,107,0,0.15)" }}>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: OR, marginBottom: 6,
                      textTransform: "uppercase", letterSpacing: "0.08em" }}>{t("info.fleet.maint.title")}</div>
                    <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{t("info.fleet.maint.body")}</p>
                  </div>
                  <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                    {[["3k km",t("info.fleet.maint.0.label")],["100%",t("info.fleet.maint.1.label")],["2hr",t("info.fleet.maint.2.label")]].map(([n,l]) => (
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
              <span className="section-tag">{t("info.routes.tag")}</span>
              <h2 className="h2">{t("info.routes.h2a")}<br />
                <span style={{ color: OR }}>{t("info.routes.h2b")}</span>
              </h2>
              <p style={s.lead}>{t("info.routes.lead")}</p>

              {[
                { name: t("info.route.0.name"), tag: t("info.route.0.tag"),
                  desc: t("info.route.0.desc"),
                  items: [0,1,2,3].map(i => t("info.route.0.i."+i)) },
                { name: t("info.route.1.name"), tag: t("info.route.1.tag"),
                  desc: t("info.route.1.desc"),
                  items: [0,1,2,3,4].map(i => t("info.route.1.i."+i)) },
                { name: t("info.route.2.name"), tag: t("info.route.2.tag"),
                  desc: t("info.route.2.desc"),
                  items: [0,1,2,3,4,5].map(i => t("info.route.2.i."+i)) },
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
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{t("info.routes.notsure")}</div>
                <p style={{ color: MU, margin: "0 0 20px", fontSize: 14 }}>{t("info.routes.notsure.sub")}</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="https://wa.me/37369765298" className="cta">{t("info.routes.wa")}</a>
                  <Link to="/" className="cta-ghost">{t("info.routes.book")}</Link>
                </div>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- SAFETY ---- */}
            <Sec id="safety">
              <span className="section-tag">{t("info.safety.tag")}</span>
              <h2 className="h2">{t("info.safety.h2a")}<br />
                <span style={{ color: OR }}>{t("info.safety.h2b")}</span>
              </h2>
              <p style={s.lead}>{t("info.safety.lead")}</p>

              <div className="g3" style={{ marginBottom: 24 }}>
                {[
                  { title: t("info.safety.t1"), items: [0,1,2,3].map(i => t("info.safety.lic."+i)) },
                  { title: t("info.safety.t2"), items: [0,1,2,3].map(i => t("info.safety.age."+i)) },
                  { title: t("info.safety.t3"), items: [0,1,2,3,4].map(i => t("info.safety.gear."+i)) },
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
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>{t("info.safety.breakdown")}</div>
                <div className="g2">
                  {[
                    { title: t("info.safety.guided"), desc: t("info.safety.guided.body") },
                    { title: t("info.safety.rental"), desc: t("info.safety.rental.body") },
                  ].map(({ title, desc }) => (
                    <div key={title}>
                      <div style={{ fontWeight: 700, color: OR, marginBottom: 6, fontSize: 13 }}>{title}</div>
                      <p style={{ color: MU, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>{t("info.safety.insurance")}</div>
                <p style={{ color: MU, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{t("info.safety.insurance.body")}</p>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- FAQ ---- */}
            <Sec id="faq">
              <span className="section-tag">{t("info.faq.tag")}</span>
              <h2 className="h2">{t("info.faq.h2a")}<br />
                <span style={{ color: OR }}>{t("info.faq.h2b")}</span>
              </h2>
              <p style={s.lead}>{t("info.faq.lead")}</p>

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
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{t("info.faq.still")}</div>
                  <div style={{ color: MU, fontSize: 14 }}>{t("info.faq.still.sub")}</div>
                </div>
                <a href="https://wa.me/37369765298" className="cta" style={{ flexShrink: 0 }}>
                  {t("info.faq.wa")}
                </a>
              </div>
            </Sec>

            <hr className="hr" />

            {/* ---- TERMS ---- */}
            <Sec id="terms">
              <span className="section-tag">{t("info.terms.tag")}</span>
              <h2 className="h2">{t("info.terms.h2a")}<br />
                <span style={{ color: OR }}>{t("info.terms.h2b")}</span>
              </h2>
              <p style={s.lead}>{t("info.terms.lead")}</p>

              {[
                { title: t("terms.booking.title"),   body: t("terms.booking.body") },
                { title: t("terms.cancel.title"),    body: t("terms.cancel.body") },
                { title: t("terms.rider.title"),     body: t("terms.rider.body") },
                { title: t("terms.liability.title"), body: t("terms.liability.body") },
                { title: t("terms.insurance.title"), body: t("terms.insurance.body") },
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
                {t("info.terms.updated")}{" "}
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
                {t("info.final.h")}
              </div>
              <p style={{ color: "rgba(255,255,255,0.85)", margin: "0 0 28px",
                fontSize: 16, lineHeight: 1.7 }}>
                {t("info.final.p")}
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/" style={{ background: "#fff", color: OR, borderRadius: 12,
                  padding: "14px 32px", fontSize: 15, fontWeight: 800,
                  textDecoration: "none" }}>
                  {t("info.final.book")}
                </Link>
                <a href="https://wa.me/37369765298"
                  style={{ background: "rgba(0,0,0,0.2)", color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 12,
                    padding: "14px 28px", fontSize: 15, fontWeight: 700,
                    textDecoration: "none" }}>
                  {t("info.final.wa")}
                </a>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
