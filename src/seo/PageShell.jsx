import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../i18n";

/**
 * Minimal chrome shared by SEO/content pages (FAQ, blog posts, tour pages,
 * German landing). Keeps the site's dark + orange palette without pulling
 * in all of Home.jsx's layout code.
 */
const ORANGE = "#ff6b00";
const DARK   = "#0a0a0a";
const WHITE  = "#f4f4f4";
const MUTED  = "rgba(244,244,244,0.6)";
const BORDER = "rgba(255,255,255,0.08)";

export const COLORS = { ORANGE, DARK, WHITE, MUTED, BORDER };

export default function PageShell({ children, locale: localeProp, showBookCta = true }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { lang, setLang } = useLang();
  // /de route is German-by-route; everywhere else reads ?lang=de from URL.
  const isDeRoute = pathname === "/de";
  const locale = localeProp ?? (isDeRoute ? "de" : lang);
  const t = (en, de) => (locale === "de" ? de : en);
  const home = locale === "de" ? "/de" : "/";
  // Preserve ?lang=de across inter-page navigation (except the /de route itself, which is German by path).
  const withLang = (path) => (locale === "de" && path !== "/de" ? `${path}${path.includes("?") ? "&" : "?"}lang=de` : path);

  const switchLang = (target) => {
    if (target === locale) return;
    if (isDeRoute && target === "en") { navigate("/"); return; }
    if (!isDeRoute && target === "de" && pathname === "/") { navigate("/de"); return; }
    if (!isDeRoute && target === "en" && lang === "de") { setLang("en"); return; }
    if (!isDeRoute && target === "de") { setLang("de"); return; }
  };

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: WHITE, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        body { margin: 0; }
        a { color: ${ORANGE}; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .page-prose h2 { margin: 48px 0 16px; font-size: clamp(22px, 3vw, 30px); font-weight: 900; letter-spacing: -0.015em; }
        .page-prose h3 { margin: 28px 0 10px; font-size: 18px; font-weight: 800; color: ${ORANGE}; }
        .page-prose p, .page-prose li { font-size: 16px; line-height: 1.7; color: rgba(244,244,244,0.85); }
        .page-prose ul, .page-prose ol { margin: 10px 0 10px 22px; }
        .page-prose li { margin-bottom: 6px; }
        .page-prose strong { color: ${WHITE}; }
        .page-prose blockquote { border-left: 3px solid ${ORANGE}; padding: 4px 16px; margin: 20px 0; color: ${MUTED}; font-style: italic; }
        .ps-nav-link { position: relative; color: #ccc; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.2s; }
        .ps-nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: ${ORANGE}; transition: width 0.25s; }
        .ps-nav-link:hover { color: #fff; text-decoration: none; }
        .ps-nav-link:hover::after { width: 100%; }
        @media (max-width: 768px) {
          .ps-nav-links { display: none !important; }
          .ps-book-btn { padding: 8px 14px !important; font-size: 12px !important; }
        }
        @media (max-width: 640px) {
          .page-main { padding: 20px 18px 60px !important; }
        }
      `}</style>
      <header style={{ position: "sticky", top: 0, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${BORDER}`, zIndex: 20 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 5%", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to={home} style={{ textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden",
              boxShadow: `0 0 0 2px ${ORANGE}, 0 0 16px rgba(255,107,0,0.45)` }}>
              <img src="/logo.png" alt="ETI Moto Tours"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
          </Link>
          <div className="ps-nav-links" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <Link to={home} className="ps-nav-link">{t("Home", "Start")}</Link>
            <Link to={withLang("/adventures")} className="ps-nav-link" style={{ color: ORANGE }}>{t("Adventures", "Galerie")}</Link>
            <Link to={withLang("/faq")} className="ps-nav-link">FAQ</Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {["en", "de"].map((l) => {
                const active = locale === l;
                const style = {
                  background: active ? "rgba(255,107,0,0.15)" : "transparent",
                  border: active ? "1px solid rgba(255,107,0,0.5)" : "1px solid rgba(255,255,255,0.18)",
                  borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 700,
                  color: active ? ORANGE : "#bbb",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  textDecoration: "none", cursor: active ? "default" : "pointer",
                  fontFamily: "inherit"
                };
                return (
                  <button key={l} onClick={() => switchLang(l)}
                    disabled={active} aria-current={active ? "true" : undefined}
                    style={style}>
                    {l}
                  </button>
                );
              })}
            </div>
            {showBookCta && (
              <Link to={home + (locale === "de" ? "" : "#tours")} className="ps-book-btn" style={{
                background: ORANGE, color: "#fff", borderRadius: 10,
                padding: "10px 20px", fontWeight: 800, fontSize: 13,
                letterSpacing: "0.04em", textTransform: "uppercase"
              }}>
                {t("Book a tour", "Tour buchen")}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="page-main" style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        {children}
      </main>
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "28px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>
        © {new Date().getFullYear()} ETI Moto Tours · {t("Guided motorcycle tours in Moldova", "Geführte Motorradtouren in Moldawien")}
      </footer>
    </div>
  );
}
