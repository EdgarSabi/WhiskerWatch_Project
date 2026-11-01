import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import FormLabel from "../components/FormLabel";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

function WeightObservationScreen({ route, navigation }) {
  const observationToEdit = route.params?.observation ?? null;

  const insets = useSafeAreaInsets();
  const [isSaving, setIsSaving] = useState(false);

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
  const [observedAt, setObservedAt] = useState(getInitialObservedAt(observationToEdit));

  const [weightText, setWeightText] = useState(
    observationToEdit ? String(observationToEdit.weightKg).replace(".", ",") : ""
  );

  async function saveHandler() {
    const weightKg = Number(weightText.replace(",", "."));

    if (!selectedCat) {
      Alert.alert("Nog niet alles ingevuld", "Kies een kat.");
      return;
    }

    if (weightText.trim() === "" || isNaN(weightKg) || weightKg <= 0) {
      Alert.alert("Vul een geldig gewicht in", "Gebruik cijfers, bijvoorbeeld 4,2.");
      return;
    }

    if (isSaving) {
      return;
    }
    setIsSaving(true);

    const currentObservations = await loadObservations();

    if (observationToEdit) {
      const changedObservations = currentObservations.map((observation) => {
        if (observation.id === observationToEdit.id) {
          return {
            ...observation,
            catId: selectedCat.id,
            catName: selectedCat.name,
            weightKg: weightKg,
            observedAt: observedAt.toISOString(),
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
        type: "Gewicht",
        weightKg: weightKg,
        observedAt: observedAt.toISOString(),
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert(
      "Observatie opgeslagen",
      `Gewicht van ${selectedCat.name} (${String(weightKg).replace(".", ",")} kg) is opgeslagen.`,
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormLabel text="Kat" tag="required" />
        <View style={styles.pillRow}>
          {[...cats, UNKNOWN_CAT].map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedCat(option)}
              style={[
                styles.pill,
                option.id === UNKNOWN_CAT.id && styles.pillDashed,
                selectedCat?.id === option.id && styles.pillSelected,
              ]}
            >
              <Text
                style={[styles.pillText, selectedCat?.id === option.id && styles.pillTextSelected]}
              >
                {option.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <DateTimeFields value={observedAt} onValueChange={setObservedAt} isNew={!observationToEdit} />

        <FormLabel text="Gewicht (kg)" tag="required" />
        <TextInput
          style={styles.input}
          placeholder="Bijv. 4,2"
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
  pillDashed: {
    borderStyle: "dashed",
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
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
