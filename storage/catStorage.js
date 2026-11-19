// katten lokaal bewaren, net als de observaties
// observaties bewaren het catId van hun kat, dus twee katten met dezelfde naam kan gewoon

import AsyncStorage from "@react-native-async-storage/async-storage";
import { birthInfoToBirthDate } from "../helpers/catHelpers";

const STORAGE_KEY = "cats";

// geen echte kat in de lijst, wel een keuze in de formulieren
export const UNKNOWN_CAT = { id: "unknown", name: "Kat onbekend" };

// een verse installatie begint zonder katten, je voegt ze zelf toe
// optionele velden van een kat: photoUri, birthDate (jjjj-mm-dd), weightKg en medicalNote
const INITIAL_CATS = [];

// oude katten hebben birthInfo als vrije tekst, probeer daar een echte birthDate van te maken
function migrateCat(cat) {
  if (cat.birthDate || !cat.birthInfo) {
    return cat;
  }

  const birthDate = birthInfoToBirthDate(cat.birthInfo);
  if (birthDate === null) {
    return cat;
  }

  return { ...cat, birthDate: birthDate, birthInfo: "" };
}

export async function loadCats() {
  const savedText = await AsyncStorage.getItem(STORAGE_KEY);

  if (savedText === null) {
    return INITIAL_CATS;
  }

  return JSON.parse(savedText).map(migrateCat);
}

export async function saveCats(cats) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}
