import { choiceLabel, parseWeight } from "../utils/locale";
import React, { useRef, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Page, Field, Choices, Button, styles, colors } from "../components/ui";
import { PhotoPicker, TypeSelector, ConfidenceSelector } from "../components";
import { CatConfidence, Observation, ObservationType } from "../types";
import { ScreenProps } from "../types/navigation";
import { useData } from "../storage/DataProvider";
import { newId } from "../storage";
import { typeLabels } from "../utils/observations";
import { CatSelector, ToggleField } from "../components/form-controls";
import { parseLocalDateTime } from "../utils/dates";
export default function AddObservationScreen({
  navigation,
  route,
}: ScreenProps<"AddObservation">) {
  const { cats, saveObservation } = useData();
  const [showTypes, setShowTypes] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const saving = useRef(false);
  const [catId, setCatId] = useState(route.params?.catId ?? ""),
    [confidence, setConfidence] = useState<CatConfidence>("certain"),
    [type, setType] = useState<ObservationType>("poop"),
    [notes, setNotes] = useState(""),
    [photoUri, setPhoto] = useState<string>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [consistency, setConsistentie] =
      useState<NonNullable<Observation["poop"]>["consistency"]>("unknown"),
    [color, setColor] = useState(""),
    [mucus, setMucus] = useState(false),
    [blood, setBlood] = useState(false),
    [outside, setOutside] = useState(false);
  const [amount, setAmount] =
      useState<NonNullable<Observation["vomit"]>["amount"]>("unknown"),
    [containsFood, setContainsFood] = useState(false),
    [containsHair, setContainsHair] = useState(false);
  const [appetite, setAppetite] =
      useState<NonNullable<Observation["foodDrink"]>["appetite"]>("unknown"),
    [drinking, setDrinking] =
      useState<NonNullable<Observation["foodDrink"]>["drinking"]>("unknown"),
    [foodName, setFoodName] = useState(""),
    [tags, setTags] = useState<string[]>([]),
    [medicationName, setMedicationName] = useState(""),
    [dosage, setDosage] = useState(""),
    [givenAt, setGivenAt] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }),
    [weight, setWeight] = useState("");
  async function save() {
    if (saving.current) return;
    setError("");
    if (
      type === "weight" &&
      (!Number.isFinite(parseWeight(weight)) || parseWeight(weight) <= 0)
    )
      return setError("Vul een gewicht groter dan nul in, in kg.");
    if (
      type === "medication" &&
      (!medicationName.trim() || !parseLocalDateTime(givenAt))
    )
      return setError(
        "Vul de medicatienaam en een geldige datum en tijd in (JJJJ-MM-DD UU:mm).",
      );
    if (["photo_note", "other"].includes(type) && !notes.trim() && !photoUri)
      return setError("Voeg een notitie of foto toe aan deze observatie.");
    saving.current = true;
    setBusy(true);
    try {
      const o: Observation = {
        id: newId(),
        catId: catId || undefined,
        catNameSnapshot: cats.find((c) => c.id === catId)?.name,
        confidence: catId ? confidence : "unknown",
        type,
        createdAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        photoUri,
      };
      if (type === "poop")
        o.poop = {
          consistency,
          color: color.trim() || undefined,
          mucus,
          blood,
          outsideLitterBox: outside,
        };
      if (type === "vomit") o.vomit = { amount, containsFood, containsHair };
      if (type === "food_drink")
        o.foodDrink = {
          appetite,
          drinking,
          foodName: foodName.trim() || undefined,
        };
      if (type === "behavior") o.behavior = { tags };
      if (type === "medication")
        o.medication = {
          medicationName: medicationName.trim(),
          dosage: dosage.trim() || undefined,
          givenAt: parseLocalDateTime(givenAt)!.toISOString(),
        };
      if (type === "weight") o.weight = { valueKg: parseWeight(weight) };
      await saveObservation(o);
      navigation.goBack();
    } catch {
      setError(
        "Je observatie kon niet worden opgeslagen. Probeer het opnieuw.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <Page
      footer={
        <View style={{ gap: 8 }}>
          {!!error && (
            <Text accessibilityRole="alert" style={styles.text}>
              {error}
            </Text>
          )}
          <Text style={styles.muted}>
            {catId
              ? `${confidence === "probably" ? "Waarschijnlijk " : confidence === "unknown" ? "Onzeker · " : ""}${cats.find((c) => c.id === catId)?.name}`
              : "Kat onbekend"}{" "}
            · {type === "poop" ? choiceLabel(consistency) : typeLabels[type]} ·
            Nu
          </Text>
          <Button
            title={
              busy
                ? "Bezig met opslaan…"
                : type === "poop"
                  ? "Sla ontlasting op"
                  : "Sla op"
            }
            disabled={busy}
            onPress={save}
          />
        </View>
      }
    >
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <Text style={styles.heading}>{typeLabels[type]}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showTypes }}
          onPress={() => setShowTypes(!showTypes)}
          style={{ padding: 12, minHeight: 44 }}
        >
          <Text style={{ color: colors.primary, fontWeight: "600" }}>
            {showTypes ? "Sluit soorten" : "Wijzig soort"}
          </Text>
        </Pressable>
      </View>
      {showTypes && (
        <TypeSelector
          value={type}
          onChange={(next) => {
            setType(next);
            setShowTypes(false);
          }}
        />
      )}
      <CatSelector cats={cats} value={catId} onChange={setCatId} />
      {!!catId && (
        <ConfidenceSelector value={confidence} onChange={setConfidence} />
      )}
      {type === "poop" && (
        <View style={styles.card}>
          <Choices
            label="Consistentie"
            options={["normal", "soft", "diarrhea", "hard", "unknown"]}
            value={consistency}
            onChange={setConsistentie}
          />
          <ToggleField label="Slijm gezien" value={mucus} onChange={setMucus} />
          <ToggleField label="Bloed gezien" value={blood} onChange={setBlood} />
          <ToggleField
            label="Buiten de kattenbak"
            value={outside}
            onChange={setOutside}
          />
        </View>
      )}
      {type === "vomit" && (
        <View style={styles.card}>
          <Choices
            label="Hoeveelheid"
            options={["small", "medium", "large", "unknown"]}
            value={amount}
            onChange={setAmount}
          />
          <ToggleField
            label="Bevat voedsel"
            value={containsFood}
            onChange={setContainsFood}
          />
          <ToggleField
            label="Bevat haar"
            value={containsHair}
            onChange={setContainsHair}
          />
        </View>
      )}
      {type === "food_drink" && (
        <View style={styles.card}>
          <Choices
            label="Eetlust"
            options={["normal", "less", "none", "more", "unknown"]}
            value={appetite}
            onChange={setAppetite}
          />
          <Choices
            label="Drinken"
            options={["normal", "less", "more", "unknown"]}
            value={drinking}
            onChange={setDrinking}
          />
          <Field
            label="Voeding (optioneel)"
            value={foodName}
            onChangeText={setFoodName}
          />
        </View>
      )}
      {type === "behavior" && (
        <View style={styles.card}>
          <Text style={styles.label}>Selecteer wat je opvalt</Text>
          {[
            "hiding",
            "restless",
            "clingy",
            "lethargic",
            "pain_signs",
            "aggressive",
            "normal",
            "other",
          ].map((t) => (
            <View key={t}>
              <ToggleField
                label={choiceLabel(t)}
                value={tags.includes(t)}
                onChange={(checked) =>
                  setTags(checked ? [...tags, t] : tags.filter((v) => v !== t))
                }
              />
            </View>
          ))}
        </View>
      )}
      {type === "medication" && (
        <View style={styles.card}>
          <Field
            label="Naam medicatie *"
            value={medicationName}
            onChangeText={setMedicationName}
          />
          <Field
            label="Dosering (optioneel)"
            value={dosage}
            onChangeText={setDosage}
          />
          <Field
            label="Gegeven op (JJJJ-MM-DD UU:mm, lokale tijd) *"
            value={givenAt}
            onChangeText={setGivenAt}
          />
        </View>
      )}
      {type === "weight" && (
        <Field
          label="Gewicht (kg) *"
          value={weight}
          onChangeText={setWeight}
          numeric
        />
      )}
      {type === "poop" && (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showDetails }}
          onPress={() => setShowDetails(!showDetails)}
          style={{
            padding: 14,
            minHeight: 48,
            borderRadius: 14,
            backgroundColor: colors.soft,
          }}
        >
          <Text style={styles.text}>
            {showDetails
              ? "− Verberg extra details"
              : "+ Kleur, notitie of foto"}
            {!showDetails && (color || notes || photoUri) ? " · Ingevuld" : ""}
          </Text>
        </Pressable>
      )}
      {(type !== "poop" || showDetails) && (
        <View style={{ gap: 18 }}>
          {type === "poop" && (
            <Field
              label="Kleur (optioneel)"
              value={color}
              onChangeText={setColor}
            />
          )}
          <Field
            label="Notitie (optioneel)"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Wat wil je nog onthouden?"
          />
          <PhotoPicker uri={photoUri} onChange={setPhoto} />
        </View>
      )}
    </Page>
  );
}
