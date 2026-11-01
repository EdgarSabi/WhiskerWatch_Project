import { getSortValue, MONTHS } from "./observationHelpers";

// geboortedatum bewaren we als tekst "2022-04-04", dan kan een tijdzone er niets aan veranderen
// de leeftijd bewaren we niet, die rekenen we steeds uit de datum uit

function pad(number) {
  return String(number).padStart(2, "0");
}

// Date -> "2022-04-04"
export function birthDateToText(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "2022-04-04" -> Date, null bij leeg of ongeldig
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

// "2022-04-04" -> "4 jaar", jonger dan een jaar in maanden
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

// oude katten hebben birthInfo als vrije tekst ("12-03-2021" of "4 april 2022")
// lukt het daar een datum van te maken, dan "2021-03-12", anders null
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

// profielgewicht: het nieuwste uit de Gewicht-observaties van deze kat, anders het gewicht bij de kat zelf
// niets dubbel opgeslagen, dit wordt steeds opnieuw uitgerekend
export function getLatestWeight(cat, catObservations) {
  let latest = null;
  for (const observation of catObservations) {
    if (observation.type !== "Gewicht") {
      continue;
    }
    // >= zodat bij gelijk moment de laatst opgeslagen wint
    if (latest === null || getSortValue(observation) >= getSortValue(latest)) {
      latest = observation;
    }
  }

  if (latest !== null) {
    return latest.weightKg;
  }

  return cat.weightKg ?? null;
}
