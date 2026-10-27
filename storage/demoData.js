// De demo-data: Lara met acht fictieve observaties, zodat de tijdlijn, de filters
// en het dierenartsoverzicht meteen iets laten zien.
//
// LET OP: in de release-versie (branch temporary-release) wordt dit bestand NIET
// meer aangeroepen vanuit App.js. Het blijft staan voor de presentatieversie.
//
// seedDemoData draaide bij het starten van de app (zie App.js), maar deed zijn
// werk maar ÉÉN keer. Daarna staat er een vlag in AsyncStorage. Daardoor:
// - komen de observaties niet bij elke start dubbel terug;
// - blijft Lara weg als je haar verwijdert.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadCats, saveCats, LARA_CAT } from "./catStorage";
import { loadObservations, saveObservations } from "./observationStorage";

const SEEDED_KEY = "demoDataSeeded";

// De placeholder-Lara van vroeger had id "4". Er mag maar één Lara bestaan.
const OLD_LARA_ID = "4";

// Maakt één observatie van Lara, in dezelfde vorm als een gewone observatie.
// daysAgo en hour/minute bepalen het moment (gerekend vanaf nu, zodat de
// observaties altijd binnen de afgelopen drie maanden vallen).
function makeObservation(number, daysAgo, hour, minute, type, fields) {
  const observedAt = new Date();
  observedAt.setDate(observedAt.getDate() - daysAgo);
  observedAt.setHours(hour, minute, 0, 0);

  return {
    id: `demo-lara-${number}`,
    catId: LARA_CAT.id,
    catName: LARA_CAT.name,
    type: type,
    observedAt: observedAt.toISOString(),
    createdAt: observedAt.toLocaleString("nl-NL"),
    ...fields,
  };
}

function makeDemoObservations() {
  return [
    makeObservation(1, 84, 9, 10, "Gewicht", { weightKg: 3.8 }),
    makeObservation(2, 71, 7, 45, "Ontlasting", {
      consistency: "Diarree",
      color: "bruin",
      mucusSeen: "Nee",
      bloodSeen: "Nee",
      outsideLitterBox: "Nee",
      note: "Geen bloed gezien",
      photoUri: null,
    }),
    makeObservation(3, 58, 20, 30, "Braken", {
      vomitKind: "Haarbal",
      note: "Eén keer haarbal",
      photoUri: null,
    }),
    makeObservation(4, 44, 18, 5, "Eten & drinken", {
      intake: "Minder",
      note: "At maar de helft van het avondeten",
    }),
    makeObservation(5, 30, 14, 20, "Gedrag", {
      note: "Verstopt zich meer dan normaal",
    }),
    makeObservation(6, 22, 8, 0, "Medicatie", {
      medicationName: "Voorbeeldmedicatie",
      dosage: "1 tablet per dag",
      note: "",
    }),
    makeObservation(7, 9, 6, 55, "Ontlasting", {
      consistency: "Diarree",
      color: "lichtbruin",
      mucusSeen: "Ja",
      bloodSeen: "Nee",
      outsideLitterBox: "Nee",
      note: "Geen bloed gezien",
      photoUri: null,
    }),
    makeObservation(8, 2, 16, 40, "Algemene notitie", {
      note: "Niest vandaag iets vaker",
      photoUri: null,
    }),
  ];
}

export async function seedDemoData() {
  const alreadySeeded = await AsyncStorage.getItem(SEEDED_KEY);
  if (alreadySeeded !== null) {
    return;
  }

  // Katten: de oude placeholder-Lara weg, en de nieuwe Lara bovenaan zetten als
  // ze er nog niet staat. (Bij een verse installatie staat ze er al.)
  const savedCats = await loadCats();
  const catsWithoutOldLara = savedCats.filter(
    (cat) => !(cat.id === OLD_LARA_ID && cat.name === LARA_CAT.name)
  );
  const removedOldLara = catsWithoutOldLara.length < savedCats.length;

  const hasLara = catsWithoutOldLara.some((cat) => cat.id === LARA_CAT.id);
  const cats = hasLara ? catsWithoutOldLara : [LARA_CAT, ...catsWithoutOldLara];
  await saveCats(cats);

  // Observaties: wat bij de oude Lara hoorde, hoort nu bij de nieuwe. Daarna de
  // voorbeeldobservaties erbij, tenzij ze er al staan.
  const savedObservations = await loadObservations();
  const observations = savedObservations.map((observation) => {
    if (removedOldLara && observation.catId === OLD_LARA_ID) {
      return { ...observation, catId: LARA_CAT.id };
    }
    return observation;
  });

  const hasDemoObservations = observations.some((observation) =>
    observation.id.startsWith("demo-lara-")
  );
  if (!hasDemoObservations) {
    observations.push(...makeDemoObservations());
  }
  await saveObservations(observations);

  // Pas als alles is opgeslagen zetten we de vlag.
  await AsyncStorage.setItem(SEEDED_KEY, "true");
}
