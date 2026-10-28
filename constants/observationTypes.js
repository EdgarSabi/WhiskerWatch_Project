import Colors from "./colors";

// alle observatietypen op één plek
// label wordt ook als type bij de observatie bewaard, dus niet zomaar aanpassen
// screen = naam van het formulier in App.js, icon/tint/ink = icoon en kleuren
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

// onbekend type? Dan een neutrale vervanger, zodat niets crasht op een ontbrekend icoon
export function getObservationType(typeLabel) {
  const type = OBSERVATION_TYPES.find((item) => item.label === typeLabel);

  return type ?? { icon: "paw-outline", tint: Colors.border, ink: Colors.textLight };
}
