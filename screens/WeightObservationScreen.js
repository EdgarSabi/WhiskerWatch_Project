import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";

function WeightObservationScreen({ route, navigation }) {
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

  const [weightText, setWeightText] = useState(
    observationToEdit ? String(observationToEdit.weightKg).replace(".", ",") : ""
  );

  async function saveHandler() {
    const weightKg = Number(weightText.replace(",", "."));

    if (!selectedCat) {
      Alert.alert("Niet compleet", "Kies eerst een kat.");
      return;
    }

    if (weightText.trim() === "" || isNaN(weightKg) || weightKg <= 0) {
      Alert.alert("Ongeldig gewicht", "Vul het gewicht in kilo's in, bijvoorbeeld 4,2.");
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
            weightKg: weightKg,
            date: date,
          };
        }
        return observation;
      });

      await saveObservations(changedObservations);
    } else {
      // time blijft leeg, zodat de tijdlijn alleen de datum laat zien.
      const newObservation = {
        id: Math.random().toString(),
        catId: selectedCat.id,
        catName: selectedCat.name,
        type: "Gewicht",
        weightKg: weightKg,
        date: date,
        time: "",
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Gewicht voor ${selectedCat.name}: ${String(weightKg).replace(".", ",")} kg.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

        <Text style={styles.label}>Datum</Text>
        <TextInput
          style={styles.input}
          placeholder="bijv. 29-09-2026"
          value={date}
          onChangeText={setDate}
        />

        <Text style={styles.label}>Gewicht (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="bijv. 4,2"
          value={weightText}
          onChangeText={setWeightText}
          keyboardType="decimal-pad"
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

export default WeightObservationScreen;

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
