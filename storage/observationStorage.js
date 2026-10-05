// Hier staat alles over het lokaal bewaren van observaties op één plek.
//
// AsyncStorage kan alleen TEKST bewaren (onder een sleutel, zoals "observations").
// Daarom zetten we de lijst met observaties om naar tekst met JSON.stringify
// vóór het opslaan, en terug naar een echte lijst met JSON.parse na het laden.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadCats, UNKNOWN_CAT } from "./catStorage";

const STORAGE_KEY = "observations";

export async function loadObservations() {
  const savedText = await AsyncStorage.getItem(STORAGE_KEY);

  // Bij de allereerste keer is er nog niets opgeslagen: dan geeft getItem null terug.
  if (savedText === null) {
    return [];
  }

  const savedObservations = JSON.parse(savedText);

  // Observaties uit fase 5 hebben nog geen catId. Voor die oude observaties
  // zoeken we de kat met dezelfde naam op, zodat ze toch bij de juiste kat
  // horen. Vinden we geen kat, dan wordt het "Kat onbekend".
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
