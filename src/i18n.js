/**
 * i18n.js - EN/DE translations for MoldovaMoto
 * Security: getLang() strips all non-a-z chars and validates against
 * SUPPORTED list. The lang value never touches SQL or any server.
 */
import { useState, useEffect } from "react";

const SUPPORTED = ["en", "de"];

export function getLang() {
  const raw  = new URLSearchParams(window.location.search).get("lang") || "";
  const safe = raw.replace(/[^a-z]/g, "").slice(0, 5);
  return SUPPORTED.includes(safe) ? safe : "en";
}

export function setLang(lang) {
  const safe = SUPPORTED.includes(lang) ? lang : "en";
  const url  = new URL(window.location.href);
  safe === "en" ? url.searchParams.delete("lang")
                : url.searchParams.set("lang", safe);
  window.history.replaceState({}, "", url.toString());
  window.dispatchEvent(new Event("langchange"));
}

export function useLang() {
  const [lang, setLangState] = useState(getLang);
  useEffect(() => {
    const h = () => setLangState(getLang());
    window.addEventListener("langchange", h);
    return () => window.removeEventListener("langchange", h);
  }, []);
  const t = (key) => T[key]?.[lang] ?? T[key]?.["en"] ?? key;
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t("seo.title");
    const setMeta = (name, value, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };
    setMeta("description", t("seo.description"));
    setMeta("og:title", t("seo.title"), "property");
    setMeta("og:description", t("seo.description"), "property");
    setMeta("og:locale", lang === "de" ? "de_DE" : "en_US", "property");
  }, [lang]);
  return { lang, setLang, t };
}

/* ── Translations ─────────────────────────────────────────────────────────── */
const T = {
  // SEO
  "seo.title": {
    en: "MoldovaMoto \u2013 Guided Motorcycle Tours in Moldova",
    de: "MoldovaMoto \u2013 Gef\u00FChrte Motorradtouren in Moldawien",
  },
  "seo.description": {
    en: "Premium guided motorcycle tours through Moldova's vineyards, cliff monasteries, and hidden roads of Eastern Europe. Ride the CFMOTO 800MT Adventure.",
    de: "Gef\u00FChrte Motorradtouren und Motorradvermietung in Moldawien \u2013 durch Weinberge, Felsenkl\u00F6ster und die versteckten Stra\u00DFen Osteuropas. Abenteuer auf der CFMOTO 800MT.",
  },

  // Nav
  "nav.tours":      { en:"Tours",          de:"Touren" },
  "nav.experience": { en:"Experience",     de:"Erlebnis" },
  "nav.fleet":      { en:"Fleet",          de:"Flotte" },
  "nav.routes":     { en:"Routes",         de:"Routen" },
  "nav.contact":    { en:"Contact",        de:"Kontakt" },
  "nav.adventures": { en:"Adventures",     de:"Abenteuer" },
  "nav.book":       { en:"Book Your Tour", de:"Tour buchen" },

  // Hero
  "hero.badge": { en:"Guided Tours \u00B7 Moldova \u00B7 Eastern Europe",
                  de:"Gef\u00FChrte Touren \u00B7 Moldawien \u00B7 Osteuropa" },
  "hero.h1a":   { en:"Discover Moldova",   de:"Entdecken Sie Moldawien" },
  "hero.h1b":   { en:"on Two Wheels",      de:"auf zwei R\u00E4dern" },
  "hero.sub":   { en:"Ride the last untamed roads of Europe. Expert-guided motorcycle tours through vineyards, cliff monasteries, and river canyons.",
                  de:"Fahren Sie auf den letzten wilden Stra\u00DFen Europas. Expertengeführte Motorradtouren durch Weinberge, Felsenkl\u00F6ster und Flussschluchten." },
  "hero.cta":   { en:"Book Your Tour",     de:"Tour buchen" },
  "hero.stat.riders": { en:"riders guided",    de:"gef\u00FChrte Fahrer" },
  "hero.stat.rating": { en:"avg. rating",      de:"\u00D8 Bewertung" },
  "hero.stat.routes": { en:"signature routes", de:"Signature-Routen" },
  "hero.stat.season": { en:"riding season",    de:"Fahrsaison" },

  // Tours
  "tours.tag":  { en:"Guided Tours",           de:"Gef\u00FChrte Touren" },
  "tours.h2":   { en:"Choose Your Adventure",  de:"W\u00E4hlen Sie Ihr Abenteuer" },
  "tours.sub":  { en:"Every route personally tested by our team for the perfect mix of scenery, culture, and riding joy.",
                  de:"Jede Route wurde von unserem Team pers\u00F6nlich getestet \u2013 f\u00FCr die perfekte Mischung aus Landschaft, Kultur und Fahrfreude." },
  "tours.book": { en:"Book This Tour",         de:"Jetzt buchen" },
  "tours.rental.book": { en:"Rent a Bike",     de:"Motorrad mieten" },
  "tours.spots":  { en:"spots left",           de:"Pl\u00E4tze frei" },
  "tours.full":   { en:"Full",                 de:"Ausgebucht" },
  "tours.departs":{ en:"Departs",              de:"Abfahrt" },

  // Experience
  "exp.tag":  { en:"Why Ride With Us",     de:"Warum mit uns fahren" },
  "exp.h2a":  { en:"Not Just a Tour.",     de:"Nicht nur eine Tour." },
  "exp.h2b":  { en:"An Experience.",       de:"Ein Erlebnis." },

  // Fleet
  "fleet.tag":         { en:"Your Ride Awaits",   de:"Ihr Motorrad wartet" },
  "fleet.h2a":         { en:"CFMOTO 800MT",        de:"CFMOTO 800MT" },
  "fleet.h2b":         { en:"Adventure Class",     de:"Adventure-Klasse" },
  "fleet.desc":        { en:"The CFMOTO 800MT is our chosen mount for Moldova\u2019s diverse terrain \u2014 from smooth vineyard lanes to the rugged riverside tracks of the Nistru canyon. Powerful, comfortable, and loaded with touring tech.",
                         de:"Die CFMOTO 800MT ist unser Motorrad f\u00FCr Moldawiens vielf\u00E4ltiges Gel\u00E4nde \u2013 von glatten Weinbergstra\u00DFen bis zu den rauen Flusswegen des Nistru-Canyons. Leistungsstark, komfortabel und mit modernster Touring-Technik." },
  "fleet.badge.title": { en:"All-Inclusive",       de:"Alles inklusive" },
  "fleet.badge.sub":   { en:"Extra Bike Fee",       de:"Aufpreis Motorrad" },

  // Map
  "map.tag":      { en:"The Moldova Map",           de:"Die Moldawien-Karte" },
  "map.h2a":      { en:"Six Stops.",                de:"Sechs Stopps." },
  "map.h2b":      { en:"One Unforgettable Journey", de:"Eine unvergessliche Reise" },
  "map.coverage": { en:"Tour Coverage",             de:"Tourenabdeckung" },

  // Contact
  "contact.tag":    { en:"Get in Touch",    de:"Kontakt aufnehmen" },
  "contact.h2":     { en:"Ready to Ride?", de:"Bereit zu fahren?" },
  "contact.sub":    { en:"Have questions? Want a custom itinerary? Drop us a message and we\u2019ll get back to you within a few hours.",
                      de:"Haben Sie Fragen oder m\u00F6chten Sie eine individuelle Route? Schreiben Sie uns \u2013 wir antworten innerhalb weniger Stunden." },
  "contact.name":   { en:"Your Name",      de:"Ihr Name" },
  "contact.email":  { en:"Email Address",  de:"E-Mail-Adresse" },
  "contact.msg":    { en:"Your Message",   de:"Ihre Nachricht" },
  "contact.send":   { en:"Send Message",   de:"Nachricht senden" },
  "contact.sent.h": { en:"Message Sent!",  de:"Nachricht gesendet!" },
  "contact.sent.p": { en:"Thank you! We\u2019ll be in touch within 24 hours.",
                      de:"Vielen Dank! Wir melden uns innerhalb von 24 Stunden." },
  "contact.wa":     { en:"WhatsApp us for faster confirmation: ",
                      de:"Schreiben Sie uns auf WhatsApp: " },

  // Testimonials
  "testi.tag": { en:"Rider Stories",     de:"Fahrer-Erfahrungen" },
  "testi.h2a": { en:"Don\u2019t Take",   de:"Glauben Sie" },
  "testi.h2b": { en:"Our Word For It",   de:"nicht nur uns" },

  // CTA
  "cta.h2a":  { en:"The Road Is Waiting.",   de:"Die Stra\u00DFe wartet." },
  "cta.h2b":  { en:"Are You?",               de:"Sind Sie bereit?" },
  "cta.sub":  { en:"Limited spots per departure. Secure your place on Moldova\u2019s most iconic motorcycle journey.",
                de:"Begrenzte Pl\u00E4tze pro Abfahrt. Sichern Sie sich Ihren Platz auf Moldawiens ikonischster Motorradreise." },
  "cta.btn":  { en:"Book Your Tour Now",     de:"Jetzt Tour buchen" },

  // Footer
  "footer.tagline":      { en:"The last untamed roads of Europe.",    de:"Die letzten wilden Stra\u00DFen Europas." },
  "footer.info.about":   { en:"About Us",          de:"\u00DCber uns" },
  "footer.info.fleet":   { en:"Our Fleet",          de:"Unsere Flotte" },
  "footer.info.routes":  { en:"Route Map",          de:"Routenkarte" },
  "footer.info.safety":  { en:"Safety & Licensing", de:"Sicherheit & Lizenz" },
  "footer.info.faq":     { en:"FAQ",                de:"FAQ" },
  "footer.info.terms":   { en:"Terms & Conditions", de:"AGB" },
  "footer.copy":         { en:"All rights reserved.", de:"Alle Rechte vorbehalten." },

  // Booking modal
  "book.badge":  { en:"Reservation Request", de:"Buchungsanfrage" },
  "book.title":  { en:"Book Your Tour",      de:"Tour buchen" },
  "book.s0.q":   { en:"Which tour calls to you?", de:"Welche Tour interessiert Sie?" },
  "book.s1.q":   { en:"Choose your departure",    de:"Abfahrtsdatum w\u00E4hlen" },
  "book.s1.from":{ en:"From",   de:"Von" },
  "book.s1.to":  { en:"To",     de:"Bis" },
  "book.s1.spots":{ en:"spots", de:"Pl\u00E4tze" },
  "book.s1.full": { en:"Full",  de:"Ausgebucht" },
  "book.s1.none": { en:"No upcoming departures scheduled. Please contact us for custom dates.",
                    de:"Keine Abfahrten geplant. Bitte kontaktieren Sie uns f\u00FCr individuelle Termine." },
  "book.s2.q":       { en:"Choose Your Ride",   de:"W\u00E4hlen Sie Ihr Motorrad" },
  "book.s2.avail":   { en:"Available",          de:"Verf\u00FCgbar" },
  "book.s2.booked":  { en:"Booked",             de:"Gebucht" },
  "book.s2.maint":   { en:"Maintenance",        de:"Wartung" },
  "book.s2.select":  { en:"Select",             de:"W\u00E4hlen" },
  "book.s2.selected":{ en:"Selected",           de:"Ausgew\u00E4hlt" },
  "book.s2.conflict":{ en:"This motorcycle is already booked for the selected dates \u2014 please choose a different motorcycle.",
                       de:"Dieses Motorrad ist f\u00FCr die gew\u00E4hlten Daten bereits gebucht \u2013 bitte w\u00E4hlen Sie ein anderes Motorrad." },
  "book.s2.skip":    { en:"Skip \u2014 assign best available bike",
                       de:"\u00DCberspringen \u2013 bestes verf\u00FCgbares Motorrad zuweisen" },
  "book.s3.q":       { en:"Your Rider Profile",  de:"Ihr Fahrerprofil" },
  "book.s3.name":    { en:"FULL NAME",            de:"VOLLST\u00C4NDIGER NAME" },
  "book.s3.email":   { en:"EMAIL ADDRESS",        de:"E-MAIL-ADRESSE" },
  "book.s3.phone":   { en:"PHONE / WHATSAPP",     de:"TELEFON / WHATSAPP" },
  "book.s3.country": { en:"COUNTRY",              de:"LAND" },
  "book.s3.exp":     { en:"RIDING EXPERIENCE",    de:"FAHRERFAHRUNG" },
  "book.s3.exp.beginner":          { en:"Beginner",     de:"Anf\u00E4nger" },
  "book.s3.exp.beginner.sub":      { en:"1-3 years",    de:"1-3 Jahre" },
  "book.s3.exp.intermediate":      { en:"Intermediate", de:"Fortgeschritten" },
  "book.s3.exp.intermediate.sub":  { en:"3-7 years",    de:"3-7 Jahre" },
  "book.s3.exp.advanced":          { en:"Advanced",     de:"Erfahren" },
  "book.s3.exp.advanced.sub":      { en:"7+ years",     de:"7+ Jahre" },
  "book.s3.exp.expert":            { en:"Expert",       de:"Experte" },
  "book.s3.exp.expert.sub":        { en:"Track exp.",   de:"Rennerfahrung" },
  "book.s4.q":       { en:"Confirm Your Booking", de:"Buchung best\u00E4tigen" },
  "book.s4.summary": { en:"Booking Summary",      de:"Buchungs\u00FCbersicht" },
  "book.s4.tour":    { en:"Tour",       de:"Tour" },
  "book.s4.date":    { en:"Date",       de:"Datum" },
  "book.s4.moto":    { en:"Motorcycle", de:"Motorrad" },
  "book.s4.rider":   { en:"Rider",      de:"Fahrer" },
  "book.s4.email":   { en:"Email",      de:"E-Mail" },
  "book.s4.phone":   { en:"Phone",      de:"Telefon" },
  "book.s4.country": { en:"Country",    de:"Land" },
  "book.s4.exp":     { en:"Experience", de:"Erfahrung" },
  "book.s4.license": { en:"I confirm I hold a valid motorcycle license and accept the",
                       de:"Ich best\u00E4tige, einen g\u00FCltigen Motorradführerschein zu besitzen und die" },
  "book.s4.terms":   { en:"terms & conditions", de:"AGB" },
  "book.s4.confirm": { en:"Send Reservation Request \u2713", de:"Buchungsanfrage senden \u2713" },
  "book.s4.sending": { en:"Booking...",           de:"Wird gesendet..." },
  "book.done.h":     { en:"You\u2019re In the Queue!",  de:"Sie sind dabei!" },
  "book.done.p1":    { en:"Your reservation request for", de:"Ihre Buchungsanfrage f\u00FCr" },
  "book.done.p2":    { en:"has been received. We\u2019ll confirm within 24\u00A0hours via email to",
                       de:"ist eingegangen. Wir best\u00E4tigen innerhalb von 24\u00A0Stunden per E-Mail an" },
  "book.done.wa":    { en:"WhatsApp us for faster confirmation:",
                       de:"Schreiben Sie uns auf WhatsApp f\u00FCr schnellere Best\u00E4tigung:" },
  "book.done.back":  { en:"Back to Tours", de:"Zur\u00FCck zu den Touren" },
  "book.btn.back":   { en:"Back",          de:"Zur\u00FCck" },
  "book.btn.next":   { en:"Continue",      de:"Weiter" },

  // Validation
  "err.tour":      { en:"Please select a tour",               de:"Bitte w\u00E4hlen Sie eine Tour" },
  "err.date":      { en:"Please select a departure date",     de:"Bitte w\u00E4hlen Sie ein Abfahrtsdatum" },
  "err.dateOpen":  { en:"Please pick a start date",          de:"Bitte w\u00E4hlen Sie ein Startdatum" },
  "err.dateTo":    { en:"Please pick an end date",           de:"Bitte w\u00E4hlen Sie ein Enddatum" },
  "err.dateRange": { en:"End date must be after start date", de:"Das Enddatum muss nach dem Startdatum liegen" },
  "err.name":      { en:"Name required",                     de:"Name erforderlich" },
  "err.email":     { en:"Valid email required",              de:"G\u00FCltige E-Mail erforderlich" },
  "err.phone":     { en:"Phone required",                    de:"Telefonnummer erforderlich" },
  "err.country":   { en:"Country required",                  de:"Land erforderlich" },
  "err.exp":       { en:"Please select experience level",    de:"Bitte w\u00E4hlen Sie Ihr Erfahrungsniveau" },
  "err.license":   { en:"Please confirm your license",       de:"Bitte best\u00E4tigen Sie Ihren F\u00FChrerschein" },

  // Info page
  "info.back":        { en:"\u2190 MoldovaMoto",       de:"\u2190 MoldovaMoto" },
  "info.book":        { en:"Book a Tour",              de:"Tour buchen" },
  "info.ready":       { en:"Ready to ride?",           de:"Bereit zu fahren?" },
  "info.about.tag":   { en:"Our Story",                de:"Unsere Geschichte" },
  "info.about.h1a":   { en:"The Last Authentic",       de:"Die letzten authentischen" },
  "info.about.h1b":   { en:"Roads of Europe",          de:"Stra\u00DFen Europas" },
  "info.about.lead":  { en:"Moldova Moto Tours was created for riders who want to discover one of the last genuinely untouched regions of Europe - not a postcard version of it, but the real thing.",
                        de:"Moldova Moto Tours wurde f\u00FCr Fahrer gegr\u00FCndet, die eine der letzten wirklich unber\u00FChrten Regionen Europas entdecken m\u00F6chten \u2013 nicht die Hochglanzversion, sondern das echte Moldawien." },
  "info.about.do.title":      { en:"What We Do",    de:"Was wir tun" },
  "info.about.do.body":       { en:"We organise motorcycle tours and rentals through Moldova's hidden roads, authentic villages, vineyard landscapes, and wild river canyons.",
                                 de:"Wir organisieren Motorradtouren und -vermietungen durch Moldawiens versteckte Stra\u00DFen, authentische D\u00F6rfer, Weinlandschaften und wilde Flussschluchten." },
  "info.about.mission.title": { en:"Our Mission",   de:"Unsere Mission" },
  "info.about.mission.body":  { en:"To show riders the Moldova that travel guides miss - the untouched roads, real culture, genuine hospitality, and scenery that rivals anywhere in Europe.",
                                 de:"Wir zeigen Fahrern das Moldawien, das Reisef\u00FChrer \u00FCbersehen \u2013 unber\u00FChrte Stra\u00DFen, echte Kultur, herzliche Gastfreundschaft und Landschaften, die es mit ganz Europa aufnehmen k\u00F6nnen." },
  "info.about.included":      { en:"Every Tour Includes",  de:"Jede Tour beinhaltet" },
  "info.about.promise.title": { en:"Our Promise",   de:"Unser Versprechen" },
  "info.about.promise.body":  { en:"We don't run crowded bus tours. We ride. Every route has been personally tested to find the perfect balance between adventure, safety, and unforgettable scenery.",
                                 de:"Wir veranstalten keine \u00FCberf\u00FCllten Bustouren. Wir fahren. Jede Route wurde pers\u00F6nlich getestet, um die perfekte Balance zwischen Abenteuer, Sicherheit und unvergesslicher Landschaft zu finden." },
  "info.about.bookcta":       { en:"Book Your Ride",       de:"Jetzt buchen" },

  "info.fleet.tag":   { en:"Our Fleet",              de:"Unsere Flotte" },
  "info.fleet.h2a":   { en:"Premium Bikes.",          de:"Premium-Motorr\u00E4der." },
  "info.fleet.h2b":   { en:"Zero Compromises.",       de:"Keine Kompromisse." },
  "info.fleet.lead":  { en:"Every motorcycle is maintained to the highest standards and inspected before each rental or tour. We ride CFMOTO 800MT Adventure bikes.",
                        de:"Jedes Motorrad wird nach h\u00F6chsten Standards gewartet und vor jeder Vermietung oder Tour inspiziert. Wir fahren CFMOTO 800MT Adventure-Motorr\u00E4der." },
  "info.fleet.specs": { en:"CFMOTO 800MT Adventure",  de:"CFMOTO 800MT Adventure" },
  "info.fleet.incl":  { en:"Always Included",         de:"Immer inklusive" },

  "info.routes.tag":      { en:"Routes",               de:"Routen" },
  "info.routes.h2a":      { en:"Roads No GPS",         de:"Stra\u00DFen, die kein GPS" },
  "info.routes.h2b":      { en:"Will Ever Suggest",    de:"je vorschlagen wird" },
  "info.routes.lead":     { en:"Moldova offers empty roads, dramatic scenery, world-class wine culture, and monastery landscapes - without the crowds or the price tag.",
                            de:"Moldawien bietet leere Stra\u00DFen, dramatische Landschaften, erstklassige Weinkultur und Klosterlandschaften \u2013 ohne Menschenmassen und \u00FCberh\u00F6hte Preise." },
  "info.routes.notsure":  { en:"Not sure which tour suits you?", de:"Unsicher, welche Tour zu Ihnen passt?" },
  "info.routes.notsure.sub": { en:"Message us on WhatsApp and we will help you pick the perfect route.",
                               de:"Schreiben Sie uns auf WhatsApp und wir helfen Ihnen, die perfekte Route zu finden." },
  "info.routes.wa":       { en:"Chat on WhatsApp",     de:"WhatsApp schreiben" },
  "info.routes.book":     { en:"Book Directly",        de:"Direkt buchen" },

  "info.safety.tag":  { en:"Safety",              de:"Sicherheit" },
  "info.safety.h2a":  { en:"Your Safety.",         de:"Ihre Sicherheit." },
  "info.safety.h2b":  { en:"Our Responsibility.",  de:"Unsere Verantwortung." },
  "info.safety.lead": { en:"We take safety seriously - not as a legal box to tick, but because we are riders too and we want you to come home with great stories.",
                        de:"Wir nehmen Sicherheit ernst \u2013 nicht als b\u00FCrokratische Pflicht, sondern weil wir selbst Fahrer sind und m\u00F6chten, dass Sie mit tollen Geschichten nach Hause kommen." },
  "info.safety.t1":   { en:"License Requirements",  de:"F\u00FChrerschein-Anforderungen" },
  "info.safety.t2":   { en:"Age Requirements",      de:"Altersanforderungen" },
  "info.safety.t3":   { en:"Mandatory Gear",        de:"Pflichtausr\u00FCstung" },
  "info.safety.breakdown": { en:"What Happens If Something Goes Wrong", de:"Was passiert, wenn etwas schiefgeht" },
  "info.safety.guided": { en:"Guided Tours",        de:"Gef\u00FChrte Touren" },
  "info.safety.guided.body": { en:"A support vehicle follows every multi-day tour. Our guides carry first-aid kits and have emergency protocols for every route segment.",
                               de:"Ein Begleitfahrzeug folgt jeder mehrt\u00E4gigen Tour. Unsere F\u00FChrer tragen Erste-Hilfe-Ausr\u00FCstung und haben Notfallprotokolle f\u00FCr jeden Streckenabschnitt." },
  "info.safety.rental": { en:"Rentals",             de:"Vermietungen" },
  "info.safety.rental.body": { en:"24/7 roadside assistance. 2-hour response guarantee anywhere in Moldova. A replacement motorcycle can be dispatched for longer breakdowns.",
                               de:"24/7 Pannenhilfe. Garantierte 2-Stunden-Reaktionszeit in ganz Moldawien. Ein Ersatzmotorrad kann f\u00FCr l\u00E4ngere Pannen bereitgestellt werden." },
  "info.safety.insurance": { en:"Insurance Coverage",  de:"Versicherungsschutz" },
  "info.safety.insurance.body": { en:"All motorcycles include mandatory third-party liability insurance. Additional comprehensive coverage is available. We strongly recommend personal travel insurance covering motorcycle touring.",
                                  de:"Alle Motorr\u00E4der sind mit der gesetzlich vorgeschriebenen Haftpflichtversicherung ausgestattet. Zus\u00E4tzlicher Vollkaskoversicherungsschutz ist verf\u00FCgbar. Wir empfehlen dringend eine pers\u00F6nliche Reiseversicherung, die Motorradtouren abdeckt." },

  "info.faq.tag":       { en:"FAQ",                         de:"H\u00E4ufige Fragen" },
  "info.faq.h2a":       { en:"Questions.",                  de:"Fragen." },
  "info.faq.h2b":       { en:"Answered.",                   de:"Beantwortet." },
  "info.faq.lead":      { en:"Everything you need to know before booking. Still have questions? Message us directly.",
                          de:"Alles, was Sie vor der Buchung wissen m\u00FCssen. Noch Fragen? Schreiben Sie uns direkt." },
  "info.faq.still":     { en:"Still have a question?",      de:"Noch eine Frage?" },
  "info.faq.still.sub": { en:"We reply on WhatsApp within 1 hour during business hours.",
                          de:"Wir antworten auf WhatsApp innerhalb einer Stunde w\u00E4hrend der Gesch\u00E4ftszeiten." },
  "info.faq.wa":        { en:"Message Us",                  de:"Nachricht senden" },

  "info.terms.tag":  { en:"Legal",        de:"Rechtliches" },
  "info.terms.h2a":  { en:"Terms and",    de:"Allgemeine" },
  "info.terms.h2b":  { en:"Conditions",   de:"Gesch\u00E4ftsbedingungen" },
  "info.terms.lead": { en:"By booking with us you agree to the following terms.",
                       de:"Mit Ihrer Buchung stimmen Sie den folgenden Bedingungen zu." },

  // Info nav labels
  "info.nav.about":  { en:"About Us",            de:"\u00DCber uns" },
  "info.nav.fleet":  { en:"Our Fleet",           de:"Unsere Flotte" },
  "info.nav.routes": { en:"Route Map",           de:"Routenkarte" },
  "info.nav.safety": { en:"Safety & Licensing",  de:"Sicherheit & Lizenz" },
  "info.nav.faq":    { en:"FAQ",                 de:"H\u00E4ufige Fragen" },
  "info.nav.terms":  { en:"Terms & Conditions",  de:"AGB" },

  // About stats
  "info.stat.riders":  { en:"Riders Guided",     de:"Begleitete Fahrer" },
  "info.stat.rating":  { en:"Average Rating",    de:"Durchschnittsbewertung" },
  "info.stat.stops":   { en:"Iconic Stops",      de:"Ikonische Stopps" },
  "info.stat.guides":  { en:"Licensed Guides",   de:"Lizenzierte Guides" },

  // About card icon labels
  "info.about.do.icon":      { en:"Map",  de:"Karte" },
  "info.about.mission.icon": { en:"Goal", de:"Ziel" },

  // Every Tour Includes pills
  "info.incl.0": { en:"Scenic routes personally tested by our team",
                   de:"Landschaftliche Routen, pers\u00F6nlich von unserem Team getestet" },
  "info.incl.1": { en:"Local cuisine and wine experiences",
                   de:"Lokale K\u00FCche und Weinerlebnisse" },
  "info.incl.2": { en:"Historic monasteries and landmark stops",
                   de:"Historische Kl\u00F6ster und Wahrzeichen" },
  "info.incl.3": { en:"Authentic rural landscapes",
                   de:"Authentische l\u00E4ndliche Landschaften" },
  "info.incl.4": { en:"Small groups - maximum 8 riders",
                   de:"Kleine Gruppen \u2013 maximal 8 Fahrer" },
  "info.incl.5": { en:"CFMOTO 800MT Adventure motorcycles",
                   de:"CFMOTO 800MT Adventure-Motorr\u00E4der" },
  "info.incl.6": { en:"24/7 roadside support",
                   de:"24/7 Pannenhilfe" },

  // Fleet specs items
  "info.fleet.spec.0": { en:"799cc parallel-twin, 95hp",
                         de:"799 cm\u00B3 Parallel-Twin, 95 PS" },
  "info.fleet.spec.1": { en:"Comfortable upright riding position",
                         de:"Bequeme aufrechte Sitzposition" },
  "info.fleet.spec.2": { en:"Long suspension travel for mixed roads",
                         de:"Langer Federweg f\u00FCr gemischte Stra\u00DFen" },
  "info.fleet.spec.3": { en:"ABS, traction control, multiple ride modes",
                         de:"ABS, Traktionskontrolle, mehrere Fahrmodi" },
  "info.fleet.spec.4": { en:"Heated grips, cruise control, USB-C charging",
                         de:"Heizgriffe, Tempomat, USB-C-Ladeanschluss" },

  // Always Included items
  "info.fleet.incl.0": { en:"Full-face helmet",            de:"Integralhelm" },
  "info.fleet.incl.1": { en:"Riding gloves",               de:"Motorradhandschuhe" },
  "info.fleet.incl.2": { en:"Navigation mount / phone holder",
                         de:"Navigations-/Telefonhalterung" },
  "info.fleet.incl.3": { en:"Top case + side panniers",    de:"Topcase + Seitenkoffer" },
  "info.fleet.incl.4": { en:"Basic riding gear (optional upgrade)",
                         de:"Basis-Motorradkleidung (optionales Upgrade)" },
  "info.fleet.incl.5": { en:"Third-party insurance",       de:"Haftpflichtversicherung" },
  "info.fleet.incl.6": { en:"24/7 roadside assistance",    de:"24/7 Pannenhilfe" },

  // Maintenance card
  "info.fleet.maint.title": { en:"Maintenance Standard",   de:"Wartungsstandard" },
  "info.fleet.maint.body":  { en:"Professionally serviced every 3,000 km or 3 months. Inspected before each rental. Full safety systems check every trip.",
                              de:"Professionelle Wartung alle 3.000 km oder 3 Monate. Inspektion vor jeder Vermietung. Vollst\u00E4ndige Sicherheitspr\u00FCfung vor jeder Fahrt." },
  "info.fleet.maint.0.label": { en:"Service interval",      de:"Wartungsintervall" },
  "info.fleet.maint.1.label": { en:"Pre-trip check",        de:"Vor-Tour-Pr\u00FCfung" },
  "info.fleet.maint.2.label": { en:"Breakdown response",    de:"Reaktionszeit bei Pannen" },

  // Routes
  "info.route.0.name": { en:"Wine Roads Tour",     de:"Weinstra\u00DFen-Tour" },
  "info.route.0.tag":  { en:"1 Day - 220 EUR",     de:"1 Tag \u2013 220 EUR" },
  "info.route.0.desc": { en:"Start in Chisinau and ride through Moldova's famous wine heartland. Descend into the legendary Cricova underground wine cellars - 120 km of subterranean galleries housing millions of bottles.",
                         de:"Start in Chi\u0219in\u0103u und Fahrt durch Moldawiens ber\u00FChmtes Weinland. Abstieg in die legend\u00E4ren unterirdischen Weinkeller von Cricova \u2013 120 km Galerien mit Millionen Flaschen." },
  "info.route.0.i.0":  { en:"Cricova underground wine cellars", de:"Unterirdische Weinkeller Cricova" },
  "info.route.0.i.1":  { en:"Scenic vineyard roads",            de:"Landschaftliche Weinbergstra\u00DFen" },
  "info.route.0.i.2":  { en:"Traditional winery lunch",         de:"Traditionelles Mittagessen im Weingut" },
  "info.route.0.i.3":  { en:"Expert local guide",               de:"Lokaler Experten-Guide" },

  "info.route.1.name": { en:"Monasteries and History Tour",     de:"Kl\u00F6ster- und Geschichtstour" },
  "info.route.1.tag":  { en:"3 Days - 650 EUR",                 de:"3 Tage \u2013 650 EUR" },
  "info.route.1.desc": { en:"A three-day journey to Orheiul Vechi - a 6th-century monastery carved into limestone cliffs - then north along the Dniester canyon to Saharna, an 18th-century monastery above a dramatic waterfall.",
                         de:"Eine dreit\u00E4gige Reise nach Orheiul Vechi \u2013 ein Kloster aus dem 6. Jahrhundert in Kalksteinfelsen \u2013 und dann nach Norden entlang des Dnjestr-Canyons nach Saharna, einem Kloster aus dem 18. Jahrhundert oberhalb eines dramatischen Wasserfalls." },
  "info.route.1.i.0":  { en:"Orheiul Vechi cliff monastery",    de:"Felsenkloster Orheiul Vechi" },
  "info.route.1.i.1":  { en:"Dniester river valley route",      de:"Route durchs Dnjestr-Tal" },
  "info.route.1.i.2":  { en:"Saharna canyon",                   de:"Saharna-Schlucht" },
  "info.route.1.i.3":  { en:"Village overnight stays",          de:"\u00DCbernachtungen in D\u00F6rfern" },
  "info.route.1.i.4":  { en:"Full board included",              de:"Vollpension inklusive" },

  "info.route.2.name": { en:"The Grand Moldova Tour",           de:"Die gro\u00DFe Moldawien-Tour" },
  "info.route.2.tag":  { en:"5 Days - 1,050 EUR",               de:"5 Tage \u2013 1.050 EUR" },
  "info.route.2.desc": { en:"The full country traverse. Wine roads, cliff monasteries, a medieval Genoese fortress on the Ukrainian border, and a massive Ottoman citadel on the Dniester. Everything Moldova has to offer.",
                         de:"Die komplette Landesdurchquerung. Weinstra\u00DFen, Felsenkl\u00F6ster, eine mittelalterliche genuesische Festung an der ukrainischen Grenze und eine gewaltige osmanische Zitadelle am Dnjestr. Alles, was Moldawien zu bieten hat." },
  "info.route.2.i.0":  { en:"All 6 iconic stops",               de:"Alle 6 ikonischen Stopps" },
  "info.route.2.i.1":  { en:"Soroca medieval fortress",         de:"Mittelalterliche Festung Soroca" },
  "info.route.2.i.2":  { en:"Bender Ottoman citadel",           de:"Osmanische Zitadelle Bender" },
  "info.route.2.i.3":  { en:"5 days of pure riding",            de:"5 Tage reines Fahren" },
  "info.route.2.i.4":  { en:"Support vehicle throughout",       de:"Begleitfahrzeug durchgehend" },
  "info.route.2.i.5":  { en:"All meals and accommodation",      de:"Alle Mahlzeiten und Unterk\u00FCnfte" },

  // Safety items
  "info.safety.lic.0": { en:"Valid motorcycle license (Category A or A2)",
                         de:"G\u00FCltiger Motorradführerschein (Klasse A oder A2)" },
  "info.safety.lic.1": { en:"International permit for non-EU riders",
                         de:"Internationaler F\u00FChrerschein f\u00FCr Nicht-EU-Fahrer" },
  "info.safety.lic.2": { en:"Minimum 2 years riding experience",
                         de:"Mindestens 2 Jahre Fahrerfahrung" },
  "info.safety.lic.3": { en:"Experience on bikes over 500cc recommended",
                         de:"Erfahrung auf Motorr\u00E4dern \u00FCber 500 cm\u00B3 empfohlen" },
  "info.safety.age.0": { en:"Minimum age: 21 years old",
                         de:"Mindestalter: 21 Jahre" },
  "info.safety.age.1": { en:"Some bikes require 25+ years",
                         de:"F\u00FCr manche Motorr\u00E4der 25+ Jahre erforderlich" },
  "info.safety.age.2": { en:"Depends on motorcycle engine size",
                         de:"H\u00E4ngt von der Motorgr\u00F6\u00DFe ab" },
  "info.safety.age.3": { en:"No upper age limit",
                         de:"Keine Altersobergrenze" },
  "info.safety.gear.0": { en:"Full-face helmet (we provide)",
                          de:"Integralhelm (wird gestellt)" },
  "info.safety.gear.1": { en:"Protective riding jacket",
                          de:"Schutzjacke" },
  "info.safety.gear.2": { en:"Riding gloves (we provide)",
                          de:"Motorradhandschuhe (werden gestellt)" },
  "info.safety.gear.3": { en:"Long trousers or riding pants",
                          de:"Lange Hose oder Motorradhose" },
  "info.safety.gear.4": { en:"Sturdy closed-toe shoes or boots",
                          de:"Feste geschlossene Schuhe oder Stiefel" },

  // Last updated
  "info.terms.updated":  { en:"Last updated: April 2026. For full legal document contact",
                           de:"Zuletzt aktualisiert: April 2026. F\u00FCr das vollst\u00E4ndige Rechtsdokument kontaktieren Sie" },

  "info.final.h":    { en:"Ready to Ride Moldova?",   de:"Bereit, Moldawien zu erkunden?" },
  "info.final.p":    { en:"Limited spots available. Book early to secure your place on the road less travelled.",
                       de:"Begrenzte Pl\u00E4tze verf\u00FCgbar. Buchen Sie fr\u00FChzeitig und sichern Sie sich Ihren Platz auf der Stra\u00DFe, die kaum jemand kennt." },
  "info.final.book": { en:"Book Your Tour",   de:"Tour buchen" },
  "info.final.wa":   { en:"WhatsApp Us",      de:"WhatsApp" },

  // FAQ questions + answers (DE reviewed for grammar)
  "faq.q1":  { en:"Do I need a motorcycle license?",
               de:"Ben\u00F6tige ich einen Motorradführerschein?" },
  "faq.a1":  { en:"Yes. A valid motorcycle license (Category A or A2) is required for all tours and rentals. We verify this at check-in.",
               de:"Ja. F\u00FCr alle Touren und Vermietungen ist ein g\u00FCltiger Motorradführerschein (Kategorie A oder A2) erforderlich. Wir \u00FCberpr\u00FCfen diesen beim Check-in." },
  "faq.q2":  { en:"Do you offer guided tours?",
               de:"Bieten Sie gef\u00FChrte Touren an?" },
  "faq.a2":  { en:"Yes. We offer fully guided small-group tours with a local expert rider, as well as self-guided rentals for experienced riders who prefer to explore independently.",
               de:"Ja. Wir bieten vollst\u00E4ndig gef\u00FChrte Kleingruppen-Touren mit einem lokalen Expertenfahrer an, sowie selbst organisierte Vermietungen f\u00FCr erfahrene Fahrer, die lieber eigenst\u00E4ndig erkunden." },
  "faq.q3":  { en:"What is included in the rental?",
               de:"Was ist in der Miete inbegriffen?" },
  "faq.a3":  { en:"Every rental includes the motorcycle, helmet, gloves, phone/navigation mount, luggage system (top case or side panniers), and 24/7 roadside assistance.",
               de:"Jede Vermietung beinhaltet das Motorrad, Helm, Handschuhe, Halterung f\u00FCr Telefon/Navigation, Gep\u00E4cksystem (Topcase oder Seitentaschen) sowie 24/7 Pannenhilfe." },
  "faq.q4":  { en:"Do I need travel insurance?",
               de:"Ben\u00F6tige ich eine Reiseversicherung?" },
  "faq.a4":  { en:"We strongly recommend comprehensive travel insurance covering motorcycle riding. The motorcycle has basic third-party insurance included, but personal travel cover is your responsibility.",
               de:"Wir empfehlen dringend eine umfassende Reiseversicherung, die das Motorradfahren abdeckt. Das Motorrad verf\u00FCgt \u00FCber eine grundlegende Haftpflichtversicherung, aber der pers\u00F6nliche Reiseschutz liegt in Ihrer Verantwortung." },
  "faq.q5":  { en:"What happens in case of breakdown?",
               de:"Was passiert bei einer Panne?" },
  "faq.a5":  { en:"We provide roadside assistance and a support vehicle on all guided tours. For rentals, we respond within 2 hours anywhere in Moldova.",
               de:"Wir bieten Pannenhilfe und ein Begleitfahrzeug bei allen gef\u00FChrten Touren. Bei Vermietungen reagieren wir innerhalb von 2 Stunden in ganz Moldawien." },
  "faq.q6":  { en:"Can beginners join the tours?",
               de:"K\u00F6nnen Anf\u00E4nger an den Touren teilnehmen?" },
  "faq.a6":  { en:"Tours are designed for riders with at least 2 years of experience on bikes over 400cc. If you are a complete beginner, contact us and we will help you find the right option.",
               de:"Touren sind f\u00FCr Fahrer mit mindestens 2 Jahren Erfahrung auf Motorr\u00E4dern \u00FCber 400 cm\u00B3 ausgelegt. Wenn Sie ein kompletter Anf\u00E4nger sind, kontaktieren Sie uns und wir helfen Ihnen, die richtige Option zu finden." },
  "faq.q7":  { en:"How many riders are in a group?",
               de:"Wie viele Fahrer sind in einer Gruppe?" },
  "faq.a7":  { en:"Groups are capped at 6-8 riders to keep the experience personal. No crowded convoys - just a small group of passionate riders.",
               de:"Gruppen sind auf 6-8 Fahrer begrenzt, um ein pers\u00F6nliches Erlebnis zu gew\u00E4hrleisten. Keine \u00FCberf\u00FCllten Konvois \u2013 nur eine kleine Gruppe leidenschaftlicher Fahrer." },
  "faq.q8":  { en:"When is the best time to visit Moldova?",
               de:"Wann ist die beste Zeit, Moldawien zu besuchen?" },
  "faq.a8":  { en:"April through October is the ideal riding season. Late May through September offers the best weather. September harvest season is our personal favourite.",
               de:"April bis Oktober ist die ideale Fahrsaison. Von Ende Mai bis September ist das Wetter am besten. Die Erntezeit im September ist unser pers\u00F6nlicher Favorit." },

  // Terms sections
  "terms.booking.title":  { en:"Booking and Reservations",
                            de:"Buchung und Reservierungen" },
  "terms.booking.body":   { en:"Reservations must be made in advance through our website or by direct contact. A deposit may be required. Full payment must be completed before the start of the rental or tour. We accept credit card, bank transfer, and online payment.",
                            de:"Reservierungen m\u00FCssen im Voraus \u00FCber unsere Website oder durch direkten Kontakt erfolgen. Eine Anzahlung kann erforderlich sein. Die vollst\u00E4ndige Zahlung muss vor Beginn der Vermietung oder Tour abgeschlossen sein. Wir akzeptieren Kreditkarte, Banküberweisung und Online-Zahlung." },
  "terms.cancel.title":   { en:"Cancellations and Refunds",
                            de:"Stornierungen und R\u00FCckerstattungen" },
  "terms.cancel.body":    { en:"More than 14 days before the tour: full refund of deposit. 7-14 days: 50% refund. Under 7 days: no refund. In case of force majeure we will offer a full rebooking at no extra cost.",
                            de:"Mehr als 14 Tage vor der Tour: volle R\u00FCckerstattung der Anzahlung. 7-14 Tage: 50% R\u00FCckerstattung. Unter 7 Tagen: keine R\u00FCckerstattung. Bei h\u00F6herer Gewalt bieten wir eine kostenlose Umbuchung an." },
  "terms.rider.title":    { en:"Rider Responsibility",
                            de:"Verantwortung des Fahrers" },
  "terms.rider.body":     { en:"You are responsible for respecting local traffic laws, riding safely and sober, and returning the motorcycle in the same condition. Any damage caused by negligence or reckless riding will be charged to the renter at full repair cost.",
                            de:"Sie sind verantwortlich f\u00FCr die Einhaltung der lokalen Verkehrsregeln, sicheres und n\u00FCchternes Fahren sowie die R\u00FCckgabe des Motorrads im gleichen Zustand. Durch Fahrl\u00E4ssigkeit oder riskantes Fahren verursachte Sch\u00E4den werden dem Mieter in voller H\u00F6he der Reparaturkosten berechnet." },
  "terms.liability.title":{ en:"Liability",
                            de:"Haftung" },
  "terms.liability.body": { en:"Participants acknowledge that motorcycle riding carries inherent risks and agree to participate at their own responsibility. Moldova Moto Tours cannot be held liable for accidents resulting from rider negligence or violation of traffic laws.",
                            de:"Teilnehmer erkennen an, dass das Motorradfahren inhärente Risiken birgt, und stimmen der Teilnahme auf eigene Verantwortung zu. Moldova Moto Tours haftet nicht f\u00FCr Unf\u00E4lle, die auf Fahrl\u00E4ssigkeit des Fahrers oder Verletzung von Verkehrsregeln zur\u00FCckzuf\u00FChren sind." },
  "terms.insurance.title":{ en:"Insurance",
                            de:"Versicherung" },
  "terms.insurance.body": { en:"All rentals include mandatory third-party insurance as required by Moldovan law. Comprehensive coverage is the rider's responsibility unless an upgrade is purchased. We strongly recommend personal travel insurance covering motorcycle activities.",
                            de:"Alle Vermietungen beinhalten die nach moldauischem Recht vorgeschriebene Haftpflichtversicherung. Eine Vollkaskoversicherung liegt in der Verantwortung des Fahrers, sofern kein Upgrade erworben wird. Wir empfehlen dringend eine pers\u00F6nliche Reiseversicherung, die Motorradaktivit\u00E4ten abdeckt." },

  // Hero (extra)
  "hero.h1.line1": { en:"Discover Moldova",     de:"Entdecken Sie Moldawien" },
  "hero.h1.line2": { en:"on Two Wheels",        de:"auf zwei R\u00E4dern" },
  "hero.desc":     { en:"Guided motorcycle tours through vineyards, cliff monasteries, and the hidden roads of Eastern Europe \u2014 on a premium adventure bike.",
                     de:"Gef\u00FChrte Motorradtouren durch Weinberge, Felsenkl\u00F6ster und die versteckten Stra\u00DFen Osteuropas \u2014 auf einem Premium-Adventure-Motorrad." },
  "hero.btn.book":   { en:"Book Your Tour \u2192", de:"Tour buchen \u2192" },
  "hero.btn.routes": { en:"View Routes",            de:"Routen ansehen" },
  "hero.stat.0.num":   { en:"300+",  de:"300+" },
  "hero.stat.0.label": { en:"Riders Guided",       de:"Begleitete Fahrer" },
  "hero.stat.1.num":   { en:"4.9\u2605", de:"4,9\u2605" },
  "hero.stat.1.label": { en:"Average Rating",      de:"Durchschnittsbewertung" },
  "hero.stat.2.num":   { en:"3",     de:"3" },
  "hero.stat.2.label": { en:"Tour Lengths",        de:"Tourl\u00E4ngen" },
  "hero.stat.3.num":   { en:"100%",  de:"100%" },
  "hero.stat.3.label": { en:"Licensed Guides",     de:"Lizenzierte Guides" },
  "hero.scroll":       { en:"Scroll", de:"Scrollen" },

  // Experience section
  "exp.kicker":  { en:"Why Moldova",         de:"Warum Moldawien" },
  "exp.title.1": { en:"Europe's Best-Kept",   de:"Europas bestgeh\u00FCtetes" },
  "exp.title.2": { en:"Riding Secret",        de:"Fahrgeheimnis" },
  "exp.desc":    { en:"Uncrowded roads, genuine hospitality, and scenery that rivals Tuscany \u2014 at a fraction of the price.",
                   de:"Leere Stra\u00DFen, echte Gastfreundschaft und Landschaften, die es mit der Toskana aufnehmen k\u00F6nnen \u2014 zu einem Bruchteil des Preises." },

  // Feature cards
  "feature.0.title": { en:"Adventure Riding",     de:"Adventure-Fahren" },
  "feature.0.desc":  { en:"Tackle Moldova's secret backroads, limestone ridges, and river canyon passes \u2014 routes you won't find on any travel blog.",
                       de:"Erobern Sie Moldawiens geheime Nebenstra\u00DFen, Kalksteinkanten und Flussschluchten-P\u00E4sse \u2014 Routen, die in keinem Reiseblog stehen." },
  "feature.1.title": { en:"Local Expert Guide",   de:"Lokaler Experten-Guide" },
  "feature.1.desc":  { en:"Your guide is a native Moldovan rider who knows every shortcut, every hidden winery, and every story behind the ruins.",
                       de:"Ihr Guide ist ein einheimischer moldauischer Fahrer, der jede Abk\u00FCrzung, jedes versteckte Weingut und jede Geschichte hinter den Ruinen kennt." },
  "feature.2.title": { en:"Premium Motorcycles",  de:"Premium-Motorr\u00E4der" },
  "feature.2.desc":  { en:"Ride the CFMOTO 800MT \u2014 a touring-class adventure bike with ABS, traction control, and heated grips for total comfort.",
                       de:"Fahren Sie die CFMOTO 800MT \u2014 ein Touring-Adventure-Motorrad mit ABS, Traktionskontrolle und Heizgriffen f\u00FCr maximalen Komfort." },
  "feature.3.title": { en:"Unique Routes",        de:"Einzigartige Routen" },
  "feature.3.desc":  { en:"Every itinerary is handcrafted. Avoid tourist trails entirely and discover the Moldova that 99% of visitors never see.",
                       de:"Jede Route ist handverlesen. Meiden Sie Touristenpfade und entdecken Sie das Moldawien, das 99\u202F% der Besucher nie zu sehen bekommen." },

  // Tours section
  "tours.kicker":   { en:"Choose Your Adventure", de:"W\u00E4hlen Sie Ihr Abenteuer" },
  "tours.h1":       { en:"Our Tours",              de:"Unsere Touren" },
  "tours.empty":    { en:"Tours coming soon \u2014 check back shortly.",
                      de:"Touren in K\u00FCrze verf\u00FCgbar \u2014 schauen Sie bald wieder vorbei." },
  "tours.bookNow":  { en:"Book Now \u2192",        de:"Jetzt buchen \u2192" },

  // Fleet (extra)
  "fleet.descLong": { en:"The CFMOTO 800MT is our chosen mount for Moldova's diverse terrain \u2014 from smooth vineyard lanes to the rugged riverside tracks of the Nistru canyon. Powerful, comfortable, and loaded with touring tech.",
                      de:"Die CFMOTO 800MT ist unser Motorrad f\u00FCr Moldawiens vielf\u00E4ltiges Gel\u00E4nde \u2014 von glatten Weinbergstra\u00DFen bis zu den rauen Flusswegen des Nistru-Canyons. Leistungsstark, komfortabel und vollgepackt mit Touring-Technik." },
  "fleet.spec.0.label": { en:"Twin-Cylinder", de:"Zweizylinder" },
  "fleet.spec.1.label": { en:"Peak Power",    de:"Spitzenleistung" },
  "fleet.spec.2.label": { en:"Daily Range",   de:"Tagesreichweite" },
  "fleet.allInclusive": { en:"All-Inclusive", de:"Alles inklusive" },
  "fleet.extraBike":    { en:"Extra Bike Fee", de:"Aufpreis Motorrad" },

  // Map section
  "map.kicker":   { en:"Tour Routes",      de:"Tour-Routen" },
  "map.h1":       { en:"The Moldova Map",  de:"Die Moldawien-Karte" },
  "map.lead":     { en:"Real map powered by OpenStreetMap. Click any stop to fly to it.",
                    de:"Echte Karte mit OpenStreetMap. Klicken Sie auf einen Stopp, um dorthin zu fliegen." },
  "map.hint":     { en:"Every pin is placed at its real GPS coordinates. Click a card or pin to zoom in.",
                    de:"Jeder Pin sitzt an seinen echten GPS-Koordinaten. Klicken Sie auf eine Karte oder einen Pin, um hineinzuzoomen." },
  "map.cov.1d":   { en:"1-Day", de:"1-Tag" },
  "map.cov.3d":   { en:"3-Day", de:"3-Tage" },
  "map.cov.5d":   { en:"5-Day", de:"5-Tage" },
  "map.cov.1d.route": { en:"Chi\u0219in\u0103u \u2192 Cricova \u2192 Chi\u0219in\u0103u",
                        de:"Chi\u0219in\u0103u \u2192 Cricova \u2192 Chi\u0219in\u0103u" },
  "map.cov.3d.route": { en:"Chi\u0219in\u0103u \u2192 Orheiul Vechi \u2192 Saharna",
                        de:"Chi\u0219in\u0103u \u2192 Orheiul Vechi \u2192 Saharna" },
  "map.cov.5d.route": { en:"Full country \u2014 all 6 stops",
                        de:"Ganzes Land \u2014 alle 6 Stopps" },

  // Map stops
  "map.stop.0.label": { en:"Capital City",              de:"Hauptstadt" },
  "map.stop.0.sub":   { en:"Tour Start / End",          de:"Tour Start / Ende" },
  "map.stop.0.desc":  { en:"Your tour begins in Moldova's vibrant capital. Pick up your CFMOTO 800MT, meet your guide, and ride out.",
                        de:"Ihre Tour beginnt in Moldawiens lebendiger Hauptstadt. Holen Sie Ihre CFMOTO 800MT ab, treffen Sie Ihren Guide und fahren Sie los." },
  "map.stop.1.label": { en:"Cliff Monastery",           de:"Felsenkloster" },
  "map.stop.1.sub":   { en:"\u2605 Unmissable",         de:"\u2605 Unverzichtbar" },
  "map.stop.1.desc":  { en:"A 6th-century monastery carved into limestone cliffs above the R\u0103ut River \u2014 one of Europe's most dramatic natural amphitheatres.",
                        de:"Ein Kloster aus dem 6. Jahrhundert, in die Kalksteinfelsen \u00FCber dem Fluss R\u0103ut gehauen \u2014 eines der eindrucksvollsten Naturamphitheater Europas." },
  "map.stop.2.label": { en:"Underground Wine City",     de:"Unterirdische Weinstadt" },
  "map.stop.2.sub":   { en:"1-Day Tour",                de:"1-Tages-Tour" },
  "map.stop.2.desc":  { en:"120 km of underground galleries turned wine cellar. The Soviet-era labyrinth holds millions of bottles beneath rolling vineyards.",
                        de:"120 km unterirdische Galerien, umgewandelt in einen Weinkeller. Das Labyrinth aus der Sowjetzeit beherbergt Millionen Flaschen unter sanften Weinbergen." },
  "map.stop.3.label": { en:"Nistru Canyon & Monastery", de:"Nistru-Canyon & Kloster" },
  "map.stop.3.sub":   { en:"3 & 5-Day Tour",            de:"3- & 5-Tages-Tour" },
  "map.stop.3.desc":  { en:"An 18th-century monastery tucked above a dramatic Dniester canyon waterfall. Remote, pristine, and completely unforgettable.",
                        de:"Ein Kloster aus dem 18. Jahrhundert oberhalb eines dramatischen Wasserfalls im Dnjestr-Canyon. Abgelegen, urspr\u00FCnglich und absolut unvergesslich." },
  "map.stop.4.label": { en:"Medieval Fortress",         de:"Mittelalterliche Festung" },
  "map.stop.4.sub":   { en:"5-Day Tour",                de:"5-Tages-Tour" },
  "map.stop.4.desc":  { en:"Moldova's perfectly preserved 16th-century Genoese-Ottoman fortress, sitting on the Dniester riverbank at the Ukrainian border.",
                        de:"Moldawiens perfekt erhaltene genuesisch-osmanische Festung aus dem 16. Jahrhundert am Ufer des Dnjestr an der ukrainischen Grenze." },
  "map.stop.5.label": { en:"Ottoman Fortress",          de:"Osmanische Festung" },
  "map.stop.5.sub":   { en:"5-Day Tour",                de:"5-Tages-Tour" },
  "map.stop.5.desc":  { en:"A massive 16th-century Ottoman citadel commanding the Dniester with centuries of turbulent history etched into every stone bastion.",
                        de:"Eine gewaltige osmanische Zitadelle aus dem 16. Jahrhundert am Dnjestr \u2014 jahrhundertealte Geschichte ist in jede Steinbastion eingraviert." },

  // Testimonials
  "testi.kicker":  { en:"Rider Reviews",          de:"Fahrerbewertungen" },
  "testi.h1":      { en:"Straight from the Saddle", de:"Direkt aus dem Sattel" },
  "testi.0.text":  { en:"One of the best motorcycle tours in all of Europe. The Orheiul Vechi section at sunset was absolutely breathtaking. Already planning to return for the 5-day tour.",
                     de:"Eine der besten Motorradtouren in ganz Europa. Der Abschnitt bei Orheiul Vechi im Sonnenuntergang war absolut atemberaubend. Wir planen bereits die R\u00FCckkehr f\u00FCr die 5-Tages-Tour." },
  "testi.0.country": { en:"Germany \uD83C\uDDE9\uD83C\uDDEA", de:"Deutschland \uD83C\uDDE9\uD83C\uDDEA" },
  "testi.1.text":  { en:"I was skeptical about Moldova, but this experience completely changed my view of Eastern Europe. The CFMOTO handled the roads perfectly, and our guide was outstanding.",
                     de:"Ich war skeptisch gegen\u00FCber Moldawien, aber diese Erfahrung hat mein Bild von Osteuropa v\u00F6llig ver\u00E4ndert. Die CFMOTO meisterte die Stra\u00DFen perfekt, und unser Guide war herausragend." },
  "testi.1.country": { en:"France \uD83C\uDDEB\uD83C\uDDF7", de:"Frankreich \uD83C\uDDEB\uD83C\uDDF7" },
  "testi.2.text":  { en:"Excellent organisation, premium bike, genuine local experiences. The Cricova wine cellar visit was surreal \u2014 120km of underground wine roads. Unforgettable.",
                     de:"Hervorragende Organisation, Premium-Motorrad, authentische lokale Erlebnisse. Der Besuch im Weinkeller von Cricova war surreal \u2014 120 km unterirdische Weinstra\u00DFen. Unvergesslich." },
  "testi.2.country": { en:"Italy \uD83C\uDDEE\uD83C\uDDF9", de:"Italien \uD83C\uDDEE\uD83C\uDDF9" },

  // CTA band
  "cta.h1":   { en:"Your Adventure Starts Here", de:"Ihr Abenteuer beginnt hier" },
  "cta.desc": { en:"Limited spots per departure. Reserve your seat before they're gone.",
                de:"Begrenzte Pl\u00E4tze pro Abfahrt. Sichern Sie sich Ihren Platz, bevor er weg ist." },
  "cta.book": { en:"Book Your Tour \u2192",     de:"Tour buchen \u2192" },

  // Footer
  "footer.brand.name": { en:"Moldova Moto Tours", de:"Moldova Moto Tours" },
  "footer.brand.tag":  { en:"The Last Untamed Roads of Europe",
                         de:"Die letzten wilden Stra\u00DFen Europas" },
  "footer.brand.desc": { en:"The premier guided motorcycle tour company in Moldova. Connecting international riders with Eastern Europe's most authentic hidden roads since 2019.",
                         de:"Der f\u00FChrende Anbieter f\u00FCr gef\u00FChrte Motorradtouren in Moldawien. Verbindet internationale Fahrer seit 2019 mit Osteuropas authentischsten versteckten Stra\u00DFen." },
  "footer.h.tours":   { en:"Tours",         de:"Touren" },
  "footer.h.info":    { en:"Info",          de:"Info" },
  "footer.h.message": { en:"Send a Message", de:"Nachricht senden" },
  "footer.form.name":   { en:"Your name",    de:"Ihr Name" },
  "footer.form.email":  { en:"Email address", de:"E-Mail-Adresse" },
  "footer.form.msg":    { en:"Your question or message\u2026",
                          de:"Ihre Frage oder Nachricht\u2026" },
  "footer.form.send":   { en:"Send Message", de:"Nachricht senden" },
  "footer.sent.h":      { en:"Message sent!", de:"Nachricht gesendet!" },
  "footer.sent.p":      { en:"We'll reply within 24 hours.",
                          de:"Wir antworten innerhalb von 24 Stunden." },

  // Booking modal (extra hardcoded strings)
  "book.modal.title":   { en:"Book Your Tour", de:"Tour buchen" },
  "book.s0.empty":      { en:"No active tours available right now.",
                          de:"Derzeit sind keine Touren verf\u00FCgbar." },
  "book.s0.selected":   { en:"SELECTED", de:"AUSGEW\u00C4HLT" },
  "book.s1.openTitle":  { en:"Choose your rental period", de:"W\u00E4hlen Sie Ihren Mietzeitraum" },
  "book.s1.openSub":    { en:"Select a start and end date \u2014 your bike is reserved for the entire period.",
                          de:"W\u00E4hlen Sie ein Start- und Enddatum \u2014 Ihr Motorrad wird f\u00FCr den gesamten Zeitraum reserviert." },
  "book.s1.day":        { en:"day",  de:"Tag" },
  "book.s1.days":       { en:"days", de:"Tage" },
  "book.s1.schedTitle": { en:"Select a departure date", de:"W\u00E4hlen Sie ein Abfahrtsdatum" },
  "book.s1.schedSub":   { en:"upcoming departures \u2014 spots decrease as bookings are confirmed.",
                          de:"bevorstehende Abfahrten \u2014 Pl\u00E4tze nehmen mit jeder Buchung ab." },
  "book.s1.schedSubOne":{ en:"upcoming departure \u2014 spots decrease as bookings are confirmed.",
                          de:"bevorstehende Abfahrt \u2014 Pl\u00E4tze nehmen mit jeder Buchung ab." },
  "book.s1.empty":      { en:"No upcoming departures scheduled yet. Contact us to arrange a custom date.",
                          de:"Derzeit sind keine Abfahrten geplant. Kontaktieren Sie uns f\u00FCr einen individuellen Termin." },
  "book.s1.departs":    { en:"departs Chi\u0219in\u0103u", de:"Abfahrt Chi\u0219in\u0103u" },
  "book.s1.full":       { en:"FULL", de:"AUSGEBUCHT" },
  "book.s1.spotLeft":   { en:"spot left",  de:"Platz frei" },
  "book.s1.spotsLeft":  { en:"spots left", de:"Pl\u00E4tze frei" },
  "book.s1.of":         { en:"of",   de:"von" },
  "book.s2.subDate":    { en:"Showing bikes available for your selected dates.",
                          de:"Es werden Motorr\u00E4der angezeigt, die f\u00FCr Ihre Daten verf\u00FCgbar sind." },
  "book.s2.subNoDate":  { en:"Select an available motorcycle from our fleet.",
                          de:"W\u00E4hlen Sie ein verf\u00FCgbares Motorrad aus unserer Flotte." },
  "book.s2.errSuffix":  { en:"\u2014 please choose a different motorcycle.",
                          de:"\u2014 bitte w\u00E4hlen Sie ein anderes Motorrad." },
  "book.s2.empty":      { en:"No bikes available for your selected dates \u2014 all are booked. Please try different dates or contact us directly.",
                          de:"Keine Motorr\u00E4der f\u00FCr Ihre Daten verf\u00FCgbar \u2014 alle sind gebucht. Bitte w\u00E4hlen Sie andere Daten oder kontaktieren Sie uns direkt." },
  "book.s2.bookedOn":   { en:"Booked", de:"Gebucht" },
  "book.s2.note":       { en:"All motorcycles include comprehensive insurance, gear rental option, and 24/7 roadside support.",
                          de:"Alle Motorr\u00E4der beinhalten Vollkaskoversicherung, optionalen Ausr\u00FCstungsverleih und 24/7-Pannenhilfe." },
  "book.s3.label.name":   { en:"Full Name",        de:"Vollst\u00E4ndiger Name" },
  "book.s3.label.email":  { en:"Email Address",    de:"E-Mail-Adresse" },
  "book.s3.label.phone":  { en:"Phone / WhatsApp", de:"Telefon / WhatsApp" },
  "book.s3.label.country":{ en:"Country",          de:"Land" },
  "book.s3.label.exp":    { en:"Riding Experience", de:"Fahrerfahrung" },
  "book.s3.ph.name":      { en:"e.g. Hans M\u00FCller", de:"z.\u202FB. Hans M\u00FCller" },
  "book.s3.ph.email":     { en:"you@example.com",  de:"sie@beispiel.de" },
  "book.s3.ph.phone":     { en:"+49 ...",          de:"+49 ..." },
  "book.s3.ph.country":   { en:"Germany",          de:"Deutschland" },
  "book.s4.title":      { en:"Review & Confirm",   de:"\u00DCberpr\u00FCfen & Best\u00E4tigen" },
  "book.s4.licStrong":  { en:"I confirm I hold a valid motorcycle license",
                          de:"Ich best\u00E4tige, dass ich einen g\u00FCltigen Motorradführerschein besitze" },
  "book.s4.licNote":    { en:"I understand that a motorcycle license (minimum Category A2) is required for all tours and will be verified at check-in. Riders without a valid license will not be permitted to participate.",
                          de:"Ich verstehe, dass f\u00FCr alle Touren ein Motorradführerschein (mindestens Klasse A2) erforderlich ist und beim Check-in \u00FCberpr\u00FCft wird. Fahrer ohne g\u00FCltigen F\u00FChrerschein werden nicht zur Teilnahme zugelassen." },
  "book.btn.continue":  { en:"Continue", de:"Weiter" },
  "book.done.bookingId":{ en:"BOOKING ID:", de:"BUCHUNGS-ID:" },
  "book.done.full":     { en:"Your reservation request for {tour} has been received. We'll confirm within 24 hours via email to {email}.",
                          de:"Ihre Buchungsanfrage f\u00FCr {tour} ist eingegangen. Wir best\u00E4tigen innerhalb von 24 Stunden per E-Mail an {email}." },
  "book.done.waLine":   { en:"WhatsApp us for faster confirmation:",
                          de:"Schreiben Sie uns auf WhatsApp f\u00FCr schnellere Best\u00E4tigung:" },
  "book.done.backTours":{ en:"Back to Tours", de:"Zur\u00FCck zu den Touren" },

  // Footer SEO
  "footer.copyChisinau": { en:"Chi\u0219in\u0103u, Republic of Moldova",
                           de:"Chi\u0219in\u0103u, Republik Moldau" },
  "footer.seo.label":    { en:"SEO:", de:"SEO:" },
  "footer.seo.tags":     { en:"Motorcycle Tours Moldova \u00B7 Adventure Riding Eastern Europe \u00B7 CFMOTO Rental Moldova",
                           de:"Motorradtouren Moldawien \u00B7 Adventure-Riding Osteuropa \u00B7 CFMOTO-Vermietung Moldawien" },
};

export default T;
