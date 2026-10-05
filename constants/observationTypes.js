// Alle observatietypen op één plek, net als de kleuren in colors.js.
// - label: de naam die je ziet en die als "type" bij de observatie wordt bewaard
// - screen: de naam van het formulier-scherm in App.js
// AddObservationScreen gebruikt dit om naar het juiste formulier te gaan, en
// TimelineScreen gebruikt het om bij "Bewerken" het juiste formulier te openen.
export const OBSERVATION_TYPES = [
  { id: "1", label: "Ontlasting", screen: "PoopObservation" },
  { id: "2", label: "Braken", screen: "VomitObservation" },
  { id: "3", label: "Eten & drinken", screen: "FoodObservation" },
  { id: "4", label: "Gedrag", screen: "BehaviourObservation" },
  { id: "5", label: "Medicatie", screen: "MedicationObservation" },
  { id: "6", label: "Gewicht", screen: "WeightObservation" },
  { id: "7", label: "Algemene notitie", screen: "NoteObservation" },
];
