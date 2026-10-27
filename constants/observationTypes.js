import Colors from "./colors";

// Alle observatietypen op één plek, net als de kleuren in colors.js.
// - label: de naam die je ziet en die als "type" bij de observatie wordt bewaard
// - screen: de naam van het formulier-scherm in App.js
// - icon: de naam van het icoon (MaterialCommunityIcons)
// - tint: de zachte achtergrondkleur van het icoon in de tijdlijn en op het profiel
// - ink: de kleur van het icoon zelf
// AddObservationScreen gebruikt dit om naar het juiste formulier te gaan, en
// TimelineScreen gebruikt het om bij "Bewerken" het juiste formulier te openen.
export const OBSERVATION_TYPES = [
  {
    id: "1",
    label: "Ontlasting",
    screen: "PoopObservation",
    icon: "bullseye",
    tint: Colors.avatarGold,
    ink: Colors.inkGold,
  },
  {
    id: "2",
    label: "Braken",
    screen: "VomitObservation",
    icon: "flask-outline",
    tint: Colors.avatarPink,
    ink: Colors.primary,
  },
  {
    id: "3",
    label: "Eten & drinken",
    screen: "FoodObservation",
    icon: "bowl-mix-outline",
    tint: Colors.avatarGreen,
    ink: Colors.inkGreen,
  },
  {
    id: "4",
    label: "Gedrag",
    screen: "BehaviourObservation",
    icon: "message-outline",
    tint: Colors.avatarGold,
    ink: Colors.inkGold,
  },
  {
    id: "5",
    label: "Medicatie",
    screen: "MedicationObservation",
    icon: "pill",
    tint: Colors.avatarPink,
    ink: Colors.primary,
  },
  {
    id: "6",
    label: "Gewicht",
    screen: "WeightObservation",
    icon: "scale-bathroom",
    tint: Colors.avatarPink,
    ink: Colors.primary,
  },
  {
    id: "7",
    label: "Algemene notitie",
    screen: "NoteObservation",
    icon: "text-box-outline",
    tint: Colors.avatarGreen,
    ink: Colors.inkGreen,
  },
];

// Het type bij een label. Is het type onbekend (zou niet moeten), dan een
// neutrale vervanger, zodat een scherm nooit crasht op een ontbrekend icoon.
export function getObservationType(typeLabel) {
  const type = OBSERVATION_TYPES.find((item) => item.label === typeLabel);

  return type ?? { icon: "paw-outline", tint: Colors.border, ink: Colors.textLight };
}
