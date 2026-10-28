// katten lokaal bewaren, net als de observaties
// observaties bewaren het catId van hun kat, dus twee katten met dezelfde naam kan gewoon

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LARA_PHOTO } from "../helpers/photoHelpers";
import { birthInfoToBirthDate } from "../helpers/catHelpers";

const STORAGE_KEY = "cats";

// geen echte kat in de lijst, wel een keuze in de formulieren
export const UNKNOWN_CAT = { id: "unknown", name: "Kat onbekend" };

// demo-kat voor de presentatie, haar observaties staan in demoData.js
export const LARA_CAT = {
  id: "lara-default",
  name: "Lara",
  initial: "L",
  photoUri: LARA_PHOTO,
  birthDate: "2022-04-04",
};

// startkatten zolang er nog niets is opgeslagen
// optionele velden van een kat: photoUri, birthDate (jjjj-mm-dd), weightKg en medicalNote
const INITIAL_CATS = [
  LARA_CAT,
  { id: "1", name: "Mia", initial: "M" },
  { id: "2", name: "Elsa", initial: "E" },
  { id: "3", name: "Hoop", initial: "H" },
  { id: "5", name: "Billy", initial: "B" },
];

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
