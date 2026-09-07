import { parseWeight } from "../utils/locale";
import React, { useState } from "react";
import { Text } from "react-native";
import { Page, Field, Button, styles } from "../components/ui";
import { PhotoPicker } from "../components";
import { useData } from "../storage/DataProvider";
import { newId } from "../storage";
import { ScreenProps } from "../types/navigation";
export default function AddCatScreen({
  navigation,
  route,
}: ScreenProps<"AddCat">) {
  const { cats, saveCat } = useData();
  const existing = cats.find((c) => c.id === route.params?.catId);
  const [name, setName] = useState(existing?.name ?? ""),
    [birthDate, setBirthDate] = useState(existing?.birthDate ?? ""),
    [weight, setWeight] = useState(existing?.weight?.toString() ?? ""),
    [photoUri, setPhoto] = useState(existing?.photoUri),
    [medicalNotes, setNotes] = useState(existing?.medicalNotes ?? ""),
    [normalFood, setFood] = useState(existing?.normalFood ?? ""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function save() {
    if (!name.trim()) return setError("Vul de naam van je kat in.");
    if (
      weight &&
      (!Number.isFinite(parseWeight(weight)) || parseWeight(weight) <= 0)
    )
      return setError("Vul een gewicht groter dan nul in.");
    if (
      birthDate &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
        Number.isNaN(Date.parse(birthDate)) ||
        new Date(birthDate).toISOString().slice(0, 10) !== birthDate ||
        Date.parse(birthDate) > Date.now())
    )
      return setError(
        "Vul een geldige geboortedatum in (JJJJ-MM-DD), vandaag of eerder.",
      );
    setBusy(true);
    try {
      const date = new Date().toISOString();
      await saveCat({
        id: existing?.id ?? newId(),
        name: name.trim(),
        birthDate: birthDate || undefined,
        weight: weight ? parseWeight(weight) : undefined,
        photoUri,
        medicalNotes: medicalNotes.trim() || undefined,
        normalFood: normalFood.trim() || undefined,
        createdAt: existing?.createdAt ?? date,
        updatedAt: date,
      });
      navigation.goBack();
    } catch {
      setError("Opslaan is niet gelukt. Probeer het opnieuw.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page>
      <Text style={styles.title}>
        {existing ? "Over " + existing.name : "Kat toevoegen"}
      </Text>
      <Text style={styles.muted}>
        Alleen een naam is nodig. De rest kan later.
      </Text>
      <PhotoPicker uri={photoUri} onChange={setPhoto} />
      <Field label="Naam *" value={name} onChangeText={setName} />
      <Field
        label="Geboortedatum (JJJJ-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="Optioneel"
      />
      <Field
        label="Gewicht (kg)"
        value={weight}
        onChangeText={setWeight}
        numeric
      />
      <Field
        label="Gebruikelijke voeding"
        value={normalFood}
        onChangeText={setFood}
      />
      <Field
        label="Medische notities"
        value={medicalNotes}
        onChangeText={setNotes}
        multiline
      />
      {!!error && (
        <Text accessibilityRole="alert" style={styles.text}>
          {error}
        </Text>
      )}
      <Button
        title={busy ? "Bezig met opslaan…" : "Sla op"}
        disabled={busy}
        onPress={save}
      />
    </Page>
  );
}
