import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ETI Moto Tours",
    "legalName": "MotoTour SRL",
    "url": "https://moldovamoto.com/de",
    "logo": "https://moldovamoto.com/logo.png",
    "description": "Geführte Motorradtouren in Moldawien auf CFMOTO 800MT. Deutschsprachige Guides, Kleingruppen, leere Landstraßen.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Chișinău",
      "addressCountry": "MD"
    },
    "areaServed": { "@type": "Country", "name": "Moldova" }
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Motorradtouren Moldawien",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "1-Tages-Weintour",
        "url": "https://moldovamoto.com/tours/1-day-wine-ride" },
      { "@type": "ListItem", "position": 2, "name": "3-Tages-Moldawien-Abenteuer",
        "url": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "5-Tages-Grand-Tour",
        "url": "https://moldovamoto.com/#tours" }
    ]
  }
];

export default function HomeDe() {
  return (
    <PageShell locale="de">
      <SeoHead
        title="Motorradreisen Moldawien — Geführte Touren auf CFMOTO 800MT | ETI Moto Tours"
        description="Geführte Motorradtouren durch Moldawien: leere Landstraßen, Weingüter, Höhlenklöster. Deutschsprachige Guides, CFMOTO 800MT, Kleingruppen. Ab €220."
        canonical="https://moldovamoto.com/de"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        locale="de_DE"
        hreflang={[
          { lang: "en", href: "https://moldovamoto.com/" },
          { lang: "de", href: "https://moldovamoto.com/de" },
          { lang: "x-default", href: "https://moldovamoto.com/" }
        ]}
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>Geführte Motorradtouren</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 14px" }}>
          Motorradreisen durch Moldawien — Osteuropas gut gehütetes Geheimnis
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          Leere Landstraßen, jahrhundertealte Höhlenklöster, die größten Weinkeller der Welt —
          alles an einem Wochenende erreichbar. Deutschsprachige Guides, moderne CFMOTO 800MT,
          Kleingruppen von maximal sechs Fahrern.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "24px 0 8px" }}>
          <Link to="/tours/1-day-wine-ride?lang=de" style={{ background: ORANGE, color: "#fff", padding: "14px 22px", borderRadius: 10, fontWeight: 800 }}>
            1-Tages-Weintour ansehen →
          </Link>
          <a href="#tours" style={{ background: "transparent", color: WHITE, padding: "14px 22px", borderRadius: 10, fontWeight: 800, border: `1px solid ${BORDER}` }}>
            Alle Touren
          </a>
        </div>

        <h2>Warum Moldawien mit dem Motorrad</h2>
        <p>Wer die Alpen, die Pyrenäen oder Rumäniens Transfăgărășan schon abgefahren hat, kennt das Problem: Verkehr. Moldawien hat 3,4 Millionen Einwohner auf einer Fläche Belgiens — außerhalb von Chișinău fährst du 40 km, ohne ein anderes Fahrzeug zu sehen. Keine Touristenströme, keine Kolonnen, keine Mautstationen. Dafür Weingüter mit Kellern so groß wie Kleinstädte, Höhlenklöster im Kalksteinkanyon, und Straßen, die sich durch Dörfer winden, in denen die Zeit stehengeblieben ist.</p>

        <h2>Unsere Touren</h2>
        <h3 id="tours">1-Tages-Weintour — Cricova</h3>
        <p>Der Klassiker. 180 km durch Weinberge, Führung durch die Cricova-Kellerei (einer von nur zwei Weingütern weltweit, die man mit dem Fahrzeug befahren kann), Mittagessen bei einem Familienweingut. Einsteigerfreundlich. €220 all-inclusive. <Link to="/tours/1-day-wine-ride?lang=de">Details →</Link></p>

        <h3>3-Tages-Moldawien-Abenteuer — Orheiul Vechi + Nistru</h3>
        <p>Die kanonische Moldawien-Tour. Höhlenklöster im Kalksteinkanyon, serpentinenreiche Flussstraßen, Übernachtung in einem traditionellen Gasthaus. Mittelstufe. €650 all-inclusive.</p>

        <h3>5-Tages-Grand-Moldawien — von Nord nach Süd</h3>
        <p>Von der Festung Soroca an der ukrainischen Grenze bis zu den Purcari-Weinbergen im Süden. Inklusive 20 km Schotterpiste — für Fortgeschrittene. €1.050 all-inclusive.</p>

        <h3>Offene Miete — CFMOTO 800MT</h3>
        <p>€120/Tag mit Gepäcksystem. Optionales Routenbriefing (€80) mit GPX-Dateien für selbstgeführte Fahrer.</p>

        <h2>Die Maschine: CFMOTO 800MT Adventure</h2>
        <p>Wir haben uns für die CFMOTO 800MT entschieden, weil sie genau den Sweetspot für Moldawiens Mix aus Asphalt und Schotter trifft: 800 cm³ Reihenzweizylinder, 95 PS, ABS, abschaltbare Traktionskontrolle, Tempomat, Heizgriffe. 19"-Vorderrad für die Hartschotter-Abschnitte. Sitzhöhe 835 mm (niedrige Variante 815 mm verfügbar). Reichweite ca. 350 km. Bequem für 300-km-Tage ohne Hotel-Pause.</p>

        <h2>Was ist inklusive?</h2>
        <ul>
          <li>CFMOTO 800MT Adventure mit Seitenkoffern + Topcase</li>
          <li>Komplette Schutzausrüstung (Helm, Jacke, Hose, Handschuhe) — alle Größen</li>
          <li>Deutschsprachiger Guide + Gegensprechanlage</li>
          <li>Benzin, Versicherung (Haftpflicht + Vollkasko €750 SB), Mautgebühren</li>
          <li>Alle Eintritte (Cricova, Orheiul Vechi, Saharna, Soroca)</li>
          <li>Mittagessen täglich; Abendessen auf Mehrtagestouren</li>
          <li>Übernachtungen in Boutique-Gasthäusern auf Mehrtagestouren</li>
          <li>Flughafentransfer Chișinău (KIV) auf 3- und 5-Tages-Touren</li>
        </ul>

        <h2>Für wen ist das geeignet?</h2>
        <ul>
          <li><strong>Führerschein:</strong> Vollklasse A (A2 nach Absprache mit gedrosselter Maschine möglich).</li>
          <li><strong>Mindestalter:</strong> 21 Jahre mit mindestens 2 Jahren A-Erfahrung.</li>
          <li><strong>Erfahrung:</strong> Von Einsteiger (Weintour) bis fortgeschritten (Grand-Tour mit Schotterabschnitten).</li>
          <li><strong>Sprachen:</strong> Deutsch und Englisch fließend.</li>
          <li><strong>Sozius:</strong> Willkommen auf der Weintour und bei offener Miete.</li>
        </ul>

        <h2>Die Region: was dich erwartet</h2>
        <p>Moldawien liegt zwischen Rumänien und der Ukraine, ist EU-frei und visafrei für deutsche, österreichische und Schweizer Reisepässe (90 Tage). Amtssprache Rumänisch, weit verbreitet auch Russisch; in Hotels und auf unseren Routen sprechen alle Ansprechpartner genug Englisch. Währung ist der moldawische Leu (MDL) — in Chișinău zahlst du überall mit Karte, in den Dörfern brauchst du etwas Bargeld. 4G-Abdeckung auf europäischem Niveau.</p>

        <h2>Termine & Buchung</h2>
        <p>Wir fahren von Mitte April bis Mitte Oktober. Die 1-Tages-Weintour läuft jeden Samstag; Mehrtagestouren auf Anfrage oder über den Buchungskalender auf der <Link to="/">englischen Homepage</Link>. Anzahlung 30%, Restbetrag 14 Tage vor Abfahrt. Kostenlose Stornierung bis 30 Tage vorher.</p>

        <h2>Häufige Fragen</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Brauche ich einen internationalen Führerschein?</summary>
          <p style={{ marginTop: 8 }}>Nein, EU-Führerscheine werden in Moldawien anerkannt. Nur Fahrer aus Nicht-EU-Ländern (z.B. UK nach dem Brexit, USA, Schweiz streng genommen auch) brauchen zusätzlich einen Internationalen Führerschein.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Wie komme ich nach Chișinău?</summary>
          <p style={{ marginTop: 8 }}>Direktflüge ab Frankfurt, Wien, München und Berlin nach Chișinău (KIV). Flugzeit ca. 3 Stunden. Vom Flughafen sind es 25 Minuten mit dem Uber (€5) zu unserer Garage.</p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>Was, wenn es regnet?</summary>
          <p style={{ marginTop: 8 }}>Wir fahren bei leichtem Regen — die CFMOTO hat Heizgriffe, die Ausrüstung ist wasserdicht. Bei Gewitter pausieren wir in einem Café und passen den Tagesablauf an.</p>
        </details>
        <p style={{ marginTop: 12 }}>Mehr? <Link to="/faq?lang=de">Vollständige FAQ (Englisch)</Link> oder <a href="mailto:hello@moldovamoto.com">schreib uns auf Deutsch</a>.</p>

        <h2>Bereit für die Buchung?</h2>
        <p>Schreib uns eine kurze Nachricht mit Wunschtour und Zeitraum — wir antworten auf Deutsch innerhalb von 24 Stunden.</p>
        <Link to="/tours/1-day-wine-ride?lang=de" style={{ display: "inline-block", marginTop: 10, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          Weintour reservieren →
        </Link>
      </article>
    </PageShell>
  );
}
