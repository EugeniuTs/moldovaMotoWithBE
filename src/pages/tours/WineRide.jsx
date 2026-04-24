import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";
import { useLang } from "../../i18n";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "1-Day Wine Ride — Cricova Cellars by Motorcycle",
    "description": "A one-day guided motorcycle tour from Chișinău through Moldova's vineyards into the Cricova underground wine cellars, with lunch at a family winery.",
    "touristType": ["Motorcycling enthusiasts", "Wine enthusiasts", "Adventure travellers"],
    "image": "https://moldovamoto.com/og-cover.jpg",
    "url": "https://moldovamoto.com/tours/1-day-wine-ride",
    "provider": {
      "@type": "Organization",
      "name": "ETI Moto Tours",
      "url": "https://moldovamoto.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "220",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://moldovamoto.com/tours/1-day-wine-ride",
      "validFrom": "2026-04-04"
    },
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Chișinău garage — briefing and bike assignment" },
        { "@type": "ListItem", "position": 2, "name": "Vineyard back roads (R-14 alternatives)" },
        { "@type": "ListItem", "position": 3, "name": "Cricova Wine Cellars — 120 km underground tour" },
        { "@type": "ListItem", "position": 4, "name": "Family winery lunch with tasting" },
        { "@type": "ListItem", "position": 5, "name": "Return via scenic Nistru viewpoint to Chișinău" }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "1-Day Wine Ride", "item": "https://moldovamoto.com/tours/1-day-wine-ride" }
    ]
  }
];

export default function WineRide() {
  const { lang } = useLang();
  const de = lang === "de";
  const t = (en, deText) => (de ? deText : en);

  return (
    <PageShell>
      <SeoHead
        title={t("1-Day Wine Ride — Moldova Motorcycle Tour | ETI Moto Tours",
                 "1-Tages-Weintour — Moldawien Motorradtour | ETI Moto Tours")}
        description={t("Ride from Chișinău into Moldova's vineyards, descend into the Cricova underground cellars and lunch at a family winery. CFMOTO 800MT included — €220.",
                       "Von Chișinău durch die Weinberge Moldawiens, hinab in die unterirdischen Cricova-Keller und Mittagessen bei einem Familienweingut. CFMOTO 800MT inklusive — €220.")}
        canonical="https://moldovamoto.com/tours/1-day-wine-ride"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {t("1-Day Tour · Easy", "1-Tages-Tour · Einsteiger")}
        </div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
          {t("1-Day Wine Ride: Cricova Cellars by Motorcycle",
             "1-Tages-Weintour: Cricova-Keller mit dem Motorrad")}
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          {t("A single unforgettable day — vineyard back roads out of Chișinău, the legendary Cricova underground cellars, and a long lunch at a family winery you could never find alone.",
             "Ein unvergesslicher Tag — Weinberg-Nebenstraßen aus Chișinău hinaus, die legendären unterirdischen Cricova-Keller und ein langes Mittagessen bei einem Familienweingut, das man alleine nie finden würde.")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "28px 0", padding: "18px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[
            [t("Price", "Preis"),            "€220"],
            [t("Duration", "Dauer"),         t("~9 hours", "~9 Stunden")],
            [t("Distance", "Distanz"),       "180 km"],
            [t("Difficulty", "Schwierigkeit"), t("Easy", "Einsteiger")],
            [t("Group size", "Gruppengröße"), t("Max 6", "Max. 6")],
            [t("Bike", "Maschine"),          "CFMOTO 800MT"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        <h2>{t("What's included", "Was ist inklusive")}</h2>
        <ul>
          <li>{t("CFMOTO 800MT Adventure with ABS, traction control, heated grips",
                 "CFMOTO 800MT Adventure mit ABS, Traktionskontrolle und Heizgriffen")}</li>
          <li>{t("Full riding gear (helmet, jacket, trousers, gloves) — any size",
                 "Komplette Schutzausrüstung (Helm, Jacke, Hose, Handschuhe) — alle Größen")}</li>
          <li>{t("Experienced local guide (EN/DE) and intercom",
                 "Erfahrener lokaler Guide (EN/DE) und Gegensprechanlage")}</li>
          <li>{t("Fuel, insurance, tolls", "Benzin, Versicherung, Mautgebühren")}</li>
          <li>{t("Cricova Wine Cellars guided underground tour + tasting",
                 "Geführte Untertage-Tour durch die Cricova-Weinkeller mit Verkostung")}</li>
          <li>{t("Three-course lunch at a family winery with pairings",
                 "Drei-Gänge-Mittagessen bei einem Familienweingut mit passender Weinbegleitung")}</li>
          <li>{t("Bottle of local wine to take home", "Flasche lokalen Weins als Mitbringsel")}</li>
        </ul>

        <h2>{t("The route, hour by hour", "Die Route, Stunde für Stunde")}</h2>
        <h3>{t("08:30 — Chișinău garage", "08:30 — Garage in Chișinău")}</h3>
        <p>{t("Coffee, paperwork, a 45-minute safety briefing and we match you to a bike. First-time on a CFMOTO? 20 minutes on the lot until you're comfortable.",
              "Kaffee, Papierkram, 45-minütiges Sicherheitsbriefing und wir teilen dir deine Maschine zu. Zum ersten Mal auf einer CFMOTO? 20 Minuten auf dem Hof, bis du dich wohlfühlst.")}</p>
        <h3>{t("09:30 — Out of the city on the back roads", "09:30 — Auf Nebenstraßen aus der Stadt")}</h3>
        <p>{t("We skip the R-14 and take a series of vineyard lanes north-west. Empty tarmac, 60–80 km/h, low-traffic sweepers through 20 km of continuous vines.",
              "Wir umgehen die R-14 und nehmen Weinberg-Nebenstraßen nach Nordwesten. Leerer Asphalt, 60–80 km/h, verkehrsarme Kurven durch 20 km durchgehende Weinberge.")}</p>
        <h3>{t("11:00 — Cricova Wine Cellars", "11:00 — Cricova-Weinkeller")}</h3>
        <p>{t("One of only two wineries in the world large enough to drive through. Our tour goes 80 metres underground into 120 km of tunnels at a constant 12°C. You'll walk, not ride, the cellars — bikes are parked upstairs.",
              "Eines von nur zwei Weingütern weltweit, die man mit dem Fahrzeug befahren kann. Unsere Tour führt 80 Meter unter die Erde in 120 km Tunnel bei konstant 12°C. Durch die Keller wird gelaufen, nicht gefahren — die Maschinen bleiben oben.")}</p>
        <h3>{t("13:00 — Family winery lunch", "13:00 — Mittagessen bei einem Familienweingut")}</h3>
        <p>{t("A 30-minute ride south to a small estate most guidebooks miss. Three courses paired with their own Fetească Neagră and a Rara Neagră rosé. Plan for a long lunch — you're not in a rush.",
              "30 Minuten Fahrt nach Süden zu einem kleinen Weingut, das die meisten Reiseführer übersehen. Drei Gänge begleitet von hauseigener Fetească Neagră und einem Rara-Neagră-Rosé. Plane ein langes Mittagessen ein — hier hetzt niemand.")}</p>
        <h3>{t("15:30 — Return via the Nistru viewpoint", "15:30 — Rückfahrt über den Nistru-Aussichtspunkt")}</h3>
        <p>{t("A scenic detour along the river before looping back into Chișinău. Arrive at the garage around 17:30, bikes returned, group photo, beer on us.",
              "Ein landschaftlicher Umweg am Fluss entlang, bevor wir nach Chișinău zurückkehren. Ankunft in der Garage gegen 17:30, Rückgabe der Maschinen, Gruppenfoto, Bier geht auf uns.")}</p>

        <h2>{t("About Cricova — why the cellars matter", "Über Cricova — warum die Keller etwas Besonderes sind")}</h2>
        <p>{t("Cricova's cellars were carved out of limestone over two centuries of quarrying. The temperature inside never varies, which is why the winery stores 1.3 million bottles here, including private cellars belonging to heads of state, cosmonauts, and a long list of public figures you'll recognise from the plaques. You don't have to be a wine person for this to feel special; it's closer to catacombs than a cellar door.",
              "Die Cricova-Keller wurden über zwei Jahrhunderte aus Kalkstein herausgebrochen. Die Temperatur bleibt konstant, weshalb das Weingut hier 1,3 Millionen Flaschen lagert — darunter private Keller von Staatsoberhäuptern, Kosmonauten und einer langen Liste von Persönlichkeiten, die du auf den Schildern wiedererkennst. Man muss kein Weinkenner sein, damit sich das besonders anfühlt; es erinnert eher an Katakomben als an einen Weinkeller.")}</p>

        <h2>{t("The motorcycle", "Die Maschine")}</h2>
        <p>{t("The CFMOTO 800MT is a touring-class adventure bike — 95 hp, 800 cc parallel-twin, upright ergonomics, ABS with an off-road mode, traction control, cruise control, and heated grips. At 835 mm it's manageable for riders 5'7\" and up; we carry a low-seat option too. Panniers + top box come standard.",
              "Die CFMOTO 800MT ist eine Adventure-Touring-Maschine — 95 PS, 800 cm³ Reihenzweizylinder, aufrechte Sitzposition, ABS mit Offroad-Modus, Traktionskontrolle, Tempomat und Heizgriffe. Mit 835 mm Sitzhöhe beherrschbar ab ca. 1,70 m; eine niedrige Sitzbank steht ebenfalls bereit. Seitenkoffer + Topcase serienmäßig.")}</p>

        <h2>{t("Who it's for", "Für wen ist das geeignet")}</h2>
        <ul>
          <li><strong>{t("Riding experience:", "Fahrerfahrung:")}</strong> {t("Beginners welcome. Flat tarmac, moderate pace.",
                                                                              "Einsteiger willkommen. Ebener Asphalt, moderates Tempo.")}</li>
          <li><strong>{t("License:", "Führerschein:")}</strong> {t("Full category A (or A2 with a restricted bike — ask us). IDP required for non-EU licenses.",
                                                                    "Vollklasse A (oder A2 mit gedrosselter Maschine — frag nach). Internationaler Führerschein für Nicht-EU-Fahrer erforderlich.")}</li>
          <li><strong>{t("Minimum age:", "Mindestalter:")}</strong> {t("21 with 2+ years of A-category riding.",
                                                                        "21 Jahre mit mindestens 2 Jahren A-Erfahrung.")}</li>
          <li><strong>{t("Languages:", "Sprachen:")}</strong> {t("Guide speaks fluent English and German.",
                                                                  "Guide spricht fließend Englisch und Deutsch.")}</li>
          <li><strong>{t("Pillion passengers:", "Sozius:")}</strong> {t("Welcome with full gear and a helmet.",
                                                                         "Willkommen mit vollständiger Ausrüstung und Helm.")}</li>
        </ul>

        <h2>{t("Departure dates", "Termine")}</h2>
        <p>{t("We run the Wine Ride every Saturday from 4 April through the end of October. Mid-week private departures available for groups of 3+ on request.",
              "Die Weintour läuft jeden Samstag vom 4. April bis Ende Oktober. Private Termine unter der Woche auf Anfrage ab 3 Fahrern.")}</p>
        <Link to="/#tours" style={{ display: "inline-block", marginTop: 14, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          {t("Reserve your date →", "Termin reservieren →")}
        </Link>

        <h2>{t("Frequently asked", "Häufige Fragen")}</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("What if I've never ridden in Europe before?",
               "Was, wenn ich noch nie in Europa gefahren bin?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("Perfect — this tour is designed for that. Moldova drives on the right, signage is clear, and our guide sets a pace you're comfortable with.",
               "Perfekt — die Tour ist genau dafür gemacht. In Moldawien gilt Rechtsverkehr, die Beschilderung ist klar, und unser Guide passt das Tempo an dich an.")}
          </p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("Can I drink at lunch?", "Darf ich zum Mittagessen Wein trinken?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("The tastings are small pours — about 30 ml each, similar to any guided wine tour. If you'd rather skip the wine entirely, we'll arrange alcohol-free pairings.",
               "Die Verkostungen sind kleine Schlucke — ca. 30 ml pro Glas, wie bei jeder geführten Weinprobe. Wer auf Wein verzichten möchte, bekommt eine alkoholfreie Begleitung.")}
          </p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("What if it rains?", "Was, wenn es regnet?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("We ride unless it's unsafe. Our gear is waterproof and the CFMOTO has heated grips. If storms hit, we'll wait them out with an extra wine at Cricova — no one will complain.",
               "Wir fahren, solange es sicher ist. Unsere Ausrüstung ist wasserdicht und die CFMOTO hat Heizgriffe. Bei Gewitter warten wir bei einem zusätzlichen Glas Wein in Cricova — niemand beschwert sich.")}
          </p>
        </details>
        <p style={{ marginTop: 12 }}>
          {t("More questions? ", "Mehr Fragen? ")}
          <Link to={de ? "/faq?lang=de" : "/faq"}>{t("See the full FAQ", "Zur vollständigen FAQ")}</Link>.
        </p>

        <h2>{t("Related reading", "Weiterlesen")}</h2>
        <ul>
          <li><Link to={de ? "/blog/moldova-motorcycle-tour-guide?lang=de" : "/blog/moldova-motorcycle-tour-guide"}>
            {t("The complete guide to motorcycle touring in Moldova",
               "Der komplette Leitfaden für Motorradtouren in Moldawien")}
          </Link></li>
          <li><Link to={de ? "/blog/orheiul-vechi-motorcycle-guide?lang=de" : "/blog/orheiul-vechi-motorcycle-guide"}>
            {t("Orheiul Vechi by motorcycle — route guide",
               "Orheiul Vechi mit dem Motorrad — Routenführer")}
          </Link></li>
          <li><Link to={de ? "/adventures?lang=de" : "/adventures"}>
            {t("Photos from past Wine Ride departures",
               "Fotos vergangener Weintour-Termine")}
          </Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
