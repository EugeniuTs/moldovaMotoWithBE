import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { loadDB, STORAGE_KEY } from "../store.js";

/* ── tokens ── */
const ORANGE = "#ff6b00";
const DARK   = "#0a0a0b";
const CARD   = "#111113";
const BORDER = "#1e1e24";
const WHITE  = "#f0f0f4";
const MUTED  = "#72727a";
const SURFACE = "#16161a";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;900&family=Lora:ital@1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Archivo', sans-serif; background: ${DARK}; color: ${WHITE}; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${DARK}; }
  ::-webkit-scrollbar-thumb { background: ${ORANGE}; border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.93); } to { opacity:1; transform:scale(1); } }
  .gallery-item { cursor: pointer; position: relative; overflow: hidden; border-radius: 14px;
    break-inside: avoid; margin-bottom: 16px; }
  .gallery-item img { width: 100%; display: block; transition: transform 0.45s ease; }
  .gallery-item:hover img { transform: scale(1.04); }
  .gallery-item .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%);
    opacity: 0; transition: opacity 0.3s; display: flex; align-items: flex-end; padding: 18px; }
  .gallery-item:hover .overlay { opacity: 1; }
  .gallery-item.video-item::before { content: '▶'; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%); font-size: 42px; color: #fff; z-index: 2;
    text-shadow: 0 2px 16px rgba(0,0,0,0.7); pointer-events: none; }
  .gallery-item.featured::after { content: '★'; position: absolute; top: 12px; right: 12px;
    background: ${ORANGE}; color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 6px;
    font-family: 'Archivo'; font-weight: 800; letter-spacing: 0.06em; z-index: 3; }
  .filter-pill { border-radius: 24px; padding: 6px 18px; border: 1.5px solid ${BORDER};
    font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    font-family: 'Archivo'; letter-spacing: 0.04em; }
  .filter-pill:hover { border-color: ${ORANGE}; color: ${WHITE}; }
  .nav-link-g { position: relative; color: #ccc; text-decoration: none; font-size: 14px;
    font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s; }
  .nav-link-g::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0;
    height: 2px; background: ${ORANGE}; transition: width 0.25s; }
  .nav-link-g:hover { color: #fff; }
  .nav-link-g:hover::after { width: 100%; }
  @media (max-width: 768px) {
    .gallery-nav-links { display: none !important; }
    .masonry { column-count: 2 !important; }
  }
  @media (max-width: 480px) {
    .masonry { column-count: 1 !important; }
  }
`;

/* ── helpers ── */
function isYouTube(src) { return /youtu/.test(src || ""); }
function ytEmbed(src) {
  const m = (src||"").match(/(?:v=|youtu\.be\/)([\w-]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : src;
}

/* ── Lightbox ── */
function Lightbox({ item, items, onClose, onNav }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft")  onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav]);

  const idx = items.findIndex(i => i.id === item.id);
  const isVideo = item.type === "video";
  const isYT    = isYouTube(item.src);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.93)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, animation: "fadeIn 0.2s ease" }}>

      {/* Prev */}
      {idx > 0 && (
        <button onClick={() => onNav(-1)}
          style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.08)", border: "none", color: WHITE, fontSize: 28,
            width: 48, height: 48, borderRadius: "50%", cursor: "pointer", zIndex: 1 }}>‹</button>
      )}
      {/* Next */}
      {idx < items.length - 1 && (
        <button onClick={() => onNav(1)}
          style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.08)", border: "none", color: WHITE, fontSize: 28,
            width: 48, height: 48, borderRadius: "50%", cursor: "pointer", zIndex: 1 }}>›</button>
      )}

      {/* Close */}
      <button onClick={onClose}
        style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)",
          border: "none", color: WHITE, fontSize: 20, width: 40, height: 40,
          borderRadius: "50%", cursor: "pointer" }}>×</button>

      {/* Media */}
      <div style={{ maxWidth: 1100, width: "100%", animation: "scaleIn 0.2s ease" }}>
        {isVideo ? (
          isYT ? (
            <iframe src={ytEmbed(item.src)} width="100%" style={{ aspectRatio: "16/9", borderRadius: 14, border: "none" }}
              allow="autoplay; fullscreen" allowFullScreen title={item.title} />
          ) : (
            <video src={item.src} controls autoPlay
              style={{ width: "100%", borderRadius: 14, maxHeight: "78vh", objectFit: "contain" }} />
          )
        ) : (
          <img src={item.src} alt={item.title}
            style={{ width: "100%", maxHeight: "78vh", objectFit: "contain", borderRadius: 14, display: "block" }} />
        )}

        {/* Caption bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "16px 4px 0", gap: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: WHITE }}>{item.title}</div>
            {item.caption && (
              <div style={{ fontSize: 13, color: MUTED, marginTop: 4, lineHeight: 1.55,
                fontFamily: "Lora, serif", fontStyle: "italic" }}>{item.caption}</div>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {item.tour && (
              <div style={{ fontSize: 11, background: "rgba(255,107,0,0.15)", color: ORANGE,
                border: "1px solid rgba(255,107,0,0.3)", borderRadius: 6,
                padding: "3px 10px", fontWeight: 700, marginBottom: 4 }}>{item.tour}</div>
            )}
            <div style={{ fontSize: 11, color: MUTED }}>{item.date}</div>
          </div>
        </div>
        {/* Counter */}
        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: MUTED }}>
          {idx + 1} / {items.length}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function Adventures() {
  const [items, setItems]       = useState([]);
  const [tours, setTours]       = useState([]);
  const [filter, setFilter]     = useState("all");
  const [typeFilter, setType]   = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const load = useCallback(() => {
    const db = loadDB();
    setItems(db.gallery || []);
    setTours((db.routes || []).map(r => r.name));
  }, []);

  useEffect(() => {
    load();
    const onStorage = e => { if (e.key === STORAGE_KEY) load(); };
    window.addEventListener("storage", onStorage);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("scroll", onScroll);
    };
  }, [load]);

  const filtered = items.filter(i => {
    const tourOk = filter === "all" || i.tour === filter;
    const typeOk = typeFilter === "all" || i.type === typeFilter;
    return tourOk && typeOk;
  });

  const lightboxItems = filtered;
  const lbIdx = lightboxItems.findIndex(i => i.id === lightbox?.id);

  const nav = useCallback((dir) => {
    const next = lightboxItems[lbIdx + dir];
    if (next) setLightbox(next);
  }, [lightboxItems, lbIdx]);

  const imgCount   = items.filter(i => i.type === "image").length;
  const videoCount = items.filter(i => i.type === "video").length;
  const featCount  = items.filter(i => i.featured).length;

  return (
    <div style={{ background: DARK, color: WHITE, minHeight: "100vh" }}>
      <style>{css}</style>

      {/* ── Sticky nav ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(10,10,11,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        transition: "all 0.3s", padding: "0 5%"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex",
          alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff",
              padding: 2, boxShadow: `0 0 0 2px ${ORANGE}`, flexShrink: 0 }}>
              <img src="/logo.png" alt="MMT"
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 16, color: WHITE,
              letterSpacing: "-0.02em" }}>Moldova Moto<span style={{ color: ORANGE }}> Tours</span></span>
          </Link>
          <div className="gallery-nav-links" style={{ display: "flex", gap: 32 }}>
            {[["/#tours","Tours"],["/#experience","Experience"],["/#fleet","Fleet"],["/#map","Routes"]].map(([h,l])=>(
              <a key={h} href={h} className="nav-link-g">{l}</a>
            ))}
            <Link to="/adventures" className="nav-link-g" style={{ color: ORANGE }}>Adventures</Link>
          </div>
          <Link to="/#tours">
            <button style={{ background: ORANGE, color: "#fff", border: "none", borderRadius: 10,
              padding: "9px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Book Tour
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero banner ── */}
      <div style={{ paddingTop: 66, background: SURFACE,
        borderBottom: `1px solid ${BORDER}`, marginBottom: 0 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 5% 40px" }}>
          <div style={{ fontSize: 11, color: ORANGE, fontWeight: 800, letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: 12 }}>Visual Diary</div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 900,
            letterSpacing: "-0.03em", lineHeight: 1.02, marginBottom: 16 }}>
            Adventures<br /><span style={{ color: ORANGE }}>in the Wild</span>
          </h1>
          <p style={{ fontSize: 17, color: MUTED, maxWidth: 560, lineHeight: 1.7, marginBottom: 36 }}>
            Photos and videos from real rides — the roads, the ruins, the riders,
            and every unforgettable moment in between.
          </p>
          {/* Stats */}
          <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
            {[[imgCount,"Photos"],[videoCount,"Videos"],[featCount,"Featured"]].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 900, color: ORANGE, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 3, textTransform: "uppercase",
                  letterSpacing: "0.1em", fontWeight: 700 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ position: "sticky", top: 66, zIndex: 99, background: "rgba(10,10,11,0.95)",
        backdropFilter: "blur(10px)", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "14px 5%",
          display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {/* Type filter */}
          <div style={{ display: "flex", gap: 6, marginRight: 8 }}>
            {[["all","All"],["image","📷 Photos"],["video","🎬 Videos"]].map(([v,l])=>(
              <button key={v} className="filter-pill"
                onClick={() => setType(v)}
                style={{ background: typeFilter===v ? ORANGE : "transparent",
                  color: typeFilter===v ? "#fff" : MUTED,
                  borderColor: typeFilter===v ? ORANGE : BORDER }}>
                {l}
              </button>
            ))}
          </div>
          {/* Divider */}
          <div style={{ width: 1, height: 22, background: BORDER, marginRight: 8 }} />
          {/* Tour filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button className="filter-pill"
              onClick={() => setFilter("all")}
              style={{ background: filter==="all" ? "rgba(255,107,0,0.15)" : "transparent",
                color: filter==="all" ? ORANGE : MUTED,
                borderColor: filter==="all" ? ORANGE : BORDER }}>
              All Tours
            </button>
            {tours.map(t => (
              <button key={t} className="filter-pill"
                onClick={() => setFilter(t)}
                style={{ background: filter===t ? "rgba(255,107,0,0.15)" : "transparent",
                  color: filter===t ? ORANGE : MUTED,
                  borderColor: filter===t ? ORANGE : BORDER }}>
                {t.replace(/-Day /,"d ").replace(" Moldova","").replace(" Grand","").replace(" Motorcycle Rental","Rental")}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: MUTED, flexShrink: 0 }}>
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ── Masonry grid ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 5% 80px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: MUTED }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🏍️</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No media yet</div>
          </div>
        ) : (
          <div className="masonry" style={{ columnCount: 3, columnGap: 16 }}>
            {filtered.map(item => (
              <div key={item.id}
                className={`gallery-item${item.type === "video" ? " video-item" : ""}${item.featured ? " featured" : ""}`}
                onClick={() => setLightbox(item)}
                style={{ animation: "fadeUp 0.5s ease both" }}>

                {item.type === "video" && !isYouTube(item.src) ? (
                  <video src={item.src} muted playsInline preload="metadata"
                    style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
                ) : item.type === "video" && isYouTube(item.src) ? (
                  <img
                    src={`https://img.youtube.com/vi/${(item.src.match(/(?:v=|youtu\.be\/)([\w-]+)/)||[])[1]}/hqdefault.jpg`}
                    alt={item.title} style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
                ) : (
                  <img src={item.src} alt={item.title} loading="lazy" />
                )}

                <div className="overlay">
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: WHITE, marginBottom: 3 }}>{item.title}</div>
                    {item.tour && (
                      <div style={{ fontSize: 11, color: "rgba(255,107,0,0.9)", fontWeight: 700 }}>{item.tour}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox item={lightbox} items={lightboxItems}
          onClose={() => setLightbox(null)} onNav={nav} />
      )}
    </div>
  );
}
