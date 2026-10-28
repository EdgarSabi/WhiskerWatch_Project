// observaties lokaal bewaren. AsyncStorage kan alleen tekst, dus JSON.stringify en JSON.parse

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadCats, UNKNOWN_CAT } from "./catStorage";

const STORAGE_KEY = "observations";

export async function loadObservations() {
  const savedText = await AsyncStorage.getItem(STORAGE_KEY);

  // nog niets opgeslagen (getItem geeft dan null)
  if (savedText === null) {
    return [];
  }

  const savedObservations = JSON.parse(savedText);

  // oude observaties hebben soms nog geen catId: kat zoeken op naam, anders Kat onbekend
  const cats = await loadCats();

  return savedObservations.map((observation) => {
    if (observation.catId !== undefined) {
      return observation;
    }

    const matchingCat = cats.find((cat) => cat.name === observation.catName);
    return { ...observation, catId: matchingCat ? matchingCat.id : UNKNOWN_CAT.id };
  });
}

export async function saveObservations(observations) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(observations));
}
