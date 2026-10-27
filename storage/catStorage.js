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
// Een kat kan daarnaast deze optionele velden hebben (zie CatFormScreen):
// photoUri, birthInfo, weightKg en medicalNote.
const INITIAL_CATS = [
  { id: "1", name: "Mia", initial: "M" },
  { id: "2", name: "Elsa", initial: "E" },
  { id: "3", name: "Hoop", initial: "H" },
  { id: "4", name: "Lara", initial: "L" },
  { id: "5", name: "Billy", initial: "B" },
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
