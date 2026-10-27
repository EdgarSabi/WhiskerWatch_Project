// Gewone hulpfuncties voor observaties. Ze worden gebruikt door TimelineScreen
// en VetOverviewScreen, zodat de samenvatting en de periodelogica maar op één
// plek staan. Er zit geen state of React in: het zijn gewoon functies.

// De keuzes voor de periode. De id gebruiken we in isInPeriod hieronder.
export const PERIOD_OPTIONS = [
  { id: "all", label: "Alles" },
  { id: "today", label: "Vandaag" },
  { id: "7days", label: "Laatste 7 dagen" },
  { id: "30days", label: "Laatste 30 dagen" },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ---------- Datum en tijd ----------

// Nieuwe observaties bewaren het moment waarop het gebeurde als ÉÉN waarde:
// observedAt, een ISO-tekst zoals "2026-10-27T12:30:00.000Z". Die is betrouwbaar
// te sorteren en we maken er alleen voor de weergave een leesbare tekst van.
// Oudere observaties hebben nog losse tekstvelden date en time (en createdAt);
// daar vallen we op terug.

function pad(number) {
  return String(number).padStart(2, "0");
}

// 27-10-2026
export function formatDate(date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

// 14:30
export function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Zet de ISO-tekst om naar een Date. Is de tekst leeg of ongeldig, dan null.
function parseObservedAt(text) {
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return isNaN(date.getTime()) ? null : date;
}

// Haalt een datum als 29-09-2026 uit een stuk tekst (dag-maand-jaar). Lukt dat
// niet, dan geven we null terug. Dit werkt voor de datum die je vroeger zelf
// typte én voor createdAt, want die begint ook met dag-maand-jaar.
function parseDate(text) {
  if (!text) {
    return null;
  }

  const match = text.match(/(\d{1,2})\D(\d{1,2})\D(\d{4})/);
  if (match === null) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }

  return new Date(year, month - 1, day);
}

// Datum + tijd uit twee stukken tekst. Is er geen tijd te lezen, dan blijft het
// 00:00. We zoeken een tijd met een dubbele punt (14:30), zodat de cijfers van
// de datum er niet voor worden aangezien.
function parseDateTime(dateText, timeText) {
  const date = parseDate(dateText);
  if (date === null) {
    return null;
  }

  const timeMatch = timeText ? timeText.match(/(\d{1,2})[:.](\d{2})/) : null;
  if (timeMatch !== null) {
    date.setHours(Number(timeMatch[1]), Number(timeMatch[2]));
  }

  return date;
}

// Het moment waarop de observatie is gebeurd, voor de tijdlijn, het
// dierenartsoverzicht en de periodefilters. In deze volgorde:
// 1. observedAt (alle nieuwe observaties)
// 2. de losse date + time van oudere observaties
// 3. het moment waarop de observatie is opgeslagen (createdAt)
// Lukt niets, dan geven we null terug.
export function getObservedAt(observation) {
  const observedAt = parseObservedAt(observation.observedAt);
  if (observedAt !== null) {
    return observedAt;
  }

  const enteredDateTime = parseDateTime(observation.date, observation.time);
  if (enteredDateTime !== null) {
    return enteredDateTime;
  }

  return parseDateTime(observation.createdAt, observation.createdAt);
}

// De startwaarde voor de datum- en tijdkiezer in een formulier: het moment van
// de observatie die je bewerkt, of anders nu.
export function getInitialObservedAt(observationToEdit) {
  if (!observationToEdit) {
    return new Date();
  }

  return getObservedAt(observationToEdit) ?? new Date();
}

// Hoeveel dagen geleden was dit? 0 = vandaag, 1 = gisteren, enzovoort. We
// vergelijken hele dagen, dus het tijdstip maakt hier niet uit.
function getDaysAgo(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((today.getTime() - day.getTime()) / MS_PER_DAY);
}

// Hoort de observatie bij de gekozen periode? Bij "Alles" altijd. Kunnen we de
// datum niet bepalen, dan laten we de observatie bij een periode weg.
export function isInPeriod(observation, periodId) {
  if (periodId === "all") {
    return true;
  }

  const observedAt = getObservedAt(observation);
  if (observedAt === null) {
    return false;
  }

  const daysAgo = getDaysAgo(observedAt);

  if (periodId === "today") {
    return daysAgo === 0;
  }
  if (periodId === "7days") {
    return daysAgo >= 0 && daysAgo <= 7;
  }
  if (periodId === "30days") {
    return daysAgo >= 0 && daysAgo <= 30;
  }

  return true;
}

// "vandaag", "gisteren" of "3 dagen geleden". Kunnen we de datum niet bepalen
// (of ligt hij in de toekomst), dan tonen we gewoon datum en tijd.
function getRelativeText(observation) {
  const observedAt = getObservedAt(observation);
  if (observedAt === null) {
    return getWhen(observation);
  }

  const daysAgo = getDaysAgo(observedAt);
  if (daysAgo === 0) {
    return "vandaag";
  }
  if (daysAgo === 1) {
    return "gisteren";
  }
  if (daysAgo > 1) {
    return `${daysAgo} dagen geleden`;
  }

  return getWhen(observation);
}

// De regel onder de naam van een kat op het dashboard en het profiel. We
// krijgen de observaties van ÉÉN kat binnen en zoeken de meest recente.
export function getLastObservationText(catObservations) {
  if (catObservations.length === 0) {
    return "Nog geen observaties";
  }

  let lastObservation = catObservations[0];
  for (const observation of catObservations) {
    // >= zodat bij gelijke datum de laatst opgeslagen observatie wint.
    if (getSortValue(observation) >= getSortValue(lastObservation)) {
      lastObservation = observation;
    }
  }

  return `Laatst: ${lastObservation.type} · ${getRelativeText(lastObservation)}`;
}

// Een getal om observaties op volgorde van gebeurtenis te zetten: hoe groter,
// hoe recenter. Dit gebruiken de tijdlijn, het dierenartsoverzicht en de regel
// "Laatst: ..." allemaal.
export function getSortValue(observation) {
  const observedAt = getObservedAt(observation);
  return observedAt === null ? 0 : observedAt.getTime();
}

// De leesbare tekst bij een observatie, zoals "27-10-2026 14:30". Oudere
// observaties tonen de datum en tijd die erbij stonden, of anders het moment
// waarop ze zijn opgeslagen.
export function getWhen(observation) {
  const observedAt = parseObservedAt(observation.observedAt);
  if (observedAt !== null) {
    return `${formatDate(observedAt)} ${formatTime(observedAt)}`;
  }

  if (observation.date || observation.time) {
    return `${observation.date ?? ""} ${observation.time ?? ""}`.trim();
  }
  return observation.createdAt;
}

// ---------- Samenvatting ----------

// Zet de notitie (als die er is) achter de samenvatting.
function addNote(summary, observation) {
  if (observation.note) {
    return `${summary} · ${observation.note}`;
  }
  return summary;
}

// Korte samenvatting per type. We laten alleen zien wat is ingevuld en trekken
// geen conclusies.
export function getSummary(observation) {
  if (observation.type === "Ontlasting") {
    let summary = observation.consistency;

    if (observation.bloodSeen === "Ja") {
      summary += " · bloed";
    }
    if (observation.mucusSeen === "Ja") {
      summary += " · slijm";
    }
    if (observation.outsideLitterBox === "Ja") {
      summary += " · buiten kattenbak";
    }

    return addNote(summary, observation);
  }

  if (observation.type === "Braken") {
    return addNote(observation.vomitKind, observation);
  }

  if (observation.type === "Eten & drinken") {
    return addNote(observation.intake, observation);
  }

  if (observation.type === "Medicatie") {
    let summary = observation.medicationName;

    if (observation.dosage) {
      summary += ` · ${observation.dosage}`;
    }

    return addNote(summary, observation);
  }

  if (observation.type === "Gewicht") {
    return `${String(observation.weightKg).replace(".", ",")} kg`;
  }

  // Gedrag en Algemene notitie: de tekst zelf is de samenvatting.
  return observation.note;
}
