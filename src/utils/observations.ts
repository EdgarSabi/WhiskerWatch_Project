import { choiceLabel, formatDateTime, formatNumber } from "./locale";
import { Filters, Observation, ObservationType, Period } from "../types";
export const typeLabels: Record<ObservationType, string> = {
  poop: "Ontlasting",
  vomit: "Braken",
  food_drink: "Eten & drinken",
  behavior: "Gedrag",
  medication: "Medicatie",
  weight: "Gewicht",
  photo_note: "Foto / notitie",
  other: "Anders",
};
export const typeIcons: Record<ObservationType, string> = {
  poop: "◉",
  vomit: "≈",
  food_drink: "◡",
  behavior: "♡",
  medication: "✚",
  weight: "⚖",
  photo_note: "▧",
  other: "•••",
};
export function filterObservations(
  items: Observation[],
  filters: Filters,
  now = Date.now(),
) {
  const cutoff =
    filters.period && filters.period !== "all"
      ? now - Number(filters.period) * 86400000
      : -Infinity;
  return items
    .filter(
      (o) =>
        (!filters.catId ||
          (filters.catId === "unknown"
            ? !o.catId
            : o.catId === filters.catId)) &&
        (!filters.type || o.type === filters.type) &&
        Date.parse(o.createdAt) >= cutoff,
    )
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
export function observationSummary(o: Observation) {
  if (o.poop)
    return [
      choiceLabel(o.poop.consistency),
      o.poop.color,
      o.poop.blood && "bloed gezien",
      o.poop.mucus && "slijm",
      o.poop.outsideLitterBox && "buiten de kattenbak",
    ]
      .filter(Boolean)
      .join(" · ");
  if (o.vomit)
    return [
      choiceLabel(o.vomit.amount),
      o.vomit.containsFood && "bevat voedsel",
      o.vomit.containsHair && "bevat haar",
    ]
      .filter(Boolean)
      .join(" · ");
  if (o.foodDrink)
    return `Eetlust: ${choiceLabel(o.foodDrink.appetite)} · Drinken: ${choiceLabel(o.foodDrink.drinking)}${o.foodDrink.foodName ? " · " + o.foodDrink.foodName : ""}`;
  if (o.behavior)
    return (
      o.behavior.tags.map((t) => choiceLabel(t)).join(" · ") ||
      "Gedragsobservatie"
    );
  if (o.medication)
    return `${o.medication.medicationName}${o.medication.dosage ? " · " + o.medication.dosage : ""} · Gegeven op ${formatDateTime(o.medication.givenAt)}`;
  if (o.weight) return `${formatNumber(o.weight.valueKg)} kg`;
  return typeLabels[o.type];
}
export function generateVetSummary(
  observations: Observation[],
  catId: string | undefined,
  period: Period,
  now = Date.now(),
) {
  const items = filterObservations(observations, { catId, period }, now);
  const countByType = Object.fromEntries(
    Object.keys(typeLabels).map((t) => [
      t,
      items.filter((o) => o.type === t).length,
    ]),
  ) as Record<ObservationType, number>;
  const weights = items.filter((o) => o.weight).reverse();
  const important = items.filter(
    (o) =>
      o.poop?.blood ||
      o.poop?.consistency === "diarrhea" ||
      o.foodDrink?.appetite === "none" ||
      (o.type === "vomit" &&
        !!o.catId &&
        items.some(
          (other) =>
            other.id !== o.id &&
            other.type === "vomit" &&
            other.catId === o.catId &&
            Math.abs(Date.parse(other.createdAt) - Date.parse(o.createdAt)) <=
              86400000,
        )),
  );
  return {
    items,
    total: items.length,
    countByType,
    softDiarrheaCount: items.filter((o) =>
      ["soft", "diarrhea"].includes(o.poop?.consistency ?? ""),
    ).length,
    vomitCount: countByType.vomit,
    appetiteChangeCount: items.filter((o) =>
      ["less", "none", "more"].includes(o.foodDrink?.appetite ?? ""),
    ).length,
    medicationCount: countByType.medication,
    weights,
    weightTrend:
      catId && catId !== "unknown" && weights.length > 1
        ? weights.at(-1)!.weight!.valueKg - weights[0].weight!.valueKg
        : undefined,
    important,
  };
}
