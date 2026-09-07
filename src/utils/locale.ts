// Stored enum values remain unchanged; only their presentation is localized.
const labels: Record<string, string> = {
  certain: "Zeker",
  probably: "Waarschijnlijk",
  unknown: "Onbekend",
  normal: "Normaal",
  soft: "Zacht",
  diarrhea: "Diarree",
  hard: "Hard",
  small: "Klein",
  medium: "Gemiddeld",
  large: "Groot",
  less: "Minder",
  none: "Geen",
  more: "Meer",
  hiding: "Verstoppen",
  restless: "Onrustig",
  clingy: "Aanhankelijk",
  lethargic: "Sloom",
  pain_signs: "Tekenen van pijn",
  aggressive: "Agressief",
  other: "Anders",
};
export const choiceLabel = (value: string) => labels[value] ?? value;
export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
export const formatNumber = (value: number) =>
  value.toLocaleString("nl-NL", { maximumFractionDigits: 2 });
export const parseWeight = (value: string) => Number(value.replace(",", "."));
