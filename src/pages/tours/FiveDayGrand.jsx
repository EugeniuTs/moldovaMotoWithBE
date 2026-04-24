import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";
import { useLang } from "../../i18n";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "5-Day Grand Moldova Tour — Soroca, Nistru & Purcari by Motorcycle",
    "description": "A five-day guided motorcycle traverse of Moldova from the medieval fortress of Soroca on the Ukrainian border south to the vineyards of Purcari, including the Nistru canyon, Bender fortress and hardpack gravel connectors.",
    "touristType": ["Motorcycling enthusiasts", "Adventure travellers", "Wine enthusiasts"],
    "image": "https://moldovamoto.com/og-cover.jpg",
    "url": "https://moldovamoto.com/tours/5-day-grand-moldova",
    "provider": {
      "@type": "Organization",
      "name": "ETI Moto Tours",
      "url": "https://moldovamoto.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "1050",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://moldovamoto.com/tours/5-day-grand-moldova",
      "validFrom": "2026-04-04"
    },
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Day 1 — Chișinău to Orheiul Vechi and Butuceni" },
        { "@type": "ListItem", "position": 2, "name": "Day 2 — Saharna waterfalls and north to Soroca fortress" },
        { "@type": "ListItem", "position": 3, "name": "Day 3 — Soroca to the Nistru canyon and Rezina" },
        { "@type": "ListItem", "position": 4, "name": "Day 4 — South through Bender fortress to Purcari vineyards" },
        { "@type": "ListItem", "position": 5, "name": "Day 5 — Purcari to Chișinău via the Prut valley" }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "5-Day Grand Moldova Tour",
        "item": "https://moldovamoto.com/tours/5-day-grand-moldova" }
    ]
  }
];

export default function FiveDayGrand() {
  const { lang } = useLang();
  const de = lang === "de";
  const t = (en, deText) => (de ? deText : en);
  const q = de ? "?lang=de" : "";

  return (
    <PageShell>
      <SeoHead
        title={t("5-Day Grand Moldova Tour — Full Country by Motorcycle | ETI Moto Tours",
                 "5-Tages-Grand-Moldawien-Tour — Das ganze Land mit dem Motorrad | ETI Moto Tours")}
        description={t("North to south across Moldova on a CFMOTO 800MT: Soroca fortress, the Nistru canyon, Bender, Purcari vineyards. Five riding days, four nights, €1,050 all-in.",
                       "Von Nord nach Süd durch Moldawien auf der CFMOTO 800MT: Festung Soroca, Nistru-Kanyon, Bender, Purcari-Weinberge. Fünf Fahrtage, vier Nächte, €1.050 all-inclusive.")}
        canonical="https://moldovamoto.com/tours/5-day-grand-moldova"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {t("5-Day Tour · Advanced", "5-Tages-Tour · Fortgeschritten")}
        </div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
          {t("5-Day Grand Moldova Tour: North to South",
             "5-Tages-Grand-Moldawien-Tour: Von Nord nach Süd")}
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          {t("The full traverse. A medieval Genoese fortress on the Ukrainian border, 140 km of empty tarmac along the Nistru, a 20 km hardpack gravel connector, and a final night among the Purcari vineyards. If you've got a week in Europe and know how to ride, this is the trip.",
             "Die komplette Durchquerung. Eine mittelalterliche Genueser Festung an der ukrainischen Grenze, 140 km leerer Asphalt am Nistru, ein 20 km langer Hartschotter-Abschnitt und eine letzte Nacht bei den Purcari-Weinbergen. Wer eine Woche in Europa hat und Motorradfahren kann, ist hier richtig.")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "28px 0", padding: "18px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[
            [t("Price", "Preis"),             t("€1,050", "€1.050")],
            [t("Duration", "Dauer"),          t("5 days", "5 Tage")],
            [t("Distance", "Distanz"),        t("1,180 km", "1.180 km")],
            [t("Difficulty", "Schwierigkeit"), t("Advanced", "Fortgeschritten")],
            [t("Group size", "Gruppengröße"), t("Max 5", "Max. 5")],
            [t("Bike", "Maschine"),           "CFMOTO 800MT"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>

        <h2>{t("What's included", "Was ist inklusive")}</h2>
        <ul>
          <li>{t("CFMOTO 800MT Adventure with full luggage", "CFMOTO 800MT Adventure mit kompletter Gepäckanlage")}</li>
          <li>{t("Full riding gear (helmet, jacket, trousers, gloves) — any size",
                 "Komplette Schutzausrüstung (Helm, Jacke, Hose, Handschuhe) — alle Größen")}</li>
          <li>{t("Experienced local guide (EN/DE) and intercom",
                 "Erfahrener lokaler Guide (EN/DE) und Gegensprechanlage")}</li>
          <li>{t("Dedicated support van — luggage, tools, spare bike on standby",
                 "Eigenes Begleitfahrzeug — Gepäck, Werkzeug, Ersatzmaschine in Bereitschaft")}</li>
          <li>{t("Fuel, insurance, tolls, and all site entries",
                 "Benzin, Versicherung, Mautgebühren und alle Eintritte")}</li>
          <li>{t("Four nights in boutique guesthouses and one winery stay in Purcari",
                 "Vier Nächte in Boutique-Gasthäusern und eine Weingut-Übernachtung in Purcari")}</li>
          <li>{t("Breakfast, lunch, and dinner every day",
                 "Frühstück, Mittag- und Abendessen täglich")}</li>
          <li>{t("Cricova cellar tour + Purcari winery tasting",
                 "Cricova-Kellerführung + Purcari-Weinverkostung")}</li>
          <li>{t("Airport pickup and drop-off from Chișinău (KIV)",
                 "Flughafentransfer Chișinău (KIV) hin und zurück")}</li>
        </ul>

        <h2>{t("The itinerary", "Die Route")}</h2>
        <h3>{t("Day 1 — Chișinău → Orheiul Vechi → Butuceni (190 km)",
              "Tag 1 — Chișinău → Orheiul Vechi → Butuceni (190 km)")}</h3>
        <p>{t("Morning briefing, bike assignment, and a warm-up ride through the Peresecina back roads to Curchi Monastery. Cave monastery at Orheiul Vechi in the quiet afternoon light, then we drop into Butuceni for the night. House-smoked trout, Fetească Neagră, and an early turn-in — tomorrow is the long day.",
              "Morgendliches Briefing, Maschinenzuteilung und eine Aufwärmfahrt durch die Nebenstraßen von Peresecina zum Kloster Curchi. Höhlenkloster Orheiul Vechi im ruhigen Nachmittagslicht, dann hinab nach Butuceni für die Nacht. Hausgeräucherte Forelle, Fetească Neagră und früh ins Bett — morgen wird es lang.")}</p>

        <h3>{t("Day 2 — Saharna → Soroca fortress (260 km)",
              "Tag 2 — Saharna → Festung Soroca (260 km)")}</h3>
        <p>{t("North via the Saharna waterfalls (short hike), then the Nistru road to the Genoese-era fortress at Soroca on the Ukrainian border. The fortress is intact, compact, and genuinely medieval — not a reconstruction. Overnight in a riverside guesthouse.",
              "Nordwärts über die Saharna-Wasserfälle (kurze Wanderung), dann die Nistru-Straße zur Genueser Festung in Soroca an der ukrainischen Grenze. Die Festung ist intakt, kompakt und tatsächlich mittelalterlich — keine Rekonstruktion. Übernachtung in einem Gasthaus am Fluss.")}</p>

        <h3>{t("Day 3 — Soroca → Rezina → Nistru canyon (220 km)",
              "Tag 3 — Soroca → Rezina → Nistru-Kanyon (220 km)")}</h3>
        <p>{t("The big ride. 140 km along the Nistru river on some of the emptiest paved roads in Europe, plus a 20 km hardpack gravel connector through the Țipova gorge — this is the technical section that earns the tour its \"advanced\" label. Lunch at a village restaurant, swim stop at a clifftop bend, overnight in a Rezina guesthouse.",
              "Die große Etappe. 140 km am Nistru entlang auf einigen der leersten Asphaltstraßen Europas, plus ein 20 km langer Hartschotter-Abschnitt durch die Țipova-Schlucht — der technische Teil, der die Tour zur „Fortgeschrittenen-Tour\" macht. Mittagessen in einem Dorfgasthof, Badepause an einer Felsbiegung, Übernachtung in einem Gasthaus in Rezina.")}</p>

        <h3>{t("Day 4 — Rezina → Bender → Purcari vineyards (290 km)",
              "Tag 4 — Rezina → Bender → Purcari-Weinberge (290 km)")}</h3>
        <p>{t("South through the rolling agricultural heartland, past Bender fortress (Ottoman-era, on the edge of Transnistria but on the government-controlled side — we don't cross). Arrive at the Purcari wine estate in the late afternoon for a cellar tour, tasting of their Negru de Purcari and Freedom Blend, and dinner in the estate restaurant.",
              "Südwärts durch das hügelige Agrarland, vorbei an der Festung Bender (osmanische Epoche, am Rand Transnistriens, aber auf der von Moldawien kontrollierten Seite — wir überqueren keine Grenze). Ankunft auf dem Weingut Purcari am späten Nachmittag für eine Kellerführung, Verkostung von Negru de Purcari und Freedom Blend sowie Abendessen im Weingut-Restaurant.")}</p>

        <h3>{t("Day 5 — Purcari → Chișinău via Prut valley (220 km)",
              "Tag 5 — Purcari → Chișinău über das Prut-Tal (220 km)")}</h3>
        <p>{t("A relaxed final day — the Prut valley along the Romanian border, a stop at Cricova cellars (because you can't leave Moldova without seeing them), and back to Chișinău by 17:00. Group photo, bikes returned, farewell dinner on us.",
              "Ein entspannter letzter Tag — das Prut-Tal entlang der rumänischen Grenze, ein Stopp in den Cricova-Kellern (man kann Moldawien nicht verlassen, ohne sie gesehen zu haben), Rückkehr nach Chișinău bis 17:00. Gruppenfoto, Rückgabe der Maschinen, Abschiedsessen geht auf uns.")}</p>

        <h2>{t("Who it's for", "Für wen ist das geeignet")}</h2>
        <ul>
          <li><strong>{t("Riding experience:", "Fahrerfahrung:")}</strong> {t("Advanced — 250–300 km days, one 20 km hardpack gravel section, summer heat. You should have ridden hardpack before.",
                                                                                "Fortgeschritten — 250–300 km pro Tag, ein 20 km langer Hartschotter-Abschnitt, Sommerhitze. Hartschotter-Erfahrung wird vorausgesetzt.")}</li>
          <li><strong>{t("License:", "Führerschein:")}</strong> {t("Full category A. IDP required for non-EU licenses.",
                                                                    "Vollklasse A. Internationaler Führerschein für Nicht-EU-Fahrer erforderlich.")}</li>
          <li><strong>{t("Minimum age:", "Mindestalter:")}</strong> {t("25, or 21 with a €150 young-rider surcharge (insurance cost).",
                                                                        "25 Jahre, oder 21 mit einem Aufschlag von €150 für junge Fahrer (Versicherungskosten).")}</li>
          <li><strong>{t("Languages:", "Sprachen:")}</strong> {t("Guide speaks fluent English and German.",
                                                                  "Guide spricht fließend Englisch und Deutsch.")}</li>
          <li><strong>{t("Pillions:", "Sozius:")}</strong> {t("Rider-only. Distances are too long for a comfortable pillion experience.",
                                                                "Nur Fahrer. Die Distanzen sind für einen angenehmen Sozius zu lang.")}</li>
        </ul>

        <h2>{t("Why small groups", "Warum kleine Gruppen")}</h2>
        <p>{t("We cap the 5-Day at five riders because the gravel section, the mountain passes, and the border-region roads all work better with a compact group. Two guides, a support van, and five riders means nobody gets dropped, nobody waits two hours for a bathroom break, and photo stops happen when you ask — not on a schedule.",
              "Wir begrenzen die 5-Tages-Tour auf fünf Fahrer, weil der Schotterabschnitt, die Bergpässe und die Grenzstraßen mit einer kompakten Gruppe besser funktionieren. Zwei Guides, ein Begleitfahrzeug und fünf Fahrer bedeuten: niemand wird abgehängt, niemand wartet zwei Stunden auf eine Toilettenpause, und Fotostopps gibt es, wenn du sie willst — nicht nach Plan.")}</p>

        <h2>{t("Departure dates", "Termine")}</h2>
        <p>{t("Four scheduled departures per season: early May, mid-June, early September, early October. Private departures for groups of 3+ on request. Book via the ",
              "Vier geplante Termine pro Saison: Anfang Mai, Mitte Juni, Anfang September, Anfang Oktober. Private Termine ab 3 Fahrern auf Anfrage. Buchung über die ")}
          <Link to={`/${q}#tours`}>{t("tours page", "Tour-Seite")}</Link>
          {t(" or message us on WhatsApp.", " oder per WhatsApp.")}
        </p>
        <Link to={`/${q}#tours`} style={{ display: "inline-block", marginTop: 14, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          {t("Reserve your date →", "Termin reservieren →")}
        </Link>

        <h2>{t("Frequently asked", "Häufige Fragen")}</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("Do we cross into Ukraine or Transnistria?",
               "Überqueren wir die Grenze zur Ukraine oder nach Transnistrien?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("No. The route stays entirely in government-controlled Moldova. Soroca fortress and Bender are both on the Moldovan side — we view the Ukrainian bank of the Nistru from our side, nothing more.",
               "Nein. Die Route bleibt vollständig im moldauisch kontrollierten Gebiet. Festung Soroca und Bender liegen beide auf der moldauischen Seite — wir sehen das ukrainische Ufer des Nistru von unserer Seite, mehr nicht.")}
          </p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("How technical is the gravel section?", "Wie technisch ist der Schotterabschnitt?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("Hardpack, not loose. The CFMOTO's 19-inch front wheel and off-road ABS mode handle it easily. If you've ridden forest roads or unpaved passes before, you'll be comfortable. If you haven't, we'll brief you the morning of and the support van follows the section.",
               "Hartschotter, kein loser Schotter. Das 19-Zoll-Vorderrad der CFMOTO und der Offroad-ABS-Modus meistern das problemlos. Wer schon Waldwege oder unbefestigte Pässe gefahren ist, kommt klar. Falls nicht, gibt es am Morgen ein Briefing, und das Begleitfahrzeug folgt der Etappe.")}
          </p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("What if I can't do the gravel?", "Was, wenn ich den Schotter nicht fahren möchte?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("We have a bypass road that adds 30 km of tarmac. You ride it with one of the two guides while the rest take the gravel. Nobody is made to ride something they don't want to.",
               "Wir haben eine Umgehungsstraße, die 30 km Asphalt hinzufügt. Du fährst sie mit einem der beiden Guides, während der Rest den Schotter nimmt. Niemand muss etwas fahren, was er nicht möchte.")}
          </p>
        </details>
        <p style={{ marginTop: 12 }}>
          {t("More questions? ", "Mehr Fragen? ")}
          <Link to={`/faq${q}`}>{t("See the full FAQ", "Zur vollständigen FAQ")}</Link>.
        </p>

        <h2>{t("Related reading", "Weiterlesen")}</h2>
        <ul>
          <li><Link to={`/blog/moldova-motorcycle-tour-guide${q}`}>
            {t("The complete guide to motorcycle touring in Moldova",
               "Der komplette Leitfaden für Motorradtouren in Moldawien")}
          </Link></li>
          <li><Link to={`/tours/3-day-moldova-adventure${q}`}>
            {t("3-Day Moldova Adventure — if five days is too much",
               "3-Tages-Moldawien-Abenteuer — falls fünf Tage zu viel sind")}
          </Link></li>
          <li><Link to={`/adventures${q}`}>
            {t("Photos from past Grand Tour departures",
               "Fotos vergangener Grand-Tour-Termine")}
          </Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
