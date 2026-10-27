// Gewone hulpfuncties voor katten: geboortedatum, leeftijd en gewicht. Er zit
// geen state of React in.

import { getSortValue, MONTHS } from "./observationHelpers";

// ---------- Geboortedatum ----------

// De geboortedatum bewaren we als tekst "2022-04-04" (jaar-maand-dag). Zo kan
// een tijdzone er niets aan veranderen. De leeftijd bewaren we NIET: die
// rekenen we steeds uit deze datum uit.

function pad(number) {
  return String(number).padStart(2, "0");
}

// Date -> "2022-04-04"
export function birthDateToText(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "2022-04-04" -> Date. Is de tekst leeg of ongeldig, dan null.
export function parseBirthDate(text) {
  if (!text) {
    return null;
  }

  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match === null) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

// "2022-04-04" -> "4 april 2022"
export function formatBirthDate(text) {
  const date = parseBirthDate(text);
  if (date === null) {
    return "";
  }

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "2022-04-04" -> "4 jaar". Jonger dan een jaar tellen we in maanden.
export function getAgeText(text) {
  const birthDate = parseBirthDate(text);
  if (birthDate === null) {
    return "";
  }

  const now = new Date();
  let months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
  if (now.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  if (months >= 12) {
    return `${Math.floor(months / 12)} jaar`;
  }
  if (months >= 2) {
    return `${months} maanden`;
  }
  if (months === 1) {
    return "1 maand";
  }
  return "Jonger dan 1 maand";
}

// Katten uit een eerdere versie hebben een vrije tekst (birthInfo) zoals
// "12-03-2021" of "4 april 2022". Lukt het om daar een datum van te maken, dan
// geven we "2021-03-12" terug, anders null.
export function birthInfoToBirthDate(text) {
  const numeric = text.match(/^(\d{1,2})\D(\d{1,2})\D(\d{4})$/);
  const written = text.toLowerCase().match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);

  let day;
  let month;
  let year;
  if (numeric !== null) {
    day = Number(numeric[1]);
    month = Number(numeric[2]);
    year = Number(numeric[3]);
  } else if (written !== null) {
    day = Number(written[1]);
    month = MONTHS.indexOf(written[2]) + 1;
    year = Number(written[3]);
  } else {
    return null;
  }

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }

  return `${year}-${pad(month)}-${pad(day)}`;
}

// ---------- Gewicht ----------

// Het gewicht dat het profiel toont: eerst het nieuwste gewicht uit de
// Gewicht-observaties van deze kat, anders het gewicht dat bij de kat zelf is
// ingevuld. We krijgen de observaties van ÉÉN kat binnen. Er wordt niets
// dubbel opgeslagen: dit rekenen we steeds opnieuw uit. Is er niets bekend, dan null.
export function getLatestWeight(cat, catObservations) {
  let latest = null;
  for (const observation of catObservations) {
    if (observation.type !== "Gewicht") {
      continue;
    }
    // >= zodat bij gelijk moment de laatst opgeslagen observatie wint.
    if (latest === null || getSortValue(observation) >= getSortValue(latest)) {
      latest = observation;
    }
  }

  if (latest !== null) {
    return latest.weightKg;
  }

  return cat.weightKg ?? null;
}
