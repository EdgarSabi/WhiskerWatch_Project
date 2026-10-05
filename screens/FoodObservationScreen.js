// FoodObservationScreen is het formulier voor een eten & drinken-observatie.
// Zelfde opbouw als PoopObservationScreen: kat kiezen, datum en tijd, een keuze,
// optionele notitie en opslaan (nieuw of bewerken).

import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";

const INTAKE_OPTIONS = ["Normaal", "Minder", "Meer", "Niet gegeten", "Niet gedronken"];

function FoodObservationScreen({ route, navigation }) {
  // Alleen gevuld als je vanuit de tijdlijn op "Bewerken" tikt.
  const observationToEdit = route.params?.observation ?? null;

  const insets = useSafeAreaInsets();

  let preselectedCat = route.params?.cat ?? null;
  if (observationToEdit) {
    preselectedCat = { id: observationToEdit.catId, name: observationToEdit.catName };
  }

  const [cats, setCats] = useState([]);

  useEffect(() => {
    async function loadSavedCats() {
      const savedCats = await loadCats();
      setCats(savedCats);
    }

    loadSavedCats();
  }, []);

  const [selectedCat, setSelectedCat] = useState(preselectedCat);
  const [date, setDate] = useState(observationToEdit?.date ?? "");
  const [time, setTime] = useState(observationToEdit?.time ?? "");
  const [intake, setIntake] = useState(observationToEdit?.intake ?? null);

  // Optioneel veld
  const [note, setNote] = useState(observationToEdit?.note ?? "");

  async function saveHandler() {
    // Kat en keuze zijn verplicht, de rest is optioneel.
    if (!selectedCat || !intake) {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en hoe het eten en drinken ging.");
      return;
    }

    const currentObservations = await loadObservations();

    if (observationToEdit) {
      const changedObservations = currentObservations.map((observation) => {
        if (observation.id === observationToEdit.id) {
          return {
            ...observation,
            catId: selectedCat.id,
            catName: selectedCat.name,
            intake: intake,
            date: date,
            time: time,
            note: note,
          };
        }
        return observation;
      });

      await saveObservations(changedObservations);
    } else {
      const newObservation = {
        id: Math.random().toString(),
        catId: selectedCat.id,
        catName: selectedCat.name,
        type: "Eten & drinken",
        intake: intake,
        date: date,
        time: time,
        note: note,
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Eten & drinken voor ${selectedCat.name}: ${intake}.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Kat</Text>
        <View style={styles.pillRow}>
          {[...cats, UNKNOWN_CAT].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedCat(option)}
              style={[styles.pill, selectedCat?.id === option.id && styles.pillSelected]}
            >
              <Text
                style={[styles.pillText, selectedCat?.id === option.id && styles.pillTextSelected]}
              >
                {option.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Datum</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. 29-09-2026"
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Tijd</Text>
            <TextInput
              style={styles.input}
              placeholder="bijv. 14:32"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        <Text style={styles.label}>Eten en drinken</Text>
        <View style={styles.pillRow}>
          {INTAKE_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setIntake(option)}
              style={[styles.pill, intake === option && styles.pillSelected]}
            >
              <Text style={[styles.pillText, intake === option && styles.pillTextSelected]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Optioneel</Text>

        <Text style={styles.label}>Notitie</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Extra opmerking (optioneel)"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        onPress={saveHandler}
      >
        <Text style={styles.saveButtonText}>Opslaan</Text>
      </Pressable>
    </View>
  );
}

export default FoodObservationScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textLight,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.text,
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    margin: 16,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
