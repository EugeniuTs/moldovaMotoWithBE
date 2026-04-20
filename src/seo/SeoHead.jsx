import { useEffect } from "react";

/**
 * Lightweight per-route <head> manager — works without react-helmet so we
 * keep the dep graph small. Updates title + well-known meta/link tags and
 * injects JSON-LD script blocks. On unmount it removes anything it added
 * so back-navigation restores the previous page's tags cleanly.
 *
 * Note: Googlebot renders JS for SPAs but an initial-HTML prerender
 * (vite-plugin-ssr / vite-ssg) still wins for TTFP crawl signals. The
 * audit's strategic-investment item to add prerendering stands.
 */
export default function SeoHead({
  title,
  description,
  canonical,
  robots,            // e.g. "noindex,nofollow"
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  locale = "en_US",
  jsonLd,            // object or array of objects
  hreflang,          // [{ lang:"en", href:"..." }, ...]
}) {
  useEffect(() => {
    const created = []; // track nodes we created so we can remove on unmount
    const originalTitle = document.title;
    const originalMeta = new Map(); // name/property -> previous content

    const setMeta = (attr, key, content) => {
      if (content == null) return;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        created.push(el);
      } else if (!originalMeta.has(`${attr}:${key}`)) {
        originalMeta.set(`${attr}:${key}`, el.getAttribute("content"));
      }
      el.setAttribute("content", String(content));
    };

    const setLink = (rel, href, extra = {}) => {
      if (!href) return;
      const selector = `link[rel="${rel}"]` +
        (extra.hreflang ? `[hreflang="${extra.hreflang}"]` : "");
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        Object.entries(extra).forEach(([k, v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
        created.push(el);
      }
      el.setAttribute("href", href);
    };

    if (title) document.title = title;
    setMeta("name",     "description",     description);
    setMeta("name",     "robots",          robots);
    setMeta("property", "og:title",        ogTitle || title);
    setMeta("property", "og:description",  ogDescription || description);
    setMeta("property", "og:type",         ogType);
    setMeta("property", "og:locale",       locale);
    if (canonical) {
      setMeta("property", "og:url", canonical);
      setLink("canonical", canonical);
    }
    if (ogImage) {
      setMeta("property", "og:image",       ogImage);
      setMeta("name",     "twitter:image",  ogImage);
      setMeta("name",     "twitter:card",   "summary_large_image");
    }

    (hreflang || []).forEach(h => setLink("alternate", h.href, { hreflang: h.lang }));

    const jsonBlocks = [];
    const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
    schemas.forEach(schema => {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.dataset.seoHead = "1";
      s.textContent = JSON.stringify(schema);
      document.head.appendChild(s);
      jsonBlocks.push(s);
    });

    return () => {
      document.title = originalTitle;
      originalMeta.forEach((prev, key) => {
        const [attr, name] = key.split(":");
        const el = document.head.querySelector(`meta[${attr}="${name}"]`);
        if (el && prev != null) el.setAttribute("content", prev);
      });
      created.forEach(el => el.parentNode && el.parentNode.removeChild(el));
      jsonBlocks.forEach(el => el.parentNode && el.parentNode.removeChild(el));
    };
  }, [title, description, canonical, robots, ogTitle, ogDescription, ogImage, ogType, locale,
      JSON.stringify(jsonLd), JSON.stringify(hreflang)]);

  return null;
}
