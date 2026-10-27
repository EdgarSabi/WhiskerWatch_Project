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

// Haalt een datum als 29-09-2026 uit een stuk tekst (dag-maand-jaar). Lukt dat
// niet, dan geven we null terug. Dit werkt voor de datum die je zelf typt én
// voor createdAt, want die begint ook met dag-maand-jaar.
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

// De datum van een observatie: eerst de datum die je zelf hebt ingevuld. Is die
// leeg of niet te lezen, dan het moment waarop de observatie is opgeslagen.
export function getObservationDate(observation) {
  const enteredDate = parseDate(observation.date);
  if (enteredDate !== null) {
    return enteredDate;
  }

  return parseDate(observation.createdAt);
}

// Hoeveel dagen geleden was dit? 0 = vandaag, 1 = gisteren, enzovoort.
function getDaysAgo(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - date.getTime()) / MS_PER_DAY);
}

// Hoort de observatie bij de gekozen periode? Bij "Alles" altijd. Kunnen we de
// datum niet bepalen, dan laten we de observatie bij een periode weg.
export function isInPeriod(observation, periodId) {
  if (periodId === "all") {
    return true;
  }

  const date = getObservationDate(observation);
  if (date === null) {
    return false;
  }

  const daysAgo = getDaysAgo(date);

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
  const date = getObservationDate(observation);
  if (date === null) {
    return getWhen(observation);
  }

  const daysAgo = getDaysAgo(date);
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

// Een getal om observaties op volgorde van datum (en tijd) te zetten.
export function getSortValue(observation) {
  const date = getObservationDate(observation);
  const dayValue = date === null ? 0 : date.getTime();

  let minutes = 0;
  const timeMatch = observation.time ? observation.time.match(/(\d{1,2})\D(\d{2})/) : null;
  if (timeMatch !== null) {
    minutes = Number(timeMatch[1]) * 60 + Number(timeMatch[2]);
  }

  return dayValue + minutes * 60 * 1000;
}

// Datum en tijd zijn zelf ingevoerd en mogen leeg zijn. Is dat zo, dan tonen we
// het moment waarop de observatie is opgeslagen.
export function getWhen(observation) {
  if (observation.date !== "" || observation.time !== "") {
    return `${observation.date} ${observation.time}`.trim();
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
