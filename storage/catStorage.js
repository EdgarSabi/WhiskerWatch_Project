// Hier staat alles over het lokaal bewaren van katten, op dezelfde manier als
// bij de observaties (zie observationStorage.js).
//
// Elke kat heeft een uniek id. Observaties bewaren dat id (catId), zodat een
// observatie altijd bij de juiste kat hoort, ook als twee katten dezelfde naam hebben.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LARA_PHOTO } from "../helpers/photoHelpers";
import { birthInfoToBirthDate } from "../helpers/catHelpers";

const STORAGE_KEY = "cats";

// "Kat onbekend" is geen echte kat in de lijst, maar wel een keuze in het
// observatieformulier. Observaties daarvoor krijgen dit vaste id.
export const UNKNOWN_CAT = { id: "unknown", name: "Kat onbekend" };

// Lara is de standaard demo-kat. Ze heeft een vast id en staat bovenaan de lijst.
// Haar voorbeeldobservaties staan in demoData.js.
export const LARA_CAT = {
  id: "lara-default",
  name: "Lara",
  initial: "L",
  photoUri: LARA_PHOTO,
  birthDate: "2022-04-04",
};

// Standaardkatten: die gebruiken we zolang er nog niets is opgeslagen.
// Een kat kan daarnaast deze optionele velden hebben (zie CatFormScreen):
// photoUri, birthDate (jaar-maand-dag), weightKg en medicalNote.
const INITIAL_CATS = [
  LARA_CAT,
  { id: "1", name: "Mia", initial: "M" },
  { id: "2", name: "Elsa", initial: "E" },
  { id: "3", name: "Hoop", initial: "H" },
  { id: "5", name: "Billy", initial: "B" },
];

// Katten uit een eerdere versie hebben een vrije tekst als geboortedatum
// (birthInfo). Is dat een datum die we kunnen lezen, zoals "4 april 2022", dan
// maken we er een echte birthDate van.
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
