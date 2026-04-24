import { Link } from "react-router-dom";
import SeoHead from "../../seo/SeoHead";
import PageShell, { COLORS } from "../../seo/PageShell";
import { useLang } from "../../i18n";

const { ORANGE, BORDER, MUTED, WHITE } = COLORS;

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "3-Day Moldova Adventure — Orheiul Vechi, Saharna & Nistru by Motorcycle",
    "description": "A three-day guided motorcycle tour from Chișinău to the cliff monastery of Orheiul Vechi, the Saharna waterfalls and the Nistru river canyon, with a night in a traditional Butuceni guesthouse.",
    "touristType": ["Motorcycling enthusiasts", "Adventure travellers", "Cultural heritage travellers"],
    "image": "https://moldovamoto.com/og-cover.jpg",
    "url": "https://moldovamoto.com/tours/3-day-moldova-adventure",
    "provider": {
      "@type": "Organization",
      "name": "ETI Moto Tours",
      "url": "https://moldovamoto.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "650",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://moldovamoto.com/tours/3-day-moldova-adventure",
      "validFrom": "2026-04-04"
    },
    "itinerary": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Day 1 — Chișinău to Butuceni via Curchi Monastery" },
        { "@type": "ListItem", "position": 2, "name": "Day 2 — Orheiul Vechi cave monastery and the Nistru river canyon" },
        { "@type": "ListItem", "position": 3, "name": "Day 3 — Saharna waterfalls and return to Chișinău" }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": "https://moldovamoto.com/" },
      { "@type": "ListItem", "position": 2, "name": "Tours", "item": "https://moldovamoto.com/#tours" },
      { "@type": "ListItem", "position": 3, "name": "3-Day Moldova Adventure",
        "item": "https://moldovamoto.com/tours/3-day-moldova-adventure" }
    ]
  }
];

export default function ThreeDayAdventure() {
  const { lang } = useLang();
  const de = lang === "de";
  const t = (en, deText) => (de ? deText : en);

  return (
    <PageShell>
      <SeoHead
        title={t("3-Day Moldova Adventure — Orheiul Vechi & Nistru by Motorcycle | ETI Moto Tours",
                 "3-Tages-Moldawien-Abenteuer — Orheiul Vechi & Nistru mit dem Motorrad | ETI Moto Tours")}
        description={t("Three days on a CFMOTO 800MT through Moldova's cliff monasteries, river canyons and vineyard villages. Butuceni guesthouse night included. €650 all-in.",
                       "Drei Tage auf einer CFMOTO 800MT durch Moldawiens Höhlenklöster, Flusscanyons und Weinbaudörfer. Übernachtung im Gasthaus Butuceni inklusive. €650 all-inclusive.")}
        canonical="https://moldovamoto.com/tours/3-day-moldova-adventure"
        ogImage="https://moldovamoto.com/og-cover.jpg"
        jsonLd={jsonLd}
      />
      <article className="page-prose">
        <div style={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          {t("3-Day Tour · Intermediate", "3-Tages-Tour · Mittelstufe")}
        </div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", fontWeight: 900, letterSpacing: "-0.025em", margin: "8px 0 8px" }}>
          {t("3-Day Moldova Adventure: Orheiul Vechi, Nistru & Saharna",
             "3-Tages-Moldawien-Abenteuer: Orheiul Vechi, Nistru & Saharna")}
        </h1>
        <p style={{ fontSize: 18, color: "rgba(244,244,244,0.8)" }}>
          {t("The canonical Moldova ride. Cliff monasteries carved into limestone, serpentine river roads, a night in a traditional Butuceni guesthouse, and the kind of scenery that convinces people Moldova was Europe's secret all along.",
             "Die kanonische Moldawien-Tour. Höhlenklöster im Kalksteinkanyon, serpentinenreiche Flussstraßen, eine Übernachtung in einem traditionellen Butuceni-Gasthaus und Landschaften, die überzeugen: Moldawien war schon immer Europas Geheimnis.")}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, margin: "28px 0", padding: "18px", background: "#111", borderRadius: 12, border: `1px solid ${BORDER}` }}>
          {[
            [t("Price", "Preis"),             "€650"],
            [t("Duration", "Dauer"),          t("3 days", "3 Tage")],
            [t("Distance", "Distanz"),        "620 km"],
            [t("Difficulty", "Schwierigkeit"), t("Intermediate", "Mittelstufe")],
            [t("Group size", "Gruppengröße"), t("Max 8", "Max. 8")],
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
          <li>{t("CFMOTO 800MT Adventure with full luggage",
                 "CFMOTO 800MT Adventure mit komplettem Gepäcksystem")}</li>
          <li>{t("Full riding gear (helmet, jacket, trousers, gloves) — any size",
                 "Komplette Schutzausrüstung (Helm, Jacke, Hose, Handschuhe) — alle Größen")}</li>
          <li>{t("Experienced local guide (EN/DE) and intercom",
                 "Erfahrener lokaler Guide (EN/DE) und Gegensprechanlage")}</li>
          <li>{t("Support van for luggage, tools, and the odd weather detour",
                 "Begleitfahrzeug für Gepäck, Werkzeug und wetterbedingte Umwege")}</li>
          <li>{t("Fuel, insurance, tolls, and all site entries",
                 "Benzin, Versicherung, Mautgebühren und alle Eintritte")}</li>
          <li>{t("Two nights in boutique guesthouses (Butuceni village + Saharna)",
                 "Zwei Nächte in Boutique-Gasthäusern (Butuceni + Saharna)")}</li>
          <li>{t("Breakfast, lunch, and dinner every day",
                 "Frühstück, Mittag- und Abendessen täglich")}</li>
          <li>{t("Airport pickup from Chișinău (KIV)",
                 "Flughafentransfer ab Chișinău (KIV)")}</li>
        </ul>

        <h2>{t("The itinerary", "Der Ablauf")}</h2>
        <h3>{t("Day 1 — Chișinău → Curchi → Butuceni (180 km)",
               "Tag 1 — Chișinău → Curchi → Butuceni (180 km)")}</h3>
        <p>{t("Morning briefing at our garage, bike assignment, and we're north by 10:00. We skip the R-14 highway and thread through the back lanes via Peresecina and Curchi, stopping at Curchi Monastery for lunch and the best plăcintă in the region. The approach to Butuceni from the Curchi ridge drops you into the Răut valley with the cliff monastery on the far bank — the best first-impression of any Moldovan site. Check in at the guesthouse, dinner of house-smoked trout and Fetească Neagră.",
              "Morgens Briefing in der Garage, Maschinenzuteilung, um 10:00 geht's nach Norden. Wir umgehen die R-14 und fädeln uns durch Nebenstraßen über Peresecina und Curchi, mit Mittagspause am Kloster Curchi und den besten Plăcintă der Region. Die Anfahrt nach Butuceni vom Curchi-Höhenzug öffnet sich ins Răut-Tal mit dem Felsenkloster am gegenüberliegenden Ufer — der beste erste Eindruck, den Moldawien zu bieten hat. Check-in im Gasthaus, Abendessen mit hausgeräucherter Forelle und Fetească Neagră.")}</p>

        <h3>{t("Day 2 — Orheiul Vechi + Nistru canyon (220 km)",
               "Tag 2 — Orheiul Vechi + Nistru-Canyon (220 km)")}</h3>
        <p>{t("Early start to beat the tour buses at the cave monastery. Thirty minutes to walk the cliff, then we cross the wooden bridge and ride east along the Nistru river road — one of the most underrated motorcycle roads in Europe. Lunch at a village restaurant in Molovata, swim stop if the weather is warm, and a loop back through the vineyards of Ivancea. Second night in Saharna.",
              "Früher Start, um den Reisebussen am Höhlenkloster zuvorzukommen. Dreißig Minuten Wanderung auf dem Felsrücken, dann über die Holzbrücke und nach Osten auf der Nistru-Flussstraße — eine der am meisten unterschätzten Motorradstrecken Europas. Mittagessen im Dorfrestaurant in Molovata, Badestopp bei warmem Wetter und eine Schleife durch die Weinberge von Ivancea zurück. Zweite Nacht in Saharna.")}</p>

        <h3>{t("Day 3 — Saharna waterfalls → Chișinău (220 km)",
               "Tag 3 — Saharna-Wasserfälle → Chișinău (220 km)")}</h3>
        <p>{t("Morning hike to the Saharna waterfalls (3 km round trip, optional). Riding south through Țipova and Rezina, a long vineyard section through Cricova, and back into Chișinău by 17:00. Group photo, bikes returned, beer on us.",
              "Morgens Wanderung zu den Saharna-Wasserfällen (3 km hin und zurück, optional). Fahrt nach Süden über Țipova und Rezina, ein langer Weinberg-Abschnitt durch Cricova und Rückkehr nach Chișinău gegen 17:00. Gruppenfoto, Rückgabe der Maschinen, Bier geht auf uns.")}</p>

        <h2>{t("Who it's for", "Für wen ist das geeignet")}</h2>
        <ul>
          <li><strong>{t("Riding experience:", "Fahrerfahrung:")}</strong> {t("Intermediate — 3+ years on an A-category bike, comfortable with 200 km days and some broken tarmac.",
                                                                              "Mittelstufe — 3+ Jahre auf einer A-Maschine, vertraut mit 200-km-Tagen und rauem Asphalt.")}</li>
          <li><strong>{t("License:", "Führerschein:")}</strong> {t("Full category A (or A2 with a restricted bike — ask us). IDP required for non-EU licenses.",
                                                                    "Vollklasse A (oder A2 mit gedrosselter Maschine — frag nach). Internationaler Führerschein für Nicht-EU-Fahrer erforderlich.")}</li>
          <li><strong>{t("Minimum age:", "Mindestalter:")}</strong> {t("21 with 2+ years of A-category riding.",
                                                                        "21 Jahre mit mindestens 2 Jahren A-Erfahrung.")}</li>
          <li><strong>{t("Languages:", "Sprachen:")}</strong> {t("Guide speaks fluent English and German.",
                                                                  "Guide spricht fließend Englisch und Deutsch.")}</li>
          <li><strong>{t("Pillions:", "Sozius:")}</strong> {t("Rider-only on multi-day tours for comfort and luggage capacity.",
                                                                "Auf Mehrtagestouren nur Fahrer — aus Gründen von Komfort und Gepäckkapazität.")}</li>
        </ul>

        <h2>{t("Departure dates", "Termine")}</h2>
        <p>
          {t("We run the 3-Day Adventure twice a month from late April through early October. Private departures for groups of 3+ on request. Book the date on the ",
             "Die 3-Tages-Tour findet zweimal monatlich von Ende April bis Anfang Oktober statt. Private Termine auf Anfrage ab 3 Fahrern. Termin buchen auf der ")}
          <Link to={de ? "/?lang=de#tours" : "/#tours"}>{t("tours page", "Tourenseite")}</Link>
          {t(", or message us on WhatsApp for custom routing.", ", oder per WhatsApp für individuelle Routen.")}
        </p>
        <Link to={de ? "/?lang=de#tours" : "/#tours"} style={{ display: "inline-block", marginTop: 14, background: ORANGE, color: "#fff", padding: "14px 26px", borderRadius: 10, fontWeight: 800, fontSize: 15 }}>
          {t("Reserve your date →", "Termin reservieren →")}
        </Link>

        <h2>{t("Frequently asked", "Häufige Fragen")}</h2>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("How hard is the riding, honestly?", "Wie anspruchsvoll ist die Fahrt wirklich?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("Most of it is paved and flowing. There's one 6 km hardpack gravel stretch along the Nistru on Day 2 that you can skip — we'll re-route the group around it if anyone would rather not. Pace is set by the slowest rider; we don't drop anyone.",
               "Der Großteil ist asphaltiert und flüssig zu fahren. Am Tag 2 gibt es einen 6 km langen Hartschotter-Abschnitt am Nistru, den man auslassen kann — wir leiten die Gruppe bei Bedarf drumherum. Das Tempo richtet sich nach dem langsamsten Fahrer; wir lassen niemanden zurück.")}
          </p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("What are the guesthouses like?", "Wie sind die Gasthäuser?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("Small, family-run, private rooms with ensuite bathrooms. Traditional Moldovan breakfasts. Not five-star — five-star isn't what you came for. Single-supplement €25/night if you'd rather not share.",
               "Klein, familiengeführt, Einzelzimmer mit eigenem Bad. Traditionelles moldawisches Frühstück. Kein Fünf-Sterne-Komfort — dafür bist du nicht hier. Einzelzimmerzuschlag €25/Nacht.")}
          </p>
        </details>
        <details style={{ borderBottom: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            {t("Can I extend it into a longer trip?", "Kann ich die Tour verlängern?")}
          </summary>
          <p style={{ marginTop: 8 }}>
            {t("Yes. The 3-Day dovetails with the ",
               "Ja. Die 3-Tages-Tour lässt sich mit der ")}
            <Link to={de ? "/tours/5-day-grand-moldova?lang=de" : "/tours/5-day-grand-moldova"}>
              {t("5-Day Grand Tour", "5-Tages-Grand-Tour")}
            </Link>
            {t(" and can be paired with a day of wine tasting in Cricova or Purcari — ask when you book.",
               " kombinieren und mit einem Weinprobentag in Cricova oder Purcari ergänzen — frag bei der Buchung.")}
          </p>
        </details>
        <p style={{ marginTop: 12 }}>
          {t("More questions? ", "Mehr Fragen? ")}
          <Link to={de ? "/faq?lang=de" : "/faq"}>{t("See the full FAQ", "Zur vollständigen FAQ")}</Link>.
        </p>

        <h2>{t("Related reading", "Weiterlesen")}</h2>
        <ul>
          <li><Link to={de ? "/blog/orheiul-vechi-motorcycle-guide?lang=de" : "/blog/orheiul-vechi-motorcycle-guide"}>
            {t("Orheiul Vechi by motorcycle — route guide",
               "Orheiul Vechi mit dem Motorrad — Routenführer")}
          </Link></li>
          <li><Link to={de ? "/blog/moldova-motorcycle-tour-guide?lang=de" : "/blog/moldova-motorcycle-tour-guide"}>
            {t("The complete guide to motorcycle touring in Moldova",
               "Der komplette Leitfaden für Motorradtouren in Moldawien")}
          </Link></li>
          <li><Link to={de ? "/adventures?lang=de" : "/adventures"}>
            {t("Photos from past 3-Day departures", "Fotos vergangener 3-Tages-Termine")}
          </Link></li>
        </ul>
      </article>
    </PageShell>
  );
}
