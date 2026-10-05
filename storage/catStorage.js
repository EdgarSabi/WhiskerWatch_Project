// Hier staat alles over het lokaal bewaren van katten, op dezelfde manier als
// bij de observaties (zie observationStorage.js).
//
// Elke kat heeft een uniek id. Observaties bewaren dat id (catId), zodat een
// observatie altijd bij de juiste kat hoort, ook als twee katten dezelfde naam hebben.

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "cats";

// "Kat onbekend" is geen echte kat in de lijst, maar wel een keuze in het
// observatieformulier. Observaties daarvoor krijgen dit vaste id.
export const UNKNOWN_CAT = { id: "unknown", name: "Kat onbekend" };

// Placeholder katjes: die gebruiken we zolang er nog niets is opgeslagen.
const INITIAL_CATS = [
  { id: "1", name: "Mia", initial: "M", lastObservation: "Laatst: Eten & drinken · 2u geleden" },
  { id: "2", name: "Elsa", initial: "E", lastObservation: "Nog geen observaties" },
  { id: "3", name: "Hoop", initial: "H", lastObservation: "Laatst: Gedrag · 3 dagen geleden" },
  { id: "4", name: "Lara", initial: "L", lastObservation: "Laatst: Gewicht · 5 dagen geleden" },
  { id: "5", name: "Billy", initial: "B", lastObservation: "Nog geen observaties" },
];

export async function loadCats() {
  const savedText = await AsyncStorage.getItem(STORAGE_KEY);

  if (savedText === null) {
    return INITIAL_CATS;
  }

  return JSON.parse(savedText);
}

export async function saveCats(cats) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}
