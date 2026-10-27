//wellicht hier nog wat opties toevoegen voor soorten gedrag dat vreemd is? 
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "../constants/colors";
import { loadObservations, saveObservations } from "../storage/observationStorage";
import { loadCats, UNKNOWN_CAT } from "../storage/catStorage";
import DateTimeFields from "../components/DateTimeFields";
import { getInitialObservedAt } from "../helpers/observationHelpers";

function BehaviourObservationScreen({ route, navigation }) {
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
  const [observedAt, setObservedAt] = useState(getInitialObservedAt(observationToEdit));
  const [note, setNote] = useState(observationToEdit?.note ?? "");

  async function saveHandler() {
    // Kat en beschrijving zijn verplicht. Datum en tijd staan altijd ingevuld.
    if (!selectedCat || note.trim() === "") {
      Alert.alert("Niet compleet", "Kies in elk geval een kat en beschrijf wat je zag.");
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
            observedAt: observedAt.toISOString(),
            note: note.trim(),
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
        type: "Gedrag",
        observedAt: observedAt.toISOString(),
        note: note.trim(),
        createdAt: new Date().toLocaleString("nl-NL"),
      };

      await saveObservations([...currentObservations, newObservation]);
    }

    Alert.alert("Observatie opgeslagen", `Gedrag voor ${selectedCat.name} is opgeslagen.`, [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
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

        <DateTimeFields value={observedAt} onChange={setObservedAt} isNew={!observationToEdit} />

        <Text style={styles.label}>Wat zag je?</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Bijvoorbeeld: verstopt zich meer dan normaal"
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

export default BehaviourObservationScreen;

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
    minHeight: 120,
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
