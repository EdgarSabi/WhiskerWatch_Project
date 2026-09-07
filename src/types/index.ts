export type Cat = {
  id: string;
  name: string;
  birthDate?: string;
  weight?: number;
  photoUri?: string;
  medicalNotes?: string;
  normalFood?: string;
  createdAt: string;
  updatedAt: string;
};
export type ObservationType =
  | "poop"
  | "vomit"
  | "food_drink"
  | "behavior"
  | "medication"
  | "weight"
  | "photo_note"
  | "other";
export type CatConfidence = "certain" | "probably" | "unknown";
export type Observation = {
  id: string;
  catId?: string;
  catNameSnapshot?: string;
  confidence: CatConfidence;
  type: ObservationType;
  createdAt: string;
  notes?: string;
  photoUri?: string;
  poop?: {
    consistency: "normal" | "soft" | "diarrhea" | "hard" | "unknown";
    color?: string;
    mucus?: boolean;
    blood?: boolean;
    outsideLitterBox?: boolean;
  };
  vomit?: {
    amount: "small" | "medium" | "large" | "unknown";
    containsFood?: boolean;
    containsHair?: boolean;
  };
  foodDrink?: {
    appetite: "normal" | "less" | "none" | "more" | "unknown";
    drinking: "normal" | "less" | "more" | "unknown";
    foodName?: string;
  };
  behavior?: { tags: string[] };
  medication?: { medicationName: string; dosage?: string; givenAt: string };
  weight?: { valueKg: number };
};
export type Period = "all" | "7" | "30";
export type Filters = {
  catId?: string;
  type?: ObservationType;
  period?: Period;
};
