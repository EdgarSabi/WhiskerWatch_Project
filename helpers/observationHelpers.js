export const PERIOD_OPTIONS = [
  { id: "all", label: "Alles" },
  { id: "today", label: "Vandaag" },
  { id: "7days", label: "Laatste 7 dagen" },
  { id: "30days", label: "Laatste 30 dagen" },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const MONTHS = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

// nieuwe observaties hebben observedAt (ISO-tekst), dat sorteert betrouwbaar
// oude observaties hebben nog losse date/time (en createdAt), daar vallen we op terug

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

function parseObservedAt(text) {
  if (!text) {
    return null;
  }

  const date = new Date(text);
  return isNaN(date.getTime()) ? null : date;
}

// haalt dag-maand-jaar uit tekst, werkt ook voor createdAt (begint ook zo)
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

// geen tijd te lezen? Dan 00:00. Zoeken met een dubbele punt (14:30), anders
// worden de cijfers van de datum voor een tijd aangezien
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

// wanneer het gebeurde: eerst observedAt, dan de oude date + time, dan createdAt, anders null
function getObservedAt(observation) {
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

// startwaarde voor de kiezers: het moment van de observatie die je bewerkt, anders nu
export function getInitialObservedAt(observationToEdit) {
  if (!observationToEdit) {
    return new Date();
  }

  return getObservedAt(observationToEdit) ?? new Date();
}

// 0 = vandaag, 1 = gisteren, enzovoort. Hele dagen vergelijken, de tijd maakt niet uit
function getDaysAgo(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((today.getTime() - day.getTime()) / MS_PER_DAY);
}

// zonder bruikbare datum valt een observatie bij een periode buiten de boot
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

// vandaag, gisteren of "3 dagen geleden", anders gewoon datum en tijd
export function getRelativeText(observation) {
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

export function getLastObservation(catObservations) {
  if (catObservations.length === 0) {
    return null;
  }

  let lastObservation = catObservations[0];
  for (const observation of catObservations) {
    // >= zodat bij gelijk moment de laatst opgeslagen wint
    if (getSortValue(observation) >= getSortValue(lastObservation)) {
      lastObservation = observation;
    }
  }

  return lastObservation;
}

// hoe groter, hoe recenter. Voor sorteren in de tijdlijn, het overzicht en "Laatst"
export function getSortValue(observation) {
  const observedAt = getObservedAt(observation);
  return observedAt === null ? 0 : observedAt.getTime();
}

// bijv. "27-10-2026 14:30". Oude observaties tonen wat erbij stond, anders createdAt
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

// alleen de tijd voor op een tijdlijnkaart (de datum staat al in de kop van de dag)
export function getTimeText(observation) {
  const observedAt = parseObservedAt(observation.observedAt);
  if (observedAt !== null) {
    return formatTime(observedAt);
  }

  return observation.time ?? "";
}

// kop boven een groep: Vandaag, Gisteren of 24 oktober 2026
function getDayTitle(observation) {
  const observedAt = getObservedAt(observation);
  if (observedAt === null) {
    return "Datum onbekend";
  }

  const daysAgo = getDaysAgo(observedAt);
  if (daysAgo === 0) {
    return "Vandaag";
  }
  if (daysAgo === 1) {
    return "Gisteren";
  }

  return `${observedAt.getDate()} ${MONTHS[observedAt.getMonth()]} ${observedAt.getFullYear()}`;
}

// groepen per dag voor SectionList: [{ title, data }]. De lijst is al gesorteerd,
// dus we hoeven alleen te kijken of de kop gelijk is aan die van de vorige
export function groupByDay(sortedObservations) {
  const sections = [];

  for (const observation of sortedObservations) {
    const title = getDayTitle(observation);
    const lastSection = sections[sections.length - 1];

    if (lastSection && lastSection.title === title) {
      lastSection.data.push(observation);
    } else {
      sections.push({ title: title, data: [observation] });
    }
  }

  return sections;
}

// nieuwste eerst, bij hetzelfde moment staat de laatst opgeslagen bovenaan (zoals in de tijdlijn)
export function getRecentObservations(catObservations, count) {
  return [...catObservations]
    .reverse()
    .sort((a, b) => getSortValue(b) - getSortValue(a))
    .slice(0, count);
}

function addNote(summary, observation) {
  if (observation.note) {
    return `${summary} · ${observation.note}`;
  }
  return summary;
}

// korte samenvatting per type, alleen wat is ingevuld, geen conclusies
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

  return observation.note;
}
