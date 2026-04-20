import { Link } from "react-router-dom";

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

export default function PageShell({ children, locale = "en", showBookCta = true }) {
  const t = (en, de) => (locale === "de" ? de : en);
  const home = locale === "de" ? "/de" : "/";

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
        @media (max-width: 640px) {
          .page-main { padding: 20px 18px 60px !important; }
        }
      `}</style>
      <header style={{ position: "sticky", top: 0, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${BORDER}`, zIndex: 20 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to={home} style={{ color: WHITE, fontWeight: 900, letterSpacing: "0.02em", fontSize: 17 }}>
            Moldova<span style={{ color: ORANGE }}>Moto</span>
          </Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 14 }}>
            <Link to={home}>{t("Home", "Start")}</Link>
            <Link to="/adventures">{t("Adventures", "Galerie")}</Link>
            <Link to="/faq">FAQ</Link>
            {showBookCta && (
              <Link to={home + (locale === "de" ? "" : "#tours")}
                    style={{ background: ORANGE, color: "#fff", padding: "6px 14px", borderRadius: 8, fontWeight: 800 }}>
                {t("Book a tour", "Tour buchen")}
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="page-main" style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        {children}
      </main>
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "28px 24px", textAlign: "center", color: MUTED, fontSize: 13 }}>
        © {new Date().getFullYear()} MoldovaMoto · {t("Guided motorcycle tours in Moldova", "Geführte Motorradtouren in Moldawien")}
      </footer>
    </div>
  );
}
